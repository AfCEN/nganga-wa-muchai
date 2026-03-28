from uuid import uuid4
import secrets

from fastapi import APIRouter, Depends, HTTPException
from neo4j import AsyncSession

from ..auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from ..db import get_session
from ..models.user import TokenResponse, UserCreate, UserLogin, UserResponse
from ..models.invite import InviteCreate, InviteResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_from_record(record) -> dict:
    u = dict(record["u"])
    return {
        "id": u["id"],
        "email": u["email"],
        "displayName": u["displayName"],
        "role": u.get("role", "member"),
        "createdAt": str(u["createdAt"]) if u.get("createdAt") else None,
    }


# ── Setup: first user becomes admin (only works when no users exist) ──

@router.get("/setup-status")
async def setup_status(session: AsyncSession = Depends(get_session)):
    """Check if setup is needed (no users exist yet)."""
    result = await session.run("MATCH (u:User) RETURN count(u) as count")
    record = await result.single()
    return {"needsSetup": record["count"] == 0}


@router.post("/setup", response_model=TokenResponse, status_code=201)
async def setup(data: UserCreate, session: AsyncSession = Depends(get_session)):
    """Create the first admin user. Only works when no users exist."""
    result = await session.run("MATCH (u:User) RETURN count(u) as count")
    record = await result.single()
    if record["count"] > 0:
        raise HTTPException(400, "Setup already completed. Use an invite to join.")

    user_id = f"u_{uuid4().hex[:10]}"
    hashed = hash_password(data.password)

    result = await session.run(
        """
        CREATE (u:User {
            id: $id, email: $email, hashedPassword: $hashed,
            displayName: $displayName, role: "admin",
            createdAt: datetime()
        })
        RETURN u
        """,
        id=user_id,
        email=data.email,
        hashed=hashed,
        displayName=data.displayName,
    )
    record = await result.single()
    user = _user_from_record(record)
    token = create_access_token(user_id)

    return TokenResponse(access_token=token, user=UserResponse(**user))


# ── Invite-based signup ──

class SignupWithInvite(UserCreate):
    inviteCode: str


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(data: SignupWithInvite, session: AsyncSession = Depends(get_session)):
    """Register with a valid invite code."""
    # Validate invite code
    invite_result = await session.run(
        "MATCH (i:Invite {code: $code}) RETURN i",
        code=data.inviteCode,
    )
    invite_record = await invite_result.single()
    if not invite_record:
        raise HTTPException(400, "Invalid invite code")

    # Check if invite is for a specific email
    invite = dict(invite_record["i"])
    if invite.get("email") and invite["email"] != data.email:
        raise HTTPException(400, "This invite was sent to a different email address")

    # Check email uniqueness
    existing = await session.run(
        "MATCH (u:User {email: $email}) RETURN u", email=data.email
    )
    if await existing.single():
        raise HTTPException(400, "Email already registered")

    user_id = f"u_{uuid4().hex[:10]}"
    hashed = hash_password(data.password)

    result = await session.run(
        """
        CREATE (u:User {
            id: $id, email: $email, hashedPassword: $hashed,
            displayName: $displayName, role: "member",
            createdAt: datetime()
        })
        RETURN u
        """,
        id=user_id,
        email=data.email,
        hashed=hashed,
        displayName=data.displayName,
    )
    record = await result.single()

    # Track usage count
    await session.run(
        "MATCH (i:Invite {code: $code}) SET i.useCount = coalesce(i.useCount, 0) + 1",
        code=data.inviteCode,
    )

    user = _user_from_record(record)
    token = create_access_token(user_id)

    return TokenResponse(access_token=token, user=UserResponse(**user))


# ── Login ──

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, session: AsyncSession = Depends(get_session)):
    result = await session.run(
        "MATCH (u:User {email: $email}) RETURN u", email=data.email
    )
    record = await result.single()
    if not record:
        raise HTTPException(401, "Invalid email or password")

    u = dict(record["u"])
    if not verify_password(data.password, u["hashedPassword"]):
        raise HTTPException(401, "Invalid email or password")

    user = _user_from_record(record)
    token = create_access_token(u["id"])

    return TokenResponse(access_token=token, user=UserResponse(**user))


@router.post("/refresh", response_model=TokenResponse)
async def refresh(current_user: dict = Depends(get_current_user)):
    token = create_access_token(current_user["id"])
    return TokenResponse(access_token=token, user=UserResponse(**current_user))


@router.get("/me", response_model=UserResponse)
async def me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    updates: dict,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    allowed = {}
    if "displayName" in updates:
        allowed["displayName"] = updates["displayName"]
    if "password" in updates:
        allowed["hashedPassword"] = hash_password(updates["password"])

    if not allowed:
        raise HTTPException(400, "No valid fields to update")

    set_clauses = ", ".join(f"u.{k} = ${k}" for k in allowed)
    query = f"MATCH (u:User {{id: $id}}) SET {set_clauses} RETURN u"
    result = await session.run(query, id=current_user["id"], **allowed)
    record = await result.single()
    user = _user_from_record(record)
    return UserResponse(**user)


# ── Invite management ──

@router.post("/invites", response_model=InviteResponse, status_code=201)
async def create_invite(
    data: InviteCreate,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Generate an invite code. Any authenticated member can invite."""
    invite_id = f"inv_{uuid4().hex[:10]}"
    code = secrets.token_urlsafe(8)

    result = await session.run(
        """
        CREATE (i:Invite {
            id: $id, code: $code, createdBy: $createdBy,
            email: $email, used: false,
            createdAt: datetime()
        })
        RETURN i
        """,
        id=invite_id,
        code=code,
        createdBy=current_user["id"],
        email=data.email,
    )
    record = await result.single()
    inv = dict(record["i"])

    return InviteResponse(
        id=inv["id"],
        code=inv["code"],
        createdBy=current_user["id"],
        createdByName=current_user["displayName"],
        email=inv.get("email"),
        used=inv["used"],
        createdAt=str(inv["createdAt"]) if inv.get("createdAt") else None,
    )


@router.get("/invites", response_model=list[InviteResponse])
async def list_invites(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """List invites created by the current user."""
    result = await session.run(
        "MATCH (i:Invite {createdBy: $userId}) RETURN i ORDER BY i.createdAt DESC",
        userId=current_user["id"],
    )
    invites = []
    async for record in result:
        inv = dict(record["i"])
        invites.append(InviteResponse(
            id=inv["id"],
            code=inv["code"],
            createdBy=current_user["id"],
            createdByName=current_user["displayName"],
            email=inv.get("email"),
            used=inv.get("used", False),
            usedBy=inv.get("usedBy"),
            createdAt=str(inv["createdAt"]) if inv.get("createdAt") else None,
        ))
    return invites


# ── Admin endpoints ──

@router.get("/users", response_model=list[UserResponse])
async def list_users(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """List all users. Admin only."""
    if current_user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")

    result = await session.run("MATCH (u:User) RETURN u ORDER BY u.createdAt DESC")
    users = []
    async for record in result:
        users.append(UserResponse(**_user_from_record(record)))
    return users


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    body: dict,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Change a user's role. Admin only."""
    if current_user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")

    role = body.get("role")
    if role not in ("member", "admin"):
        raise HTTPException(400, "Role must be 'member' or 'admin'")

    result = await session.run(
        "MATCH (u:User {id: $id}) SET u.role = $role RETURN u",
        id=user_id, role=role,
    )
    record = await result.single()
    if not record:
        raise HTTPException(404, "User not found")
    return UserResponse(**_user_from_record(record))
