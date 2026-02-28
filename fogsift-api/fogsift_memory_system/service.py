from typing import Optional

from .models import MemoryFragment
from .store import MemoryStore
from .search import MemorySearch


class MemoryService:
    def __init__(self, store: MemoryStore, search: MemorySearch):
        self.store = store
        self._searcher = search

    def remember(
        self,
        content: str,
        topic: str = "general",
        type_: str = "fact",
        importance: float = 0.5,
        tags: Optional[list] = None,
    ) -> MemoryFragment:
        fragment = MemoryFragment(
            content=content,
            topic=topic,
            type=type_,
            importance=importance,
            tags=tags or [],
        )
        return self.store.create(fragment)

    def recall(
        self,
        topic: Optional[str] = None,
        type_: Optional[str] = None,
        min_importance: float = 0.0,
        limit: int = 10,
        offset: int = 0,
    ) -> list[MemoryFragment]:
        return self.store.list(
            topic=topic,
            type_=type_,
            min_importance=min_importance,
            limit=limit,
            offset=offset,
        )

    def search(
        self,
        query: str,
        topic: Optional[str] = None,
        type_: Optional[str] = None,
        limit: int = 10,
        min_importance: float = 0.0,
    ) -> list[MemoryFragment]:
        return self._searcher.search(
            query=query,
            topic=topic,
            type_=type_,
            limit=limit,
            min_importance=min_importance,
        )

    def get(self, fragment_id: str) -> Optional[MemoryFragment]:
        return self.store.get(fragment_id)

    def forget(self, fragment_id: str) -> bool:
        return self.store.delete(fragment_id)

    def stats(self) -> dict:
        return self.store.stats()
