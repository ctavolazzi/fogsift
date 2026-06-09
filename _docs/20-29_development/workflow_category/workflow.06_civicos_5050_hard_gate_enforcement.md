---
id: workflow.06
title: CivicOS 5050 Hard-Gate Enforcement
created: 2026-03-01T11:45:00-08:00
updated: 2026-03-01T11:45:00-08:00
links:
  - '[[workflow_category_index]]'
  - '[[architecture.02_api_endpoints]]'
related_work_efforts:
  - WE-260301-c5op
---

# CivicOS 5050 Hard-Gate Enforcement

## Policy

No implementation task is considered started until it is represented in CivicOS at `http://localhost:5050`.

Required sequence:
1. Represent task in CivicOS.
2. Execute via CivicOS-linked tools.
3. Verify through CivicOS namespace health.
4. Log result in work effort + devlog.

## Preflight Block Conditions

Block execution if any condition fails:
- CivicOS representation missing for current task.
- Expected API namespace unavailable through `:5050`.
- Work effort or devlog entry not initialized.

## Temporary Override Protocol

When an override is necessary:
1. Record `temporary_override` with reason, scope, and expiry.
2. Restrict override to minimum required action.
3. Add postmortem in `_work_efforts/devlog.md` before ticket closure.

## Health Panel Definition

The CivicOS health panel should evaluate:

| Check ID | Endpoint | Expected | Purpose | On Failure |
|---|---|---|---|---|
| `meta-200` | `/api/meta.json` | `200` | Build metadata and shell/API wiring | Block rollout and inspect adapter target |
| `realms-200` | `/api/realms/topology.json` | `200` | Realm topology interoperability | Mark degraded and halt topology-driven workflow actions |
| `apps-index-200` | `/api/apps/index.json` | `200` | App discovery contract | Disable app registry actions and raise operator warning |
| `cognitive-200` | `/api/empirica/cognitive-tests.json` | `200` | Cognitive diagnostics feed | Keep shell online, mark diagnostics unavailable |

Suggested status levels:
- `healthy`: all required checks pass.
- `degraded`: non-critical check fails.
- `blocked`: core check fails (`meta-200` or `apps-index-200`).

## Compliance Artifact

Use `_work_efforts/civicos_5050_hard_gate_compliance_checklist.md` for each completed work slice.
