"""
Fogsift Memory System - Example Application
Run this file directly to test the system: python example_app.py
"""

from fastapi import FastAPI
from contextlib import asynccontextmanager
import uvicorn

# Ensure your folder is named fogsift_memory_system or run from within it
from fogsift_memory_system.schema import initialize_database
from fogsift_memory_system.store import MemoryStore
from fogsift_memory_system.search import MemorySearch
from fogsift_memory_system.service import MemoryService
import fogsift_memory_system.routes as routes

db_connection = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_connection

    # 1. Initialize SQLite Database
    db_connection = initialize_database("fogsift_memory.db")

    # 2. Setup System Layers
    store = MemoryStore(db_connection)
    search = MemorySearch(store)
    service = MemoryService(store, search)

    # 3. Inject service into routes
    routes.memory_service = service
    print("\n[✔] Fogsift Memory System Online")
    print("[✔] Database connected: fogsift_memory.db")
    print("[✔] Docs available at: http://localhost:8000/docs\n")

    yield

    # Teardown
    if db_connection:
        db_connection.close()
        print("[!] Database connection closed.")


app = FastAPI(
    title="Fogsift Memory System API",
    description="Tiered architectural memory and pattern retrieval system.",
    lifespan=lifespan
)

app.include_router(routes.router)


@app.get("/")
async def root():
    return {"status": "online", "message": "Fogsift Memory System is running. Visit /docs to test endpoints."}


if __name__ == "__main__":
    uvicorn.run("example_app:app", host="0.0.0.0", port=8000, reload=True)
