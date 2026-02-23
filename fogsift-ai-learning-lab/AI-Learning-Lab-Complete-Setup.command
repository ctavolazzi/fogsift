#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# AI LEARNING LAB - Complete Setup (Mom-Friendly + Hacker Mode)
# Double-click to install. Creates both learning interface and code generator.
# ═══════════════════════════════════════════════════════════════════════════

set -e

# FogSift Colors
CREAM='\033[38;2;245;240;232m'
ORANGE='\033[38;2;217;116;74m'
BROWN='\033[38;2;74;55;40m'
RESET='\033[0m'

INSTALL_DIR="$HOME/Applications/AI Learning Lab"

# ═══════════════════════════════════════════════════════════════════════════
# STEP 1: WELCOME
# ═══════════════════════════════════════════════════════════════════════════

clear
cat << "BANNER"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║                   AI Learning Lab + Vibe Station                  ║
║                                                                   ║
║           Learn AI Safely • Generate Code Magically               ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
BANNER

CHOICE=$(osascript <<'WELCOME'
tell application "System Events"
    set userResponse to button returned of (display dialog "Welcome to AI Learning Lab!

This installer creates TWO experiences:

🎓 LEARNING LAB (Safe Mode)
   • ChatGPT-like interface
   • Ask questions, learn concepts
   • Safe, educational environment

🚀 VIBE STATION (Hacker Mode)
   • AI generates code live
   • Watch it build apps instantly
   • Retro terminal aesthetic

Both run 100% locally. No cloud. Total privacy.

Ready to install?" buttons {"Cancel", "Let's Go!"} default button "Let's Go!" with icon note with title "AI Learning Lab Setup")
    return userResponse
end tell
WELCOME
)

if [ "$CHOICE" != "button returned:Let's Go!" ]; then
    exit 0
fi

# ═══════════════════════════════════════════════════════════════════════════
# STEP 2: SYSTEM CHECK
# ═══════════════════════════════════════════════════════════════════════════

osascript -e 'display notification "Checking your system..." with title "AI Learning Lab Setup" subtitle "Step 1 of 5"'

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
    osascript -e 'display dialog "⚠️ Low Memory Warning

Your Mac has '"$TOTAL_RAM_GB"'GB RAM.
AI works best with 8GB+.

Continue anyway?" buttons {"Cancel", "Continue"} default button "Cancel" with icon caution'
    
    if [ $? -ne 0 ]; then
        exit 0
    fi
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    osascript <<'DOCKERPROMPT'
tell application "System Events"
    display dialog "Docker Desktop Required

AI Learning Lab needs Docker Desktop to run safely.

Docker is:
• Free for personal use
• Used by millions of developers
• Required for isolated AI serving

Would you like to install it?" buttons {"Cancel", "Open Docker Website"} default button "Open Docker Website" with icon caution
end tell
DOCKERPROMPT
    
    if [ $? -eq 0 ]; then
        open "https://www.docker.com/products/docker-desktop"
        osascript -e 'display dialog "After installing Docker Desktop:

1. Open Docker Desktop
2. Wait for the whale icon in menu bar
3. Run this installer again

Installer will now close." buttons {"OK"} default button "OK"'
    fi
    exit 0
fi

# Check if Docker is running
if ! docker info &> /dev/null 2>&1; then
    osascript -e 'display notification "Starting Docker..." with title "AI Learning Lab Setup"'
    open -a Docker
    
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
2. Wait for whale icon to appear
3. Run this installer again" buttons {"OK"} default button "OK" with icon stop'
        exit 1
    fi
fi

# ═══════════════════════════════════════════════════════════════════════════
# STEP 3: CREATE INSTALLATION DIRECTORY
# ═══════════════════════════════════════════════════════════════════════════

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

exec > >(tee -a "installation.log") 2>&1

echo "Installation started: $(date)"
echo "Location: $INSTALL_DIR"
echo "System: $MACOS_VERSION, ${TOTAL_RAM_GB}GB RAM"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 4: INSTALL AI SERVER
# ═══════════════════════════════════════════════════════════════════════════

osascript -e 'display notification "Downloading AI model (2-3GB)..." with title "AI Learning Lab Setup" subtitle "Step 2 of 5"'

# Select model based on RAM
if [ $TOTAL_RAM_GB -ge 16 ]; then
    MODEL_SIZE="3B"
    echo "Selected: Llama 3.2 3B (Excellent quality)"
elif [ $TOTAL_RAM_GB -ge 8 ]; then
    MODEL_SIZE="3B"
    echo "Selected: Llama 3.2 3B (Good quality)"
else
    MODEL_SIZE="1B"
    echo "Selected: Llama 3.2 1B (Optimized for your system)"
fi

# Create network
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
    -c 2048

# Wait for server
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

# ═══════════════════════════════════════════════════════════════════════════
# STEP 5: CREATE LEARNING LAB (Safe Mode)
# ═══════════════════════════════════════════════════════════════════════════

osascript -e 'display notification "Creating Learning Lab..." with title "AI Learning Lab Setup" subtitle "Step 3 of 5"'

cat > "$INSTALL_DIR/index.html" << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Learning Lab</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Crimson Pro', -apple-system, sans-serif;
            background: #F5F0E8;
            color: #4A3728;
            padding: 2rem;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        h1 {
            color: #D9744A;
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .tagline {
            color: #8B7355;
            font-size: 1.1rem;
        }
        
        .mode-selector {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            justify-content: center;
        }
        
        .mode-btn {
            padding: 1rem 2rem;
            background: white;
            border: 2px solid #D4C4B0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 1rem;
        }
        
        .mode-btn:hover {
            border-color: #D9744A;
            transform: translateY(-2px);
        }
        
        .mode-btn.active {
            background: #D9744A;
            color: white;
            border-color: #D9744A;
        }
        
        .chat-container {
            background: white;
            border: 2px solid #D4C4B0;
            border-radius: 12px;
            padding: 2rem;
            min-height: 500px;
            display: flex;
            flex-direction: column;
        }
        
        .chat-history {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 1rem;
            padding: 1rem;
            max-height: 400px;
        }
        
        .message {
            margin-bottom: 1rem;
            padding: 1rem;
            border-radius: 8px;
        }
        
        .message.user {
            background: #FFF9F0;
            margin-left: 2rem;
        }
        
        .message.ai {
            background: #F5F0E8;
            margin-right: 2rem;
        }
        
        .message strong {
            color: #D9744A;
            display: block;
            margin-bottom: 0.5rem;
        }
        
        .input-area {
            display: flex;
            gap: 1rem;
        }
        
        input {
            flex: 1;
            padding: 1rem;
            border: 2px solid #D4C4B0;
            border-radius: 8px;
            font-family: inherit;
            font-size: 1rem;
        }
        
        button {
            padding: 1rem 2rem;
            background: #D9744A;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        button:hover {
            background: #C15A32;
            transform: translateY(-2px);
        }
        
        .example-prompts {
            margin-top: 1rem;
            padding: 1rem;
            background: #FFF9F0;
            border-radius: 8px;
        }
        
        .example-prompts h3 {
            color: #D9744A;
            margin-bottom: 0.5rem;
            font-size: 1rem;
        }
        
        .example-prompts button {
            margin: 0.25rem;
            padding: 0.5rem 1rem;
            background: white;
            color: #D9744A;
            border: 1px solid #D9744A;
            font-size: 0.9rem;
        }
        
        .example-prompts button:hover {
            background: #D9744A;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎓 AI Learning Lab</h1>
            <p class="tagline">Your Local, Private AI Assistant</p>
        </header>
        
        <div class="mode-selector">
            <div class="mode-btn active" onclick="location.href='index.html'">
                💬 Learning Lab
            </div>
            <div class="mode-btn" onclick="launchVibeStation()">
                🚀 Vibe Station
            </div>
        </div>
        
        <div class="chat-container">
            <div class="chat-history" id="history"></div>
            
            <div class="input-area">
                <input 
                    type="text" 
                    id="prompt" 
                    placeholder="Ask me anything about coding, AI, or computer science..."
                    onkeypress="if(event.key==='Enter') send()"
                    autofocus
                >
                <button onclick="send()">Send</button>
            </div>
            
            <div class="example-prompts">
                <h3>Try these:</h3>
                <button onclick="setPrompt('Explain what a variable is in Python')">What's a variable?</button>
                <button onclick="setPrompt('How do if statements work?')">How do if statements work?</button>
                <button onclick="setPrompt('What is machine learning?')">What's machine learning?</button>
                <button onclick="setPrompt('Explain APIs like I\\'m 10')">What's an API?</button>
            </div>
        </div>
    </div>

    <script>
        let chatHistory = "";
        
        function setPrompt(text) {
            document.getElementById('prompt').value = text;
            document.getElementById('prompt').focus();
        }
        
        function launchVibeStation() {
            if (confirm('Launch Vibe Station?\n\nThis will open a terminal window where you can watch AI generate code live!')) {
                // Try to execute the launcher
                alert('Look for "Launch Vibe Station.command" in your Applications/AI Learning Lab folder!\n\nDouble-click it to start the magic. 🚀');
            }
        }
        
        async function send() {
            const promptInput = document.getElementById('prompt');
            const history = document.getElementById('history');
            
            if (!promptInput.value.trim()) return;
            
            const userMsg = promptInput.value;
            
            // Add user message to UI
            const userDiv = document.createElement('div');
            userDiv.className = 'message user';
            userDiv.innerHTML = `<strong>You:</strong> ${userMsg}`;
            history.appendChild(userDiv);
            
            promptInput.value = '';
            history.scrollTop = history.scrollHeight;
            
            // Build context
            chatHistory += `<|start_header_id|>user<|end_header_id|>\n\n${userMsg}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;
            
            try {
                const response = await fetch('http://localhost:8080/completion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: chatHistory,
                        n_predict: 512,
                        temperature: 0.7,
                        stop: ['<|eot_id|>']
                    })
                });
                
                const data = await response.json();
                const aiMsg = data.content;
                
                // Add AI response to UI
                const aiDiv = document.createElement('div');
                aiDiv.className = 'message ai';
                aiDiv.innerHTML = `<strong>AI:</strong> ${aiMsg}`;
                history.appendChild(aiDiv);
                
                // Update context
                chatHistory += `${aiMsg}<|eot_id|>`;
                
                history.scrollTop = history.scrollHeight;
            } catch (error) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'message ai';
                errorDiv.innerHTML = `<strong>Error:</strong> <span style="color: #D9744A;">AI server is offline. Make sure Docker is running!</span>`;
                history.appendChild(errorDiv);
            }
        }
    </script>
</body>
</html>
HTMLEOF

# ═══════════════════════════════════════════════════════════════════════════
# STEP 6: CREATE VIBE STATION (Hacker Mode)
# ═══════════════════════════════════════════════════════════════════════════

osascript -e 'display notification "Creating Vibe Station..." with title "AI Learning Lab Setup" subtitle "Step 4 of 5"'

cat > "$INSTALL_DIR/vibe_station.py" << 'PYEOF'
#!/usr/bin/env python3
import sys
import os
import time
import json
import subprocess
import requests

CYAN = '\033[1;36m'
ORANGE = '\033[1;33m'
GREEN = '\033[1;32m'
RESET = '\033[0m'

def type_effect(text, speed=0.03):
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(speed)
    print()

def main():
    os.system('clear')
    print(f"{CYAN}")
    print(r"""
   __   __  ___  _______  _______    _______  _______  _______ 
  |  | |  ||   ||  _    ||       |  |       ||   _   ||       |
  |  |_|  ||   || |_|   ||    ___|  |__   __||  |_|  ||_     _|
  |       ||   ||       ||   |___      | |   |       |  |   |  
  |       ||   ||  _   | |    ___|     | |   |       |  |   |  
   |     | |   || |_|   ||   |___      | |   |   _   |  |   |  
    |___|  |___||_______||_______|     |_|   |__| |__|  |_|    
    """)
    print(f"{RESET}")
    type_effect(f":: VIBE STATION ONLINE. ENGINE: LLAMA 3.2", 0.05)
    print("-" * 60)
    
    while True:
        try:
            print(f"\n{ORANGE}[ MISSION ]{RESET} Describe your app (e.g., 'Retro weather station for NYC')")
            user_input = input(f"COMMAND >> {GREEN}").strip()
            print(RESET, end='')
            
            if user_input.lower() in ['exit', 'quit', 'q']:
                break
            
            if not user_input:
                continue
            
            type_effect(f"\n{ORANGE}[ VIBE AGENT ]{RESET} Architecting code...", 0.05)
            
            prompt = f"""You are a code generator. Write a complete, working Python script for: {user_input}

REQUIREMENTS:
- Use only standard library or 'requests' (already installed)
- Include all imports
- Make it work immediately
- Add ASCII art if appropriate
- Output ONLY valid Python code

CODE:
"""
            
            try:
                response = requests.post('http://localhost:8080/completion', json={
                    'prompt': prompt,
                    'n_predict': 1024,
                    'temperature': 0.8,
                    'stop': ['```', '\n\n\n']
                }, timeout=30)
                
                code = response.json()['content'].strip()
                
                # Clean up code
                if '```python' in code:
                    code = code.split('```python')[1].split('```')[0].strip()
                elif '```' in code:
                    code = code.split('```')[1].split('```')[0].strip()
                
                print(f"\n{CYAN}--- GENERATED CODE ---{RESET}")
                print(code)
                print(f"{CYAN}----------------------{RESET}\n")
                
                execute = input(f"{ORANGE}[ EXECUTE? ]{RESET} Run this on your Mac now? (y/n) > {GREEN}").strip().lower()
                print(RESET, end='')
                
                if execute == 'y':
                    type_effect(f"{GREEN}[ SYSTEM ]{RESET} Launching...", 0.05)
                    
                    # Write code to temp file
                    with open('/tmp/vibe_app.py', 'w') as f:
                        f.write(code)
                    
                    # Execute
                    subprocess.run(['python3', '/tmp/vibe_app.py'])
                
            except requests.exceptions.Timeout:
                print(f"\n{ORANGE}[ ERROR ]{RESET} AI took too long to respond. Try a simpler request.")
            except Exception as e:
                print(f"\n{ORANGE}[ ERROR ]{RESET} Could not talk to AI: {e}")
                
        except KeyboardInterrupt:
            break
    
    print(f"\n{CYAN}:: VIBE STATION OFFLINE{RESET}\n")

if __name__ == "__main__":
    main()
PYEOF

chmod +x "$INSTALL_DIR/vibe_station.py"

# ═══════════════════════════════════════════════════════════════════════════
# STEP 7: CREATE LAUNCHERS
# ═══════════════════════════════════════════════════════════════════════════

# Learning Lab Launcher (Opens browser)
cat > "$INSTALL_DIR/Launch Learning Lab.command" << 'LABEOF'
#!/bin/bash

# Check if server is running
if ! docker ps | grep -q ai-learning-lab; then
    osascript -e 'display notification "Starting AI server..." with title "AI Learning Lab"'
    docker start ai-learning-lab 2>/dev/null
    sleep 3
fi

# Open web interface
open "$HOME/Applications/AI Learning Lab/index.html"
LABEOF

chmod +x "$INSTALL_DIR/Launch Learning Lab.command"

# Vibe Station Launcher (Opens terminal with Python script)
cat > "$INSTALL_DIR/Launch Vibe Station.command" << 'VIBEEOF'
#!/bin/bash

# Check if server is running
if ! docker ps | grep -q ai-learning-lab; then
    osascript -e 'display notification "Starting AI server..." with title "Vibe Station"'
    docker start ai-learning-lab 2>/dev/null
    sleep 3
fi

# Launch Vibe Station
cd "$HOME/Applications/AI Learning Lab"
python3 vibe_station.py
VIBEEOF

chmod +x "$INSTALL_DIR/Launch Vibe Station.command"

# ═══════════════════════════════════════════════════════════════════════════
# STEP 8: CREATE DOCUMENTATION
# ═══════════════════════════════════════════════════════════════════════════

cat > "$INSTALL_DIR/Quick Start Guide.txt" << 'GUIDEEOF'
AI LEARNING LAB - QUICK START
==============================

You now have TWO ways to use AI:

1. LEARNING LAB (Safe Mode)
   • Double-click: Launch Learning Lab
   • Opens in your browser
   • ChatGPT-like interface
   • Perfect for learning concepts

2. VIBE STATION (Hacker Mode)
   • Double-click: Launch Vibe Station
   • Opens in Terminal
   • Watch AI generate code live
   • Apps execute immediately

EXAMPLE VIBE STATION PROMPTS:
------------------------------
• "Build me a retro weather station for Tokyo"
• "Create an ASCII art generator"
• "Make a Pokemon info fetcher"
• "Build a simple calculator with colors"

TIPS:
-----
• Both use the same AI brain
• Everything runs locally
• No data sent to cloud
• Server starts automatically

MANAGEMENT:
-----------
Check if running: docker ps
Stop server: docker stop ai-learning-lab
Start server: docker start ai-learning-lab
View logs: docker logs ai-learning-lab

Enjoy the magic! 🚀
GUIDEEOF

# ═══════════════════════════════════════════════════════════════════════════
# STEP 9: FINAL PERMISSIONS & COMPLETION
# ═══════════════════════════════════════════════════════════════════════════

# Fix all .command file permissions
chmod +x "$INSTALL_DIR"/*.command 2>/dev/null || true

echo ""
echo "Installation completed: $(date)"
echo ""

osascript -e 'display notification "Installation complete!" with title "AI Learning Lab Setup" subtitle "Step 5 of 5"'

CHOICE=$(osascript <<EOF
tell application "System Events"
    set userResponse to button returned of (display dialog "✅ Installation Complete!

You now have:

🎓 LEARNING LAB
   Safe, educational AI chat

🚀 VIBE STATION
   Live code generation magic

Both installed in:
$INSTALL_DIR

Which would you like to launch first?" buttons {"Vibe Station", "Learning Lab", "Later"} default button "Learning Lab" with icon note)
    return userResponse
end tell
EOF
)

case "$CHOICE" in
    "button returned:Learning Lab")
        "$INSTALL_DIR/Launch Learning Lab.command"
        ;;
    "button returned:Vibe Station")
        "$INSTALL_DIR/Launch Vibe Station.command"
        ;;
    *)
        osascript -e 'display dialog "You can launch either tool anytime from:

'"$INSTALL_DIR"'

Enjoy learning!" buttons {"OK"} default button "OK"'
        open "$INSTALL_DIR"
        ;;
esac

exit 0
