@echo off
REM ---------------------------------------------------------------------------
REM Double-click this file to sync new items from Chairish.
REM No terminal typing required - just double-click, watch it work, done.
REM ---------------------------------------------------------------------------
REM This runs the exact same sync as `npm run sync:chairish`, then saves the
REM result straight to GitHub so the live website updates automatically
REM (usually within about a minute). It exists because the "Sync from
REM Chairish" button on the website itself runs on Vercel's servers, which
REM Chairish sometimes blocks as automated traffic - this script runs from
REM your own computer's internet connection instead, which doesn't have that
REM problem.
REM
REM One-time setup (done once by whoever set up this project, not something
REM you need to worry about): Node.js and git need to be installed, and this
REM folder needs to be a clone of the project's GitHub repo with push access
REM already configured.

cd /d "%~dp0.."

echo.
echo Michael Millard-Lowe Antiques - Chairish Sync
echo ==============================================
echo.

if not exist "node_modules" (
  echo First-time setup - installing a few things ^(only happens once, may take a minute^)...
  call npm install
  echo.
)

call npm run sync:chairish

echo.
echo Saving changes...
git add data/listings.json
git diff --cached --quiet
if %errorlevel%==0 (
  echo Nothing new to save.
) else (
  git commit -m "Sync from Chairish" >nul
  git push >nul 2>&1
  if errorlevel 1 (
    echo Ran the sync, but couldn't save it automatically.
    echo Ask your developer to check that git is set up with access to this repository.
  ) else (
    echo Done! The website will update automatically in about a minute.
  )
)

echo.
pause
