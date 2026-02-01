# FogSift MCP Audit

Summarize MCP configuration without modifying it.

## Steps
1. Read `~/.cursor/mcp.json` and list configured servers (mask secrets).
2. Note any project-level `.cursor/mcp.json` if present.
3. Record findings in a short summary (no secrets in repo).

## Guardrails
- Do not print or commit secrets.
- Do not modify `mcp.json` unless explicitly requested.
