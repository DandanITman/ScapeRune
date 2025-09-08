#!/bin/bash
# Script to run the development server with Node.js from nvm

export NVM_DIR="$HOME/.var/app/com.visualstudio.code/config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

cd /home/daniel/Documents/VibeCode/Scaperune
npm run dev
