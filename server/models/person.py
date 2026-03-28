from pydantic import BaseModel


class PersonCreate(BaseModel):
    name: str
    birthYear: int | None = None
    deathYear: int | None = None
    generation: int = 1
    location: str = ""
    bio: str = ""
    role: str = ""
    photo: str | None = None


class PersonUpdate(BaseModel):
    name: str | None = None
    birthYear: int | None = None
    deathYear: int | None = None
    generation: int | None = None
    location: str | None = None
    bio: str | None = None
    role: str | None = None
    photo: str | None = None


class PersonResponse(BaseModel):
    id: str
    name: str
    birthYear: int | None = None
    deathYear: int | None = None
    generation: int = 1
    location: str = ""
    bio: str = ""
    role: str = ""
    photo: str | None = None
    stories: list[str] = []
    createdAt: str | None = None
