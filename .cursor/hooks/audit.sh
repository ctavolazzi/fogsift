#!/bin/bash

# audit.sh - Hook script that writes all JSON input to /tmp/agent-audit.log

json_input=$(cat)
timestamp=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$(dirname /tmp/agent-audit.log)"
echo "[$timestamp] $json_input" >> /tmp/agent-audit.log

exit 0
