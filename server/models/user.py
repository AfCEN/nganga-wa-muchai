from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: str
    password: str
    displayName: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    displayName: str
    role: str = "member"
    createdAt: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
