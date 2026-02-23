#!/bin/bash
#
# AI Learning Lab Setup
# Double-click this file to install
#

# Make this look like a real app installer
clear

# ═══════════════════════════════════════════════════════════════════════
# STEP 1: WELCOME SCREEN
# ═══════════════════════════════════════════════════════════════════════

osascript <<'WELCOME'
tell application "System Events"
    set userChoice to button returned of (display dialog "Welcome to AI Learning Lab Setup

This installer will:
• Check your system requirements
• Install necessary components
• Create a local AI assistant
• Set up learning tools

Total time: 5-10 minutes
Disk space required: 5GB

Click Continue to begin." buttons {"Quit", "Continue"} default button "Continue" with title "AI Learning Lab Setup" with icon note)
    
    if userChoice is "Quit" then
        error number -128
    end if
end tell
WELCOME

if [ $? -ne 0 ]; then
    exit 0
fi

# ═══════════════════════════════════════════════════════════════════════
# STEP 2: SYSTEM CHECK
# ═══════════════════════════════════════════════════════════════════════

osascript -e 'display notification "Checking your system..." with title "AI Learning Lab Setup" subtitle "Step 1 of 4"'

# Check macOS version
MACOS_VERSION=$(sw_vers -productVersion)
MACOS_MAJOR=$(echo $MACOS_VERSION | cut -d. -f1)

if [ $MACOS_MAJOR -lt 12 ]; then
    osascript -e 'display dialog "❌ macOS 12 (Monterey) or later required

Your version: '"$MACOS_VERSION"'

Please update macOS to continue." buttons {"OK"} default button "OK" with icon stop'
    exit 1
fi

# Check RAM
TOTAL_RAM_GB=$(($(sysctl -n hw.memsize) / 1024 / 1024 / 1024))

if [ $TOTAL_RAM_GB -lt 8 ]; then
    osascript -e 'display dialog "⚠️ Low Memory Detected

Your Mac has '"$TOTAL_RAM_GB"'GB of RAM.
We recommend at least 8GB for best performance.

Installation can continue, but AI responses may be slow." buttons {"Cancel", "Continue Anyway"} default button "Cancel" with icon caution'
    
    if [ $? -ne 0 ]; then
        exit 0
    fi
fi

# Check available disk space
AVAILABLE_GB=$(df -g / | awk 'NR==2 {print $4}')

if [ $AVAILABLE_GB -lt 10 ]; then
    osascript -e 'display dialog "❌ Insufficient disk space

Available: '"$AVAILABLE_GB"'GB
Required: 10GB

Please free up space and try again." buttons {"OK"} default button "OK" with icon stop'
    exit 1
fi

# System check passed
osascript -e 'display dialog "✅ System Check Complete

macOS: '"$MACOS_VERSION"'
RAM: '"$TOTAL_RAM_GB"'GB
Free Space: '"$AVAILABLE_GB"'GB

Your system meets all requirements!" buttons {"Continue"} default button "Continue" with icon note'

# ═══════════════════════════════════════════════════════════════════════
# STEP 3: SAFETY AGREEMENT
# ═══════════════════════════════════════════════════════════════════════

AGREEMENT=$(osascript <<'SAFETY'
tell application "System Events"
    set userResponse to button returned of (display dialog "⚠️  Important Safety Information

AI Learning Lab teaches you about AI development tools.

You will learn:
• How AI generates code
• Why some commands are dangerous
• How to verify before executing
• Safe practices for AI usage

This is EDUCATIONAL software.
We show you REAL risks so you learn to avoid them.

Do you understand and agree to use this responsibly?" buttons {"I Don't Agree", "I Agree"} default button "I Agree" with icon caution)
    return userResponse
end tell
SAFETY
)

if [ "$AGREEMENT" != "I Agree" ]; then
    exit 0
fi

# ═══════════════════════════════════════════════════════════════════════
# STEP 4: INSTALLATION LOCATION
# ═══════════════════════════════════════════════════════════════════════

INSTALL_LOCATION="$HOME/Applications/AI Learning Lab"

LOCATION_CHOICE=$(osascript <<EOF
tell application "System Events"
    set userResponse to button returned of (display dialog "Choose Installation Location

Default location:
$INSTALL_LOCATION

This creates:
• Application launcher
• Learning materials
• AI models (2-3GB)
• Documentation

You can change this location or use the default." buttons {"Change...", "Use Default"} default button "Use Default")
    return userResponse
end tell
EOF
)

if [ "$LOCATION_CHOICE" = "Change..." ]; then
    CUSTOM_LOCATION=$(osascript -e 'POSIX path of (choose folder with prompt "Select installation folder:")')
    if [ $? -eq 0 ] && [ -n "$CUSTOM_LOCATION" ]; then
        INSTALL_LOCATION="${CUSTOM_LOCATION}AI Learning Lab"
    fi
fi

# ═══════════════════════════════════════════════════════════════════════
# STEP 5: DOCKER CHECK
# ═══════════════════════════════════════════════════════════════════════

osascript -e 'display notification "Checking dependencies..." with title "AI Learning Lab Setup" subtitle "Step 2 of 4"'

if ! command -v docker &> /dev/null; then
    DOCKER_CHOICE=$(osascript <<'DOCKERPROMPT'
tell application "System Events"
    set userResponse to button returned of (display dialog "Docker Required

AI Learning Lab needs Docker Desktop to run safely in an isolated environment.

Docker is free and used by millions of developers worldwide.

Would you like to install Docker now?" buttons {"Cancel", "Open Docker Website"} default button "Open Docker Website" with icon caution)
    return userResponse
end tell
DOCKERPROMPT
)
    
    if [ "$DOCKER_CHOICE" = "Open Docker Website" ]; then
        open "https://www.docker.com/products/docker-desktop"
        osascript -e 'display dialog "After installing Docker Desktop:

1. Open Docker Desktop
2. Wait for it to start (whale icon in menu bar)
3. Run this installer again

The installer will now close." buttons {"OK"} default button "OK"'
        exit 0
    else
        exit 0
    fi
fi

# Check if Docker is running
if ! docker info &> /dev/null 2>&1; then
    osascript -e 'display notification "Starting Docker..." with title "AI Learning Lab Setup"'
    open -a Docker
    
    # Wait for Docker to start
    for i in {1..30}; do
        if docker info &> /dev/null 2>&1; then
            break
        fi
        sleep 2
    done
    
    if ! docker info &> /dev/null 2>&1; then
        osascript -e 'display dialog "Docker is not running

Please:
1. Open Docker Desktop
2. Wait for the whale icon in the menu bar
3. Run this installer again" buttons {"OK"} default button "OK" with icon stop'
        exit 1
    fi
fi

# ═══════════════════════════════════════════════════════════════════════
# STEP 6: INSTALLATION
# ═══════════════════════════════════════════════════════════════════════

osascript -e 'display notification "Installing AI Learning Lab..." with title "AI Learning Lab Setup" subtitle "Step 3 of 4"'

# Create installation directory
mkdir -p "$INSTALL_LOCATION"
cd "$INSTALL_LOCATION"

# Create progress log
exec > >(tee -a "installation.log") 2>&1

echo "Installation started: $(date)"
echo "Location: $INSTALL_LOCATION"
echo "System: $MACOS_VERSION, ${TOTAL_RAM_GB}GB RAM"
echo ""

# Determine best model based on RAM
if [ $TOTAL_RAM_GB -ge 16 ]; then
    MODEL_SIZE="3b"
    echo "Selected: Llama 3.2 3B (Excellent quality)"
elif [ $TOTAL_RAM_GB -ge 8 ]; then
    MODEL_SIZE="3b"
    echo "Selected: Llama 3.2 3B (Good quality)"
else
    MODEL_SIZE="1b"
    echo "Selected: Llama 3.2 1B (Optimized for your system)"
fi

# Create Docker network
docker network create ai-learning-lab 2>/dev/null || true

# Start AI server
echo "Starting AI server..."
docker run -d \
    --name ai-learning-lab \
    --network ai-learning-lab \
    -p 8080:8080 \
    --restart unless-stopped \
    ghcr.io/ggml-org/llama.cpp:server \
    --hf-repo "bartowski/Llama-3.2-${MODEL_SIZE}-Instruct-GGUF" \
    --hf-file "Llama-3.2-${MODEL_SIZE}-Instruct-Q4_K_M.gguf" \
    -c 2048 \
    2>&1

# Wait for server to be ready
echo "Waiting for AI server to start..."
RETRY_COUNT=0
while [ $RETRY_COUNT -lt 60 ]; do
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo "AI server is ready!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 3
done

if [ $RETRY_COUNT -eq 60 ]; then
    osascript -e 'display dialog "Installation failed

The AI server did not start properly.

Check installation.log for details." buttons {"OK"} default button "OK" with icon stop'
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════
# STEP 7: CREATE LAUNCHER
# ═══════════════════════════════════════════════════════════════════════

cat > "$INSTALL_LOCATION/Launch AI Learning Lab.command" << 'LAUNCHER'
#!/bin/bash

# Check if server is running
if ! docker ps | grep -q ai-learning-lab; then
    osascript -e 'display notification "Starting AI Learning Lab..." with title "AI Learning Lab"'
    docker start ai-learning-lab
    sleep 5
fi

# Open web interface
open http://localhost:8080

# Show status
osascript <<'STATUS'
tell application "System Events"
    display dialog "AI Learning Lab is running!

Web Interface: http://localhost:8080

To stop the AI server:
• Close this window
• Or run: docker stop ai-learning-lab

Learning materials are in:
~/Applications/AI Learning Lab" buttons {"Open Learning Materials", "OK"} default button "OK"
    
    if button returned of result is "Open Learning Materials" then
        do shell script "open ~/Applications/'AI Learning Lab'"
    end if
end tell
STATUS
LAUNCHER

chmod +x "$INSTALL_LOCATION/Launch AI Learning Lab.command"

# ═══════════════════════════════════════════════════════════════════════
# STEP 8: CREATE LEARNING MATERIALS
# ═══════════════════════════════════════════════════════════════════════

cat > "$INSTALL_LOCATION/Quick Start Guide.txt" << 'QUICKSTART'
AI Learning Lab - Quick Start Guide
====================================

GETTING STARTED
---------------
1. Double-click "Launch AI Learning Lab"
2. Your browser will open to http://localhost:8080
3. Start chatting with your AI assistant!

WHAT YOU'RE RUNNING
-------------------
• Model: Llama 3.2 (same architecture as ChatGPT)
• Location: Your computer (nothing sent to cloud)
• Privacy: 100% local, no data collection

LEARNING ACTIVITIES
-------------------
Try these prompts to learn safely:

1. "Explain how you work"
   → Understand AI fundamentals

2. "Write a bash command to list files"
   → See command generation

3. "What's dangerous about rm -rf /"
   → Learn about risky commands

4. "Help me understand Docker"
   → Explore the technology

SAFETY REMINDERS
----------------
✓ This AI runs on YOUR computer
✓ No commands execute automatically
✓ Always verify before running code
✓ When in doubt, ask "is this safe?"

MANAGEMENT
----------
Start: Double-click the launcher
Stop: docker stop ai-learning-lab
Restart: docker restart ai-learning-lab
Remove: Open "Uninstall" file

MORE HELP
---------
Documentation: README.md
Installation log: installation.log
Troubleshooting: http://localhost:8080/health

Remember: The best AI tool is an educated human!
QUICKSTART

# Create README
cat > "$INSTALL_LOCATION/README.md" << 'README'
# AI Learning Lab

## What Is This?

AI Learning Lab is an educational tool that lets you run AI models locally on your Mac. You'll learn:

- How AI language models work
- Safe practices for AI-generated code
- The difference between local and cloud AI
- Real-world AI development workflows

## What's Installed

- **AI Server**: Llama 3.2 running in Docker
- **Web Interface**: ChatGPT-like interface at http://localhost:8080
- **Learning Materials**: Guides and examples
- **Launcher**: Easy start/stop application

## Daily Use

1. Double-click "Launch AI Learning Lab"
2. Wait for browser to open
3. Start learning!

The AI server runs in the background and uses about 2-4GB of RAM.

## Technical Details

**Model**: Llama 3.2 (Meta)
**Quantization**: 4-bit (Q4_K_M)
**Context Window**: 2048 tokens
**API**: OpenAI-compatible

## Privacy

Everything runs on your computer. No data is sent to external servers. Your conversations are never logged or analyzed.

## Management Commands

If you're comfortable with Terminal:

```bash
# Start
docker start ai-learning-lab

# Stop
docker stop ai-learning-lab

# View logs
docker logs ai-learning-lab

# Restart
docker restart ai-learning-lab
```

## Troubleshooting

**Server won't start:**
- Make sure Docker Desktop is running
- Check: docker ps -a
- View logs: docker logs ai-learning-lab

**Web interface won't load:**
- Wait 30 seconds after starting
- Check: curl http://localhost:8080/health
- Restart: docker restart ai-learning-lab

**Out of memory:**
- Close other applications
- Restart Docker Desktop
- Consider upgrading RAM

## Uninstalling

1. Run "Uninstall AI Learning Lab"
2. Or manually:
   - docker rm -f ai-learning-lab
   - docker network rm ai-learning-lab
   - Delete this folder

## Learning More

- [llama.cpp documentation](https://github.com/ggerganov/llama.cpp)
- [Docker basics](https://docs.docker.com/get-started/)
- [Responsible AI usage](https://www.anthropic.com/index/claude-character)

---

Built with educational intent. Part of the FogSift transparency initiative.
README

# Create uninstaller
cat > "$INSTALL_LOCATION/Uninstall AI Learning Lab.command" << 'UNINSTALL'
#!/bin/bash

CONFIRM=$(osascript <<'CONFIRMDIALOG'
tell application "System Events"
    set userResponse to button returned of (display dialog "Uninstall AI Learning Lab?

This will remove:
• AI server and models
• Learning materials
• Application files

Your Docker installation will not be affected.

This cannot be undone." buttons {"Cancel", "Uninstall"} default button "Cancel" with icon caution)
    return userResponse
end tell
CONFIRMDIALOG
)

if [ "$CONFIRM" = "Uninstall" ]; then
    # Stop and remove container
    docker rm -f ai-learning-lab 2>/dev/null
    docker network rm ai-learning-lab 2>/dev/null
    
    # Remove files
    rm -rf "$HOME/Applications/AI Learning Lab"
    
    osascript -e 'display dialog "AI Learning Lab has been uninstalled.

Thank you for learning with us!" buttons {"OK"} default button "OK"'
fi
UNINSTALL

chmod +x "$INSTALL_LOCATION/Uninstall AI Learning Lab.command"

# ═══════════════════════════════════════════════════════════════════════
# STEP 9: SUCCESS
# ═══════════════════════════════════════════════════════════════════════

osascript -e 'display notification "Installation complete!" with title "AI Learning Lab Setup" subtitle "Step 4 of 4"'

echo ""
echo "Installation completed: $(date)"
echo ""

LAUNCH_NOW=$(osascript <<EOF
tell application "System Events"
    set userResponse to button returned of (display dialog "✅ Installation Complete!

AI Learning Lab is ready to use.

Installed to:
$INSTALL_LOCATION

Would you like to launch it now?" buttons {"Later", "Launch Now"} default button "Launch Now" with icon note)
    return userResponse
end tell
EOF
)

if [ "$LAUNCH_NOW" = "Launch Now" ]; then
    "$INSTALL_LOCATION/Launch AI Learning Lab.command"
else
    osascript -e 'display dialog "You can launch AI Learning Lab anytime by:

1. Opening: '"$INSTALL_LOCATION"'
2. Double-clicking: Launch AI Learning Lab

Enjoy learning!" buttons {"OK"} default button "OK"'
fi

exit 0
