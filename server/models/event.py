from pydantic import BaseModel


class EventCreate(BaseModel):
    title: str
    description: str = ""
    year: int
    personIds: list[str] = []
    type: str = "milestone"


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    year: int | None = None
    personIds: list[str] | None = None
    type: str | None = None


class EventResponse(BaseModel):
    id: str
    title: str
    description: str = ""
    year: int
    personIds: list[str] = []
    type: str = "milestone"
    createdAt: str | None = None
