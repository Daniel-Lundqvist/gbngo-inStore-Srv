@echo off
wt --suppressApplicationTitle -d "%~dp0scripts" --title "GBNGO Server (5250)" cmd /k "start-server.cmd" ; --suppressApplicationTitle -d "%~dp0scripts" --title "GBNGO Client (5251)" cmd /k "start-client.cmd"
