@echo off
cls
echo.
echo.
echo.
echo   +---------------------------------------------------+
echo   :                                                   :
echo   :        GBNGO InStore Portal - Frontend            :
echo   :                                                   :
echo   +---------------------------------------------------+
echo   :                                                   :
echo   :   Port:      5251                                 :
echo   :   Backend:   5250 (other tab)                     :
echo   :                                                   :
echo   :   Pages:                                          :
echo   :   - App:     http://localhost:5251                :
echo   :   - Admin:   http://localhost:5251/admin          :
echo   :                                                   :
echo   :   CTRL + click link above to open browser         :
echo   :                                                   :
echo   +---------------------------------------------------+
echo.
cd /d "%~dp0..\client"
npm run dev
