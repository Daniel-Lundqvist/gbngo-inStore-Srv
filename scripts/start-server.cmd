@echo off
cls
echo.
echo.
echo.
echo   +---------------------------------------------------+
echo   :                                                   :
echo   :        GBNGO InStore Portal - Backend             :
echo   :                                                   :
echo   +---------------------------------------------------+
echo   :                                                   :
echo   :   Status:    Starting...                          :
echo   :   Port:      5250                                 :
echo   :                                                   :
echo   :   Endpoints:                                      :
echo   :   - API:     http://localhost:5250/api            :
echo   :   - Health:  http://localhost:5250/api/health     :
echo   :   - Uploads: http://localhost:5250/uploads        :
echo   :                                                   :
echo   +---------------------------------------------------+
echo.
echo.
cd /d "%~dp0..\server"
npm run dev
