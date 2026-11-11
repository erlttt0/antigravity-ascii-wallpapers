@echo off
setlocal
title Installing ASCII Wallpapers for Antigravity
cd /d "%~dp0"
echo ===================================================
echo Installing ASCII Wallpapers for Antigravity...
echo ===================================================
echo.
echo [1/3] Closing Antigravity to release file lock...
taskkill /im Antigravity.exe >nul 2>&1
timeout /t 2 /nobreak >nul
taskkill /f /im Antigravity.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo [2/3] Patching app.asar...
node manage-wallpapers.cjs install %*
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Installation failed. See error output above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Relaunching Antigravity...
set "AGY_EXE="
set "CUSTOM_APP="
if defined ANTIGRAVITY_APP_PATH set "CUSTOM_APP=%ANTIGRAVITY_APP_PATH:"=%"
if defined CUSTOM_APP if exist "%CUSTOM_APP%\Antigravity.exe" set "AGY_EXE=%CUSTOM_APP%\Antigravity.exe"
if not defined AGY_EXE if exist "%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" set "AGY_EXE=%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe"
if not defined AGY_EXE if exist "%LOCALAPPDATA%\Programs\Antigravity\Antigravity.exe" set "AGY_EXE=%LOCALAPPDATA%\Programs\Antigravity\Antigravity.exe"
if not defined AGY_EXE if exist "%ProgramFiles%\Antigravity\Antigravity.exe" set "AGY_EXE=%ProgramFiles%\Antigravity\Antigravity.exe"
if defined AGY_EXE (
    start "" "%AGY_EXE%"
) else (
    echo Antigravity executable not found in default locations; reopen Antigravity manually.
)
echo.
echo Installation complete! You can close this window.
timeout /t 3 /nobreak >nul
