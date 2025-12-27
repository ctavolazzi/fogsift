# MCP Integration Test Process Document

**Document ID:** workflow.02  
**Created:** 2025-12-27T10:49:40-08:00  
**Purpose:** Define the expected workflow, stages, gates, and pass/fail criteria for MCP tool orchestration testing

---

## 1. Overview

This process document defines a structured test of the MCP (Model Context Protocol) tool orchestration system. The test validates that multiple MCP servers can work together in a coordinated workflow to accomplish a real task.

### 1.1 Test Objective

Execute a complete workflow using MCP tools:
1. Plan using sequential-thinking
2. Track work using work-efforts
3. Create documentation using docs-maintainer
4. Manage files using filesystem
5. Verify results using browser tools
6. Persist learnings using memory

### 1.2 Success Criteria

- All gates pass with documented evidence
- A work effort is created, executed, and completed
- Browser verification confirms changes
- All documentation is generated and committed

---

## 2. Workflow Stages

### Stage 1: Setup

| Step | Action | Tool | Expected Result |
|------|--------|------|-----------------|
| 1.1 | Create this process document | docs-maintainer or write | Document exists at expected path |
| 1.2 | Start dev server | terminal (npm run dev) | Server running on localhost:5050 |
| 1.3 | Verify server | browser_navigate + browser_snapshot | Homepage loads, content visible |

**Gate 1: Server Running**
- Pass: localhost:5050 responds with fogsift homepage
- Fail: Connection refused, timeout, or wrong content

### Stage 2: MCP Discovery

| Step | Action | Tool | Expected Result |
|------|--------|------|-----------------|
| 2.1 | Test sequential-thinking | sequentialthinking | Returns thought object |
| 2.2 | Test memory | search_nodes or create_entities | Returns result (even if empty) |
| 2.3 | Test filesystem | list_directory | Returns directory listing |
| 2.4 | Test docs-maintainer | check_health | Returns health score |
| 2.5 | Test browser | browser_snapshot | Returns page accessibility tree |
| 2.6 | Test work-efforts | list_work_efforts | Returns list OR documents unavailability |

**Gate 2: MCP Tools Available**
- Pass: At least 5 of 6 MCP servers respond correctly
- Partial: 3-4 servers respond (proceed with available tools)
- Fail: Fewer than 3 servers respond

### Stage 3: Workflow Execution

| Step | Action | Tool | Expected Result |
|------|--------|------|-----------------|
| 3.1 | Create work effort | create_work_effort | WE created with ID |
| 3.2 | Create tickets | create_ticket (x2) | Tickets created |
| 3.3 | Execute task | write/edit files | Test element added to homepage |
| 3.4 | Build site | terminal (npm run build) | Build succeeds |
| 3.5 | Verify with browser | browser_snapshot | Test element visible |
| 3.6 | Update tickets | update_ticket | Tickets marked complete |
| 3.7 | Complete work effort | update_work_effort | WE marked complete |

**Gate 3: Workflow Complete**
- Pass: All steps complete, browser verification shows changes
- Partial: Steps complete but work-efforts unavailable (manual tracking)
- Fail: Task not executed or verification failed

### Stage 4: Documentation

| Step | Action | Tool | Expected Result |
|------|--------|------|-----------------|
| 4.1 | Create test results doc | write | Results document created |
| 4.2 | Create briefing doc | write | Briefing document created |
| 4.3 | Commit to git | terminal | Changes committed and pushed |

**Gate 4: Documentation Complete**
- Pass: All 3 documents exist and committed
- Fail: Documents missing or commit failed

---

## 3. Gate Definitions

### Gate 1: Server Running

```
GATE_1_CRITERIA:
  - localhost:5050 responds to HTTP request
  - Response contains "FogSift" or expected homepage content
  - Browser snapshot returns valid accessibility tree
  
EVIDENCE_REQUIRED:
  - Browser snapshot output
  - Server process confirmation
```

### Gate 2: MCP Tools Available

```
GATE_2_CRITERIA:
  - sequential-thinking: Returns thought object with thoughtNumber
  - memory: Returns result object (entities may be empty)
  - filesystem: Returns directory listing array
  - docs-maintainer: Returns health score number
  - browser: Returns snapshot with page elements
  - work-efforts: Returns list OR error message (document either)

SCORING:
  6/6 = PASS (full capability)
  5/6 = PASS (proceed with workaround)
  3-4/6 = PARTIAL (limited testing)
  <3/6 = FAIL (abort test)
  
EVIDENCE_REQUIRED:
  - Tool response for each server
  - Error messages if any
```

### Gate 3: Workflow Complete

```
GATE_3_CRITERIA:
  - Work effort created (or documented as unavailable)
  - Test task executed (file modified)
  - Build succeeds without errors
  - Browser verification shows change
  - Tickets/WE updated (or documented as unavailable)

EVIDENCE_REQUIRED:
  - Work effort ID or unavailability note
  - File diff showing change
  - Build output
  - Browser snapshot showing change
```

### Gate 4: Documentation Complete

```
GATE_4_CRITERIA:
  - workflow.02_mcp_integration_test_process.md exists
  - workflow.03_mcp_integration_test_results.md exists
  - workflow.04_mcp_integration_briefing.md exists
  - All files committed to git

EVIDENCE_REQUIRED:
  - File listing showing all documents
  - Git commit hash
```

---

## 4. Test Task Definition

### Task: Add Test Badge to Homepage

**Objective:** Add a small, visible test element to verify the workflow

**Implementation:**
1. Add a comment or small element to `src/index.html`
2. Rebuild the site
3. Verify element appears in browser

**Element to Add:**
```html
<!-- MCP-TEST-2025-12-27: Workflow integration test marker -->
```

**Verification:**
- Browser snapshot should contain "MCP-TEST" text
- Or visible in page source

**Cleanup:**
- Remove test element after verification (optional)
- Or leave as proof of successful test

---

## 5. Fallback Procedures

### If work-efforts MCP is unavailable:
1. Document the unavailability at Gate 2
2. Create manual work effort tracking in results document
3. Continue with available tools
4. Note in briefing as "known limitation"

### If browser tools fail:
1. Use terminal curl to verify server responds
2. Document limitation
3. Proceed with file-based verification

### If docs-maintainer fails:
1. Use standard write tool for documentation
2. Document limitation
3. Manually update index files

---

## 6. Expected Timeline

| Phase | Estimated Duration |
|-------|-------------------|
| Stage 1: Setup | 2-3 minutes |
| Stage 2: MCP Discovery | 3-5 minutes |
| Stage 3: Workflow Execution | 5-10 minutes |
| Stage 4: Documentation | 3-5 minutes |
| **Total** | **13-23 minutes** |

---

## 7. Document Trail

After test completion, the following documents will exist:

1. **This Document** - `workflow.02_mcp_integration_test_process.md` - Process definition
2. **Results Log** - `workflow.03_mcp_integration_test_results.md` - Gate-by-gate results
3. **Briefing** - `workflow.04_mcp_integration_briefing.md` - Executive summary

All documents will be committed to the fogsift repository under `_docs/20-29_development/workflow_category/`.

