"""Pytest fixtures shared across all test modules."""

import pytest
from fogsift_memory_system.schema import initialize_database
from fogsift_memory_system.store import MemoryStore
from fogsift_memory_system.search import MemorySearch
from fogsift_memory_system.service import MemoryService
from fogsift_memory_system.models import FragmentCreate, FragmentType


@pytest.fixture
def db():
    """In-memory SQLite connection — isolated per test."""
    conn = initialize_database(":memory:")
    yield conn
    conn.close()


@pytest.fixture
def store(db):
    return MemoryStore(db)


@pytest.fixture
def search(store):
    return MemorySearch(store)


@pytest.fixture
def service(store, search):
    return MemoryService(store, search)


@pytest.fixture
def error_fragment(service):
    """A pre-stored ERROR fragment for tests that need existing data."""
    req = FragmentCreate(
        content="Redis cluster failed during peak load. All nodes went down simultaneously.",
        topic="infrastructure",
        type=FragmentType.ERROR,
        keywords=["redis", "cluster", "failure"],
    )
    return service.remember(req)


@pytest.fixture
def solution_fragment(service):
    """A pre-stored SOLUTION_APPROACH fragment."""
    req = FragmentCreate(
        content="Set maxmemory-policy allkeys-lru and memory limit on all Redis replicas.",
        topic="infrastructure",
        type=FragmentType.SOLUTION_APPROACH,
        keywords=["redis", "maxmemory", "lru", "replica"],
    )
    return service.remember(req)
