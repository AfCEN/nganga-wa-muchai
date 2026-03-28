from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from neo4j import AsyncSession

from ..auth import get_current_user
from ..db import get_session
from ..models.event import EventCreate, EventResponse, EventUpdate

router = APIRouter(prefix="/api/events", tags=["events"])


def _event_from_node(node) -> dict:
    e = dict(node)
    return {
        "id": e.get("id", ""),
        "title": e.get("title", ""),
        "description": e.get("description", ""),
        "year": e.get("year", 0),
        "type": e.get("type", "milestone"),
        "personIds": [],
        "createdAt": str(e["createdAt"]) if e.get("createdAt") else None,
    }


@router.get("", response_model=list[EventResponse])
async def list_events(session: AsyncSession = Depends(get_session)):
    result = await session.run("MATCH (e:Event) RETURN e ORDER BY e.year")
    events = []
    async for record in result:
        events.append(_event_from_node(record["e"]))

    if events:
        links_result = await session.run(
            "MATCH (p:Person)-[:APPEARS_IN]->(e:Event) RETURN e.id as eventId, p.id as personId"
        )
        links = {}
        async for r in links_result:
            links.setdefault(r["eventId"], []).append(r["personId"])
        for event in events:
            event["personIds"] = links.get(event["id"], [])

    return events


@router.post("", response_model=EventResponse, status_code=201)
async def create_event(data: EventCreate, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    event_id = f"e_{uuid4().hex[:10]}"
    result = await session.run(
        """
        CREATE (e:Event {
            id: $id, title: $title, description: $description,
            year: $year, type: $type, createdAt: datetime()
        })
        RETURN e
        """,
        id=event_id,
        title=data.title,
        description=data.description,
        year=data.year,
        type=data.type,
    )
    record = await result.single()
    event = _event_from_node(record["e"])

    if data.personIds:
        await session.run(
            """
            UNWIND $personIds AS pid
            MATCH (p:Person {id: pid}), (e:Event {id: $eventId})
            CREATE (p)-[:APPEARS_IN]->(e)
            """,
            personIds=data.personIds,
            eventId=event_id,
        )
        event["personIds"] = data.personIds

    return event


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str, data: EventUpdate, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)
):
    updates = {k: v for k, v in data.model_dump().items() if v is not None and k != "personIds"}
    if updates:
        set_clauses = ", ".join(f"e.{k} = ${k}" for k in updates)
        query = f"MATCH (e:Event {{id: $id}}) SET {set_clauses}, e.updatedAt = datetime() RETURN e"
        result = await session.run(query, id=event_id, **updates)
        record = await result.single()
        if not record:
            raise HTTPException(404, "Event not found")

    if data.personIds is not None:
        await session.run(
            "MATCH (p:Person)-[r:APPEARS_IN]->(e:Event {id: $id}) DELETE r",
            id=event_id,
        )
        if data.personIds:
            await session.run(
                """
                UNWIND $personIds AS pid
                MATCH (p:Person {id: pid}), (e:Event {id: $eventId})
                CREATE (p)-[:APPEARS_IN]->(e)
                """,
                personIds=data.personIds,
                eventId=event_id,
            )

    result = await session.run("MATCH (e:Event {id: $id}) RETURN e", id=event_id)
    record = await result.single()
    if not record:
        raise HTTPException(404, "Event not found")
    event = _event_from_node(record["e"])

    pid_result = await session.run(
        "MATCH (p:Person)-[:APPEARS_IN]->(e:Event {id: $id}) RETURN p.id as pid", id=event_id
    )
    event["personIds"] = [r["pid"] async for r in pid_result]
    return event


@router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: str, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    result = await session.run(
        "MATCH (e:Event {id: $id}) DETACH DELETE e RETURN count(e) as deleted",
        id=event_id,
    )
    record = await result.single()
    if record["deleted"] == 0:
        raise HTTPException(404, "Event not found")
