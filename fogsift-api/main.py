from fastapi import FastAPI
from contextlib import asynccontextmanager
from fogsift_memory_system import (
    initialize_database,
    MemoryStore,
    MemorySearch,
    MemoryService,
)
from fogsift_memory_system.routes import router as memory_router
import fogsift_memory_system.routes as memory_routes

db_connection = None
memory_service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_connection, memory_service
    db_connection = initialize_database("fogsift_memory.db")
    store = MemoryStore(db_connection)
    search = MemorySearch(store)
    memory_service = MemoryService(store, search)
    memory_routes.memory_service = memory_service
    print("[Memory System] Ready")
    yield
    if db_connection:
        db_connection.close()


app = FastAPI(
    title="FogSift Memory API",
    description="Persistent memory system for FogSift consulting sessions",
    version="1.0.0",
    lifespan=lifespan,
)
app.include_router(memory_router)


@app.get("/")
async def root():
    return {"status": "online", "service": "fogsift-memory"}
