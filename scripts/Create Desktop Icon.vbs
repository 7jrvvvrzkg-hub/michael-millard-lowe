' Double-click this file ONCE. It adds a "Sync From Chairish" shortcut to
' your Desktop with a proper icon - from then on, use that Desktop
' shortcut instead of hunting through this folder.
'
' (Windows doesn't let a plain .bat file carry its own custom icon the way
' a Mac app can - a desktop shortcut pointed at it, with an icon attached,
' is the standard, reliable way to get the same result.)

Dim fso, scriptDir, oWS, sLinkFile, oLink

Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

Set oWS = CreateObject("WScript.Shell")
sLinkFile = oWS.SpecialFolders("Desktop") & "\Sync From Chairish.lnk"

Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = scriptDir & "\sync-double-click.bat"
oLink.WorkingDirectory = scriptDir
oLink.IconLocation = scriptDir & "\MillardLoweSync.ico"
oLink.Description = "Sync new items from Chairish"
oLink.Save

MsgBox "Done! A ""Sync From Chairish"" icon has been added to your Desktop." & vbCrLf & vbCrLf & "Use that one from now on.", vbInformation, "Setup Complete"
