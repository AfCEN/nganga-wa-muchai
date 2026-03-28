from pydantic import BaseModel


class TrailCreate(BaseModel):
    title: str
    description: str = ""
    storyIds: list[str] = []


class TrailUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    storyIds: list[str] | None = None


class TrailResponse(BaseModel):
    id: str
    title: str
    description: str = ""
    storyIds: list[str] = []
    createdAt: str | None = None
