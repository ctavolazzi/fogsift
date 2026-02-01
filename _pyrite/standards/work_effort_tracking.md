# Work Effort Tracking Configuration for FogSift

**Created**: 2026-01-25  
**Purpose**: Configure work effort tracking system for FogSift-related work

---

## Storage Locations

### Primary: EasyStore Realm
When the EasyStore drive is available:
- **Path**: `/Volumes/Easystore/waft/fogsift/Realms/EasyStore_Realm/_work_efforts/`
- **Structure**: Standard WAFT work effort structure
- **Format**: `WE-YYMMDD-xxxx_description/`

### Fallback: Local Storage
When EasyStore is unavailable:
- **Path**: `/Users/ctavolazzi/Code/fogsift/_work_efforts/`
- **Structure**: Same as EasyStore Realm
- **Format**: `WE-YYMMDD-xxxx_description/`

## Routing Mechanism

Work efforts should be routed based on EasyStore availability:

1. **Check EasyStore availability**: Test if `/Volumes/Easystore` is mounted
2. **If available**: Route to EasyStore Realm path
3. **If unavailable**: Route to local fallback path
4. **Log routing decision**: Record where work effort was stored

## Work Effort Format

### Naming Convention
- Format: `WE-YYMMDD-xxxx_description`
- Example: `WE-260125-a1b2_fogsift_feature_implementation`
- Use lowercase, underscores for spaces

### Directory Structure
```
WE-YYMMDD-xxxx_description/
├── WE-YYMMDD-xxxx_index.md    # Main work effort file
├── tickets/                    # Individual tickets
│   ├── TKT-xxxx-001_*.md
│   └── TKT-xxxx-002_*.md
└── tools/                      # Tool bags (optional)
    └── README.md
```

### Metadata
Each work effort should include:
- `id`: Work effort ID (e.g., `WE-260125-a1b2`)
- `title`: Descriptive title
- `status`: `open`, `in_progress`, `completed`, `paused`
- `priority`: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
- `created`: ISO 8601 timestamp
- `created_by`: Username
- `repository`: `fogsift` or `waft`
- `storage_location`: `easystore_realm` or `local`
- `storage_path`: Full path to work effort
- `dependencies`: List of blocking work effort IDs
- `blocks`: List of work efforts this blocks

## Integration with WAFT

### WAFT Work Effort MCP Server
Use the `user-work-efforts` MCP server to:
- Create new work efforts
- Update work effort status
- Search for existing work efforts
- Link work efforts to tickets

### Cross-Repository Work Efforts
Work efforts can be stored in either:
- **WAFT repository**: `/Users/ctavolazzi/Code/active/waft/_work_efforts/`
  - Use when work effort is WAFT-specific
  - Example: WAFT agent development for FogSift
  
- **FogSift repository**: `/Users/ctavolazzi/Code/fogsift/_work_efforts/`
  - Use when work effort is FogSift-specific
  - Example: Feature implementation on FogSift website

- **EasyStore Realm**: `/Volumes/Easystore/waft/fogsift/Realms/EasyStore_Realm/_work_efforts/`
  - Use when available for long-term storage
  - Preferred location for completed work efforts

## Verification

To verify work effort tracking is working:

1. **Check storage location**: Verify EasyStore or local path exists
2. **Test work effort creation**: Create a test work effort
3. **Test routing**: Verify work effort goes to correct location
4. **Test retrieval**: Verify work effort can be found and read
5. **Test cross-repo access**: Verify WAFT can access FogSift work efforts

## Notes

- Work efforts are currently stored in WAFT repo during development
- Will be moved to EasyStore Realm when drive is available
- All work efforts should be git-tracked
- Use `.gitkeep` files to ensure empty directories are tracked
