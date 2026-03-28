from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from neo4j import AsyncSession

from ..auth import get_current_user
from ..db import get_session
from ..models.person import PersonCreate, PersonResponse, PersonUpdate

router = APIRouter(prefix="/api/people", tags=["people"])


def _person_from_record(record) -> dict:
    p = dict(record["p"])
    return {
        "id": p.get("id", ""),
        "name": p.get("name", ""),
        "birthYear": p.get("birthYear"),
        "deathYear": p.get("deathYear"),
        "generation": p.get("generation", 1),
        "location": p.get("location", ""),
        "bio": p.get("bio", ""),
        "role": p.get("role", ""),
        "photo": p.get("photo"),
        "stories": [],
        "createdBy": p.get("createdBy", ""),
        "createdAt": str(p["createdAt"]) if p.get("createdAt") else None,
    }


@router.get("", response_model=list[PersonResponse])
async def list_people(session: AsyncSession = Depends(get_session)):
    result = await session.run(
        "MATCH (p:Person) RETURN p ORDER BY p.generation, p.name"
    )
    records = [record async for record in result]
    return [_person_from_record(r) for r in records]


@router.get("/{person_id}", response_model=PersonResponse)
async def get_person(person_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.run(
        "MATCH (p:Person {id: $id}) RETURN p", id=person_id
    )
    record = await result.single()
    if not record:
        raise HTTPException(404, "Person not found")
    return _person_from_record(record)


@router.post("", response_model=PersonResponse, status_code=201)
async def create_person(data: PersonCreate, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    person_id = f"p_{uuid4().hex[:10]}"
    result = await session.run(
        """
        CREATE (p:Person {
            id: $id, name: $name, birthYear: $birthYear,
            deathYear: $deathYear, generation: $generation,
            location: $location, bio: $bio, role: $role,
            photo: $photo, createdBy: $createdBy, createdAt: datetime()
        })
        RETURN p
        """,
        id=person_id,
        createdBy=current_user.get("displayName", ""),
        **data.model_dump(),
    )
    record = await result.single()
    return _person_from_record(record)


@router.put("/{person_id}", response_model=PersonResponse)
async def update_person(
    person_id: str, data: PersonUpdate, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)
):
    raw = data.model_dump()
    # Include fields that are explicitly set (even to None for clearing, like photo)
    updates = {k: v for k, v in raw.items() if v is not None}
    # Allow explicitly clearing photo by checking if it was sent as empty string or null
    if "photo" in raw and raw["photo"] is None:
        updates["photo"] = None
    if not updates:
        raise HTTPException(400, "No fields to update")

    set_clauses = ", ".join(f"p.{k} = ${k}" for k in updates)
    query = f"MATCH (p:Person {{id: $id}}) SET {set_clauses}, p.updatedAt = datetime() RETURN p"

    result = await session.run(query, id=person_id, **updates)
    record = await result.single()
    if not record:
        raise HTTPException(404, "Person not found")
    return _person_from_record(record)


@router.delete("/{person_id}", status_code=204)
async def delete_person(person_id: str, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    result = await session.run(
        "MATCH (p:Person {id: $id}) DETACH DELETE p RETURN count(p) as deleted",
        id=person_id,
    )
    record = await result.single()
    if record["deleted"] == 0:
        raise HTTPException(404, "Person not found")
