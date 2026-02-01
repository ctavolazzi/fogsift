# Project Folder Template

**Purpose**: Standard folder structure for organizing Tech Teardown projects.

---

## Folder Structure

```
project-name/
├── README.md                    # Project overview and status
├── project-metadata.md          # Project metadata and tracking
│
├── 01-research/                # Research materials
│   ├── device-research.md      # Device research document
│   ├── history-research.md     # History research document
│   ├── sources/                # Research sources
│   │   ├── articles/
│   │   ├── images/
│   │   └── documents/
│   └── notes.md                # Research notes
│
├── 02-footage/                 # Video footage
│   ├── raw/                    # Raw footage (unprocessed)
│   │   ├── intro/
│   │   ├── disassembly/
│   │   ├── components/
│   │   ├── history/
│   │   └── reassembly/
│   ├── selects/                # Selected best takes
│   └── b-roll/                 # B-roll footage
│
├── 03-audio/                   # Audio files
│   ├── narration/              # Narration recordings
│   │   ├── raw/                # Raw narration files
│   │   ├── processed/          # Processed audio
│   │   └── final/              # Final narration track
│   ├── music/                  # Background music (if used)
│   └── sound-effects/          # Sound effects (if used)
│
├── 04-graphics/                # Graphics and text overlays
│   ├── logos/                  # Logos and branding
│   ├── text/                   # Text overlays
│   ├── labels/                # Component labels
│   └── thumbnails/             # Thumbnail images
│
├── 05-documents/               # Project documents
│   ├── script/                 # Script files
│   │   ├── script-draft.md
│   │   ├── script-final.md
│   │   └── script-notes.md
│   ├── disassembly-log.md      # Disassembly documentation
│   ├── component-catalog.md    # Component catalog
│   ├── reassembly-log.md       # Reassembly documentation
│   └── lessons-learned.md      # Lessons learned document
│
├── 06-exports/                 # Exported videos
│   ├── drafts/                 # Draft exports
│   ├── final/                  # Final export
│   └── versions/               # Version history
│
└── 07-archive/                 # Archived materials
    ├── raw-backup/             # Backup of raw footage
    ├── project-backup/         # Backup of project files
    └── final-deliverables/     # Final deliverables archive
```

---

## Folder Descriptions

### 01-research/
Contains all research materials for the project.

**Contents**:
- Device research document
- History research document
- Research sources (articles, images, documents)
- Research notes

**Naming**: Use descriptive names, organize by type

### 02-footage/
Contains all video footage for the project.

**Contents**:
- Raw footage (unprocessed)
- Selected best takes
- B-roll footage

**Organization**: Organize by scene/section (intro, disassembly, etc.)

### 03-audio/
Contains all audio files for the project.

**Contents**:
- Narration recordings (raw, processed, final)
- Background music (if used)
- Sound effects (if used)

**Organization**: Organize by type and processing stage

### 04-graphics/
Contains graphics and text overlays.

**Contents**:
- Logos and branding
- Text overlays
- Component labels
- Thumbnail images

**Organization**: Organize by type

### 05-documents/
Contains project documents.

**Contents**:
- Script files
- Disassembly log
- Component catalog
- Reassembly log
- Lessons learned

**Organization**: Organize by document type

### 06-exports/
Contains exported videos.

**Contents**:
- Draft exports
- Final export
- Version history

**Organization**: Organize by version/status

### 07-archive/
Contains archived materials.

**Contents**:
- Backup of raw footage
- Backup of project files
- Final deliverables archive

**Organization**: Archive after project completion

---

## File Naming Conventions

### Video Files
- **Format**: `[section]-[description]-[take].mp4`
- **Example**: `intro-device-presentation-001.mp4`
- **Sections**: intro, disassembly, components, history, reassembly

### Audio Files
- **Format**: `[type]-[section]-[version].wav`
- **Example**: `narration-intro-final.wav`
- **Types**: narration, music, sound-effect

### Image Files
- **Format**: `[type]-[description]-[number].jpg`
- **Example**: `component-processor-001.jpg`
- **Types**: component, device, thumbnail

### Document Files
- **Format**: `[document-type].md`
- **Example**: `disassembly-log.md`
- **Types**: research, script, log, catalog

---

## Usage

### Starting a New Project
1. Copy this template folder
2. Rename to project name (e.g., `apple-newton-teardown`)
3. Update `README.md` with project information
4. Create `project-metadata.md` from template
5. Begin organizing files

### During Production
- Add files to appropriate folders
- Follow naming conventions
- Keep files organized
- Update documentation as you go

### After Completion
- Archive project to `07-archive/`
- Keep final deliverables
- Backup important files
- Document lessons learned

---

## Tips

1. **Stay Organized**: Add files to correct folders immediately
2. **Use Naming Conventions**: Consistent naming makes files easy to find
3. **Update Documentation**: Keep README and metadata current
4. **Backup Regularly**: Backup important files
5. **Archive When Done**: Move completed projects to archive

---

**Last Updated**: 2026-01-26
