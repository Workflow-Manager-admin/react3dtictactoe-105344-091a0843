#!/bin/bash
cd /home/kavia/workspace/code-generation/react3dtictactoe-105344-091a0843/tic_tac_toe_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

