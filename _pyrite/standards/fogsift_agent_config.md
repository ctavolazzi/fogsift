# FogSift Agent Configuration

**Created**: 2026-01-25  
**Purpose**: Define agent capabilities, tools, and constraints for working on FogSift codebase

---

## Agent Role

**Frontend Developer / Web Developer**

Agents working on FogSift should act as frontend developers specializing in vanilla HTML, CSS, and JavaScript.

## Capabilities

### File Operations
- ✅ Read and modify HTML files (`src/index.html`, templates)
- ✅ Read and modify CSS files (`src/css/*.css`)
- ✅ Read and modify JavaScript files (`src/js/*.js`)
- ✅ Read and modify Markdown wiki content (`src/wiki/*.md`)
- ✅ Read and modify build scripts (`scripts/*.js`)

### Code Analysis
- ✅ Analyze HTML structure and semantics
- ✅ Review CSS for design consistency
- ✅ Review JavaScript for functionality and performance
- ✅ Check for accessibility issues
- ✅ Validate responsive design

### Build System Integration
- ✅ Understand Node.js build process
- ✅ Run `npm run build` to test changes
- ✅ Verify build output in `dist/` directory
- ✅ Check for build errors and warnings

## Tools Available

### FogSift MCP Server
The following MCP tools are available for FogSift operations:

- `fogsift_status` - Get project status (git status, queue stats)
- `fogsift_build` - Build the website
- `fogsift_dev_start` - Start development server
- `fogsift_dev_stop` - Stop development server
- `fogsift_deploy` - Deploy to Cloudflare Pages
- `fogsift_content_update` - Update content files
- `fogsift_queue_*` - Queue management tools

### Standard Tools
- File read/write operations
- Git operations (with validation)
- Path validation (security)

## Constraints

### Path Validation
- ✅ All file operations must validate paths
- ✅ Reject path traversal attempts (`..`)
- ✅ Reject absolute paths outside project
- ✅ Validate symlinks
- ✅ Exclude sensitive files (`.env`, `secrets/`, `.git/config`)

### Security
- ✅ Never commit sensitive data
- ✅ Validate all user input
- ✅ Sanitize HTML/CSS/JS before writing
- ✅ Check file permissions before operations

### Build System
- ✅ Always test builds after changes
- ✅ Verify no build errors introduced
- ✅ Check for linting issues
- ✅ Validate HTML/CSS/JS syntax

### Git Workflow
- ✅ Create descriptive commit messages
- ✅ Test changes before committing
- ✅ Use feature branches for major changes
- ✅ Never force push to main branch

## File Structure

```
fogsift/
├── src/
│   ├── index.html          # Main page
│   ├── css/                 # Stylesheets
│   │   ├── tokens.css      # Design tokens
│   │   ├── base.css        # Reset, typography
│   │   ├── components.css  # UI components
│   │   ├── navigation.css  # Nav styles
│   │   └── sleep.css       # Sleep mode styles
│   ├── js/                  # JavaScript modules
│   │   ├── main.js         # App init
│   │   ├── theme.js        # Theme toggle
│   │   ├── modal.js        # Modal system
│   │   ├── toast.js        # Notifications
│   │   └── sleep.js        # Easter egg
│   └── wiki/               # Markdown wiki content
├── dist/                   # Built output (generated)
├── scripts/                # Build scripts
└── _pyrite/                # WAFT memory structure
```

## Work Effort Tracking

Work efforts for FogSift should:
- Be stored in EasyStore Realm when available: `/Volumes/Easystore/waft/fogsift/Realms/EasyStore_Realm/_work_efforts/`
- Fallback to local storage: `/Users/ctavolazzi/Code/fogsift/_work_efforts/`
- Follow WE-YYMMDD-xxxx format
- Include proper metadata and dependencies

## Notes

- FogSift is a vanilla web project (no frameworks)
- Build system uses Node.js scripts
- Hosting is on Cloudflare Pages
- Wiki content is Markdown converted to HTML at build time
- Dark/light theme support with local storage
- PWA-ready with service worker
