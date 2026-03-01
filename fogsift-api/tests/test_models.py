"""Tests for Pydantic model validation."""

import pytest
from pydantic import ValidationError
from fogsift_memory_system.models import (
    FragmentCreate, FragmentType, RecallRequest, LinkCreate, LinkRelationType,
)


class TestFragmentCreate:
    def test_valid_minimal(self):
        frag = FragmentCreate(
            content="Valid content.",
            topic="test",
            type=FragmentType.ERROR,
        )
        assert frag.content == "Valid content."
        assert frag.scope == "permanent"
        assert frag.importance is None

    def test_content_empty_rejected(self):
        with pytest.raises(ValidationError):
            FragmentCreate(content="", topic="test", type=FragmentType.ERROR)

    def test_content_too_long_rejected(self):
        with pytest.raises(ValidationError):
            FragmentCreate(content="x" * 10_001, topic="test", type=FragmentType.ERROR)

    def test_content_at_max_length_accepted(self):
        frag = FragmentCreate(
            content="x" * 10_000, topic="test", type=FragmentType.ERROR
        )
        assert len(frag.content) == 10_000

    def test_topic_empty_rejected(self):
        with pytest.raises(ValidationError):
            FragmentCreate(content="test", topic="", type=FragmentType.ERROR)

    def test_topic_too_long_rejected(self):
        with pytest.raises(ValidationError):
            FragmentCreate(content="test", topic="t" * 101, type=FragmentType.ERROR)

    def test_importance_out_of_range_rejected(self):
        with pytest.raises(ValidationError):
            FragmentCreate(content="test", topic="test", type=FragmentType.ERROR, importance=1.5)
        with pytest.raises(ValidationError):
            FragmentCreate(content="test", topic="test", type=FragmentType.ERROR, importance=-0.1)

    def test_importance_bounds_accepted(self):
        for val in [0.0, 0.5, 1.0]:
            frag = FragmentCreate(
                content="test", topic="test", type=FragmentType.ERROR, importance=val
            )
            assert frag.importance == val

    def test_too_many_keywords_rejected(self):
        with pytest.raises(ValidationError):
            FragmentCreate(
                content="test", topic="test", type=FragmentType.ERROR,
                keywords=["k"] * 21,
            )

    def test_keyword_too_long_rejected(self):
        with pytest.raises(ValidationError):
            FragmentCreate(
                content="test", topic="test", type=FragmentType.ERROR,
                keywords=["x" * 101],
            )

    def test_invalid_scope_rejected(self):
        with pytest.raises(ValidationError):
            FragmentCreate(
                content="test", topic="test", type=FragmentType.ERROR, scope="forever"
            )

    def test_valid_scopes(self):
        for scope in ["permanent", "session"]:
            frag = FragmentCreate(
                content="test", topic="test", type=FragmentType.ERROR, scope=scope
            )
            assert frag.scope == scope

    def test_invalid_fragment_type_rejected(self):
        with pytest.raises(ValidationError):
            FragmentCreate(content="test", topic="test", type="unknown_type")

    def test_all_fragment_types_accepted(self):
        for ft in FragmentType:
            frag = FragmentCreate(content="test", topic="test", type=ft)
            assert frag.type == ft


class TestRecallRequest:
    def test_no_criteria_rejected(self):
        with pytest.raises(ValidationError):
            RecallRequest()

    def test_keywords_alone_accepted(self):
        req = RecallRequest(keywords=["redis"])
        assert req.keywords == ["redis"]

    def test_topic_alone_accepted(self):
        req = RecallRequest(topic="infrastructure")
        assert req.topic == "infrastructure"

    def test_type_alone_accepted(self):
        req = RecallRequest(type=FragmentType.ERROR)
        assert req.type == FragmentType.ERROR

    def test_text_alone_accepted(self):
        req = RecallRequest(text="redis failure")
        assert req.text == "redis failure"

    def test_text_whitespace_only_rejected(self):
        with pytest.raises(ValidationError):
            RecallRequest(text="   ")

    def test_token_budget_too_low_rejected(self):
        with pytest.raises(ValidationError):
            RecallRequest(keywords=["test"], token_budget=99)

    def test_token_budget_too_high_rejected(self):
        with pytest.raises(ValidationError):
            RecallRequest(keywords=["test"], token_budget=50_001)

    def test_token_budget_bounds_accepted(self):
        for budget in [100, 1000, 50_000]:
            req = RecallRequest(keywords=["test"], token_budget=budget)
            assert req.token_budget == budget


class TestLinkCreate:
    def test_valid_link(self):
        lnk = LinkCreate(
            from_id="frag_abc",
            to_id="frag_def",
            relation_type=LinkRelationType.RESOLVED_BY,
        )
        assert lnk.relation_type == LinkRelationType.RESOLVED_BY

    def test_empty_from_id_rejected(self):
        with pytest.raises(ValidationError):
            LinkCreate(from_id="", to_id="frag_def", relation_type=LinkRelationType.RELATED)

    def test_invalid_relation_type_rejected(self):
        with pytest.raises(ValidationError):
            LinkCreate(from_id="a", to_id="b", relation_type="causes")
