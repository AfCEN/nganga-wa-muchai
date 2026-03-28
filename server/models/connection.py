from pydantic import BaseModel


class ConnectionCreate(BaseModel):
    source: str
    target: str
    type: str  # "parent-child", "spouse", "sibling"


class ConnectionResponse(BaseModel):
    id: str
    source: str
    target: str
    type: str
