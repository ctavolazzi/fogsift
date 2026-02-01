# Google Workspace + Todoist Setup for Tech Teardown Videos

**Purpose**: How to use Google Workspace and Todoist together for Tech Teardown video production.

---

## What You Already Have

### Google Workspace
- **Google Sheets** - Spreadsheets for tracking
- **Google Docs** - Documents for scripts/research
- **Google Drive** - File storage and organization
- **Google Calendar** - Publishing schedule

### Todoist
- **Task Management** - Tasks and projects
- **Due Dates** - Scheduling and deadlines
- **Projects** - Organize by video/project

---

## Recommended Setup

### Option 1: Use What You Have (Simplest)

#### Google Sheets - Project Tracker
Create a spreadsheet to track all teardown projects:

**Columns**:
- Device Name
- Status (Ideas / Research / Filming / Editing / Published)
- Start Date
- Target Publish Date
- Actual Publish Date
- Research Doc Link
- Script Doc Link
- Video Link
- Notes

**Views**:
- Main sheet: All projects
- Filter by Status
- Sort by Date

#### Google Docs - Per Project
For each device, create a folder in Drive:
- `[Device Name] Research.md` - Research document
- `[Device Name] Script.md` - Script
- Link to these from Sheets

#### Google Drive - File Organization
```
Tech Teardowns/
├── Projects/
│   ├── Device 1/
│   │   ├── Research.md
│   │   ├── Script.md
│   │   ├── Footage/
│   │   ├── Audio/
│   │   └── Exports/
│   └── Device 2/
├── Templates/
│   ├── Research Template
│   └── Script Template
└── Archive/
```

#### Todoist - Tasks
Create a project: "Tech Teardown Videos"

**Sections**:
- Ideas
- Research
- Filming
- Editing
- Publishing

**Tasks per video**:
- Research [Device Name]
- Write script [Device Name]
- Film intro [Device Name]
- Film disassembly [Device Name]
- Edit video [Device Name]
- Publish [Device Name]

**Link to Google Docs**: Add links in task comments

#### Google Calendar - Publishing Schedule
- Create calendar: "Video Publishing"
- Add publish dates
- Set reminders

**Pros**:
- ✅ Already have it
- ✅ No new tools to learn
- ✅ Free (if you have Workspace)
- ✅ Integrates well

**Cons**:
- ❌ Sheets isn't great for relational data
- ❌ Less visual than kanban
- ❌ More manual linking

---

### Option 2: Add Airtable (Best Upgrade)

#### Why Airtable?
- **Integrates with Google Drive** - Link files directly
- **Relational** - Link videos to research, assets, etc.
- **Better than Sheets** - For complex data
- **Free Tier** - 1,000 records/year

#### Setup
**Airtable Base Structure**:
- **Videos Table**: All teardown projects
  - Device Name
  - Status (single select)
  - Dates
  - Links to Docs/Drive
  - Linked to Research table
  - Linked to Components table

- **Research Table**: Research sources
  - Source Name
  - Type (Article / Video / Document)
  - Link
  - Linked to Videos

- **Components Table**: Device components
  - Component Name
  - Type
  - Linked to Videos

**Views**:
- Kanban view (by Status)
- Calendar view (publish dates)
- Gallery view (visual planning)

**Integration**:
- Link Google Drive files
- Link Google Docs
- Use Google Calendar integration

**Todoist**:
- Keep for daily tasks
- Link to Airtable records in task comments
- Use for actionable items

**Pros**:
- ✅ Better than Sheets for this use case
- ✅ Integrates with Google
- ✅ Free tier available
- ✅ Visual kanban view
- ✅ Relational data

**Cons**:
- ❌ Another tool to learn
- ❌ Free tier has limits

---

### Option 3: Add Notion (Most Flexible)

#### Why Notion?
- **Integrates with Google Drive** - Embed files
- **All-in-One** - Replace Sheets + Docs organization
- **Templates** - Free YouTube templates
- **Free Tier** - Generous

#### Setup
**Notion Workspace**:
- **Videos Database**: All projects
  - Linked to Research pages
  - Linked to Script pages
  - Content calendar view

- **Research Pages**: Per device
  - Use templates from your system
  - Link to Google Drive files

- **Scripts**: Per device
  - Use your script template
  - Link to research

**Integration**:
- Embed Google Drive files
- Link Google Docs
- Use Google Calendar integration

**Todoist**:
- Keep for daily tasks
- Link to Notion pages
- Use for actionable items

**Pros**:
- ✅ Most flexible
- ✅ All-in-one
- ✅ Free templates
- ✅ Integrates with Google

**Cons**:
- ❌ Learning curve
- ❌ Another tool

---

## My Recommendation

### Start with Option 1 (What You Have)

**Why**:
1. **No new tools** - Use what you know
2. **Free** - Already paying for Workspace
3. **Good enough** - Can work for getting started
4. **Simple** - Less complexity

**Setup Time**: 30 minutes

**If you hit limits**, then add Airtable (Option 2) because:
- Better for relational data (videos → research → components)
- Integrates with Google Drive
- Free tier is generous
- Visual kanban view

---

## Quick Start: Google Workspace + Todoist

### Step 1: Create Google Sheets Tracker (10 min)
1. New Google Sheet: "Tech Teardown Projects"
2. Add columns: Device, Status, Dates, Links
3. Add a few test projects

### Step 2: Create Drive Structure (5 min)
1. Create folder: "Tech Teardowns"
2. Create subfolders: "Projects", "Templates", "Archive"
3. Copy your templates into "Templates"

### Step 3: Setup Todoist (10 min)
1. Create project: "Tech Teardown Videos"
2. Create sections: Ideas, Research, Filming, Editing, Publishing
3. Add a test video with tasks

### Step 4: Link Everything (5 min)
1. In Sheets, add column "Todoist Link"
2. In Todoist tasks, add "Google Doc Link" in comments
3. In Google Docs, add link back to Sheets

---

## Workflow Example

### Starting a New Project
1. **Sheets**: Add new row with device name
2. **Drive**: Create folder for device
3. **Docs**: Create research doc (from template)
4. **Todoist**: Add tasks for this video
5. **Link**: Add links between all

### During Production
1. **Todoist**: Check off tasks as you go
2. **Docs**: Update research/script
3. **Sheets**: Update status
4. **Drive**: Add footage/files

### Publishing
1. **Sheets**: Update to "Published", add video link
2. **Calendar**: Add publish date
3. **Todoist**: Complete all tasks
4. **Drive**: Move to Archive

---

## Integration Tips

### Google Drive + Todoist
- Add Drive file links in Todoist task comments
- Use Drive for all file storage
- Organize by project folders

### Google Sheets + Todoist
- Add Todoist task links in Sheets
- Use Sheets for overview/tracking
- Use Todoist for daily work

### Google Calendar + Todoist
- Todoist can sync with Google Calendar
- Use Calendar for publish dates
- Use Todoist for task deadlines

---

## When to Upgrade

### Add Airtable If:
- You need to link videos to research sources
- You want visual kanban view
- Sheets feels limiting
- You have 10+ projects

### Add Notion If:
- You want everything in one place
- You want more flexibility
- You want better templates
- You're doing this full-time

---

## Cost Comparison

### Current Setup (Option 1)
- **Cost**: $0 (already have Workspace + Todoist)
- **Tools**: Google Workspace + Todoist

### With Airtable (Option 2)
- **Cost**: $0 (free tier) or $12/month
- **Tools**: Google Workspace + Todoist + Airtable

### With Notion (Option 3)
- **Cost**: $0 (free tier) or $8/month
- **Tools**: Google Workspace + Todoist + Notion

---

## Final Recommendation

**Start Simple**: Use Google Workspace + Todoist (Option 1)

**If you need more**: Add Airtable (Option 2) - it's the best complement to what you have

**Why Airtable over Notion**:
- Better integration with Google
- More focused (doesn't try to replace everything)
- Works alongside Todoist better
- Free tier is generous

---

**Last Updated**: 2026-01-26
