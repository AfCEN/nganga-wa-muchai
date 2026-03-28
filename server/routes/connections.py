from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from neo4j import AsyncSession

from ..auth import get_current_user
from ..db import get_session
from ..models.connection import ConnectionCreate, ConnectionResponse

router = APIRouter(prefix="/api/connections", tags=["connections"])


@router.get("", response_model=list[ConnectionResponse])
async def list_connections(session: AsyncSession = Depends(get_session)):
    result = await session.run(
        """
        MATCH (a:Person)-[r:CONNECTED_TO]->(b:Person)
        RETURN r.connId as id, a.id as source, b.id as target, r.type as type
        """
    )
    records = [record async for record in result]
    return [dict(r) for r in records]


@router.post("", response_model=ConnectionResponse, status_code=201)
async def create_connection(
    data: ConnectionCreate, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)
):
    conn_id = f"c_{uuid4().hex[:10]}"
    result = await session.run(
        """
        MATCH (a:Person {id: $source}), (b:Person {id: $target})
        CREATE (a)-[r:CONNECTED_TO {connId: $connId, type: $type, createdAt: datetime()}]->(b)
        RETURN r.connId as id, a.id as source, b.id as target, r.type as type
        """,
        source=data.source,
        target=data.target,
        connId=conn_id,
        type=data.type,
    )
    record = await result.single()
    if not record:
        raise HTTPException(400, "One or both people not found")
    return dict(record)


@router.delete("/{conn_id}", status_code=204)
async def delete_connection(conn_id: str, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    result = await session.run(
        """
        MATCH ()-[r:CONNECTED_TO {connId: $connId}]->()
        DELETE r
        RETURN count(r) as deleted
        """,
        connId=conn_id,
    )
    record = await result.single()
    if record["deleted"] == 0:
        raise HTTPException(404, "Connection not found")
