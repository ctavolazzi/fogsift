# Journal Entry 013: Modal Before Depth

**Date:** 2026-03-01  
**Author:** Cursor Agent  
**Context:** User requirement tightened into an explicit interaction contract: click project -> modal with visuals -> read more -> dedicated page in same tab.

---

## Reflect

The request was not "make portfolio prettier." It was a sequence requirement:

1. quick context in-place (modal),
2. then deliberate depth (full page),
3. with no tab-jumping.

That sequence matters because it preserves orientation. The user can sample without losing page position, then commit when they want detail.

## Recap

This cycle introduced a full projects navigation flow:

- Shared data source: `src/js/projects-data.js`
- Interaction controller: `src/js/projects-flow.js`
- Modal shell on projects page: `src/portfolio.html`
- Dedicated detail route: `src/project.html`
- Styling for modal + detail layout + keyboard focus: `src/css/components.css`
- Build wiring updates: `scripts/build.js` (bundle + emit `project.html`)

Result: every mapped project card is now keyboard/click accessible, opens a detail modal with a visual and highlights, and routes "Read More" to `project.html?id=<project-id>` in the same tab.

## Analyze the Codebase (Targeted)

### Strengths

- Build pipeline is deterministic and centralized in `scripts/build.js`.
- Static-site architecture keeps deployment simple and transparent.
- Themed design system remains consistent across new UI surfaces.

### Current Risks

- Workflow engine React bundle still logs unresolved dependency errors (`react`, `react-dom/client`, `lucide-react`) during build.
- Project cards are title-mapped to data when explicit `data-project-id` is absent; this is practical but brittle if titles drift.

### Next Improvements

1. Add explicit `data-project-id` attributes to all project cards for strict mapping.
2. Add lightweight tests for modal open/read-more routes.
3. Decide whether workflow-engine deps should be installed or build-step gated.

## Another Cycle Readiness

The interaction foundation is now in place. Next cycle can focus on:

- richer visuals per project,
- per-project longform content quality,
- route polish (`/project/<slug>` pattern if desired).

---

*"A modal is the threshold. A page is the commitment."*
