@echo off
rem Double-click this file to sync new items from Chairish in a plain
rem console window. If you'd rather use the app with the logo icon instead,
rem see "Sync From Chairish.hta" in this same folder - both do the same
rem thing, this one just shows its progress in a console window instead
rem of the app's own window.
call "%~dp0sync-chairish-core.bat"
echo.
pause
