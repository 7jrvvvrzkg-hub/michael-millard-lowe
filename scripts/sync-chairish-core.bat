@echo off
setlocal enabledelayedexpansion
rem ---------------------------------------------------------------------
rem Shared Chairish-sync logic - not meant to be double-clicked directly.
rem ---------------------------------------------------------------------
rem Used by both sync-double-click.bat (runs this in a visible console
rem window, then waits for a keypress) and "Sync From Chairish.hta" (runs
rem this invisibly and shows the output inside its own window instead).
rem Because it can be run non-interactively by the app, this file itself
rem never waits for a keypress and always finishes on its own.

cd /d "%~dp0.."
if errorlevel 1 (
  echo Could not find the project folder - don't move this file out of the scripts folder.
  exit /b 1
)

echo Michael Millard-Lowe Antiques - Chairish Sync
echo ===============================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js isn't installed on this computer yet.
  echo Install it from https://nodejs.org ^(the LTS version^), then try again.
  exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo This folder isn't a real copy of the project from GitHub, so there's
  echo nowhere to save changes to.
  echo Ask your developer to set this up as a proper git clone ^(not just an
  echo unzipped copy^) - see the README's setup section.
  exit /b 1
)

if not exist "node_modules" (
  echo First-time setup - installing a few things ^(only happens once, may take a minute^)...
  call npm install
  echo.
)

call npm run sync:chairish
set SYNC_STATUS=%ERRORLEVEL%

echo.
echo Saving changes...
git add data/listings.json

git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Sync from Chairish" >nul
  git push >nul 2>nul
  if errorlevel 1 (
    echo Ran the sync, but couldn't save it automatically.
    echo Ask your developer to check that git is set up with access to this repository.
  ) else (
    echo Done! The website will update automatically in about a minute.
  )
) else (
  echo Nothing new to save.
)

if not "%SYNC_STATUS%"=="0" (
  echo.
  echo The sync itself hit a problem - scroll up to see what it said.
)

exit /b 0
