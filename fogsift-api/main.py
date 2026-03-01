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


@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_connection
    db_connection = initialize_database("fogsift_memory.db")
    store = MemoryStore(db_connection)
    search = MemorySearch(store)
    service = MemoryService(store, search)
    memory_routes.memory_service = service
    print("\n[✔] Fogsift Memory System Online")
    print("[✔] Database connected: fogsift_memory.db")
    print("[✔] Docs available at: http://localhost:8000/docs\n")
    yield
    if db_connection:
        db_connection.close()
        print("[!] Database connection closed.")


app = FastAPI(
    title="Fogsift Memory System API",
    description="Tiered architectural memory and pattern retrieval system.",
    version="1.0.0",
    lifespan=lifespan,
)
app.include_router(memory_router)


@app.get("/")
async def root():
    return {"status": "online", "message": "Fogsift Memory System is running. Visit /docs to test endpoints."}
