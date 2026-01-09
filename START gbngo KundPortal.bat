@echo off
title GBNGO KundPortal Launcher

:: Start Windows Terminal with two tabs: Server and Client
wt -w 0 new-tab --title "GBNGO Server (5250)" -d "%~dp0server" cmd /k "npm run dev" ; new-tab --title "GBNGO Client (5251)" -d "%~dp0client" cmd /k "npm run dev"

exit
