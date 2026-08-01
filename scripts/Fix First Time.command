#!/bin/bash
# Double-click this ONCE, the first time you use these apps on this Mac.
#
# Why this is needed: macOS marks anything downloaded from the internet
# (including a chat app like this one) as "quarantined." For a plain
# script that's a minor speed bump - you get a normal "are you sure"
# prompt. But for a full app bundle like "Sync From Chairish.app" that
# nobody has code-signed, that same quarantine flag makes macOS refuse
# to open it at all with a "is damaged and should be moved to the Trash"
# message - and, unlike the normal prompt, that one does NOT show up
# anywhere in System Settings to approve. It looks broken, but it isn't;
# this is just macOS being extra cautious about homemade apps.
#
# This script removes that quarantine flag from everything in this
# folder, which fixes it for good. You only need to run this once.

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Michael Millard-Lowe Antiques - One-time setup"
echo "==============================================="
echo ""
echo "Removing the macOS download flag that blocks the app..."

xattr -cr "$DIR" 2>/dev/null

echo "Done!"
echo ""
echo "You can now double-click \"Sync From Chairish\" normally."
echo "(The very first time, macOS may still ask 'Are you sure you want"
echo "to open it?' - that's normal, just click Open.)"
echo ""
read -n 1 -s -r -p "Press any key to close this window..."
echo ""
