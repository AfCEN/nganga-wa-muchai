from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import init_driver, close_driver
from .routes import auth, people, connections, stories, events, trails, graph, upload


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_driver(settings.neo4j_uri, settings.neo4j_user, settings.neo4j_password, settings.neo4j_database)
    yield
    await close_driver()


app = FastAPI(title="Nganga wa Muchai API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(people.router)
app.include_router(connections.router)
app.include_router(stories.router)
app.include_router(events.router)
app.include_router(trails.router)
app.include_router(graph.router)
app.include_router(upload.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
