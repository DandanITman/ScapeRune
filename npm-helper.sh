#!/bin/bash
# Helper script to run npm commands with proper Node.js environment

export NVM_DIR="$HOME/.var/app/com.visualstudio.code/config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

cd /home/daniel/Documents/VibeCode/Scaperune

# If no arguments provided, show available scripts
if [ $# -eq 0 ]; then
    echo "Available npm scripts:"
    npm run
else
    # Run npm with the provided arguments
    npm "$@"
fi
