#!/bin/bash
# ---------------------------------------------------------------------------
# Double-click this file to sync new items from Chairish.
# No terminal typing required - just double-click, watch it work, done.
# ---------------------------------------------------------------------------
# This runs the exact same sync as `npm run sync:chairish`, then saves the
# result straight to GitHub so the live website updates automatically
# (usually within about a minute). It exists because the "Sync from
# Chairish" button on the website itself runs on Vercel's servers, which
# Chairish sometimes blocks as automated traffic - this script runs from
# your own computer's internet connection instead, which doesn't have that
# problem.
#
# One-time setup (done once by whoever set up this project, not something
# you need to worry about): Node.js and git need to be installed, and this
# folder needs to be a clone of the project's GitHub repo with push access
# already configured.

cd "$(dirname "$0")/.." || {
  echo "Could not find the project folder. Don't move this file out of the scripts/ folder.";
  read -n 1 -s -r -p "Press any key to exit...";
  exit 1;
}

echo ""
echo "Michael Millard-Lowe Antiques - Chairish Sync"
echo "=============================================="
echo ""

if [ ! -d "node_modules" ]; then
  echo "First-time setup - installing a few things (only happens once, may take a minute)..."
  npm install
  echo ""
fi

npm run sync:chairish
sync_status=$?

echo ""
echo "Saving changes..."
git add data/listings.json

if git diff --cached --quiet; then
  echo "Nothing new to save."
else
  git commit -m "Sync from Chairish" >/dev/null
  if git push >/dev/null 2>&1; then
    echo "Done! The website will update automatically in about a minute."
  else
    echo "Ran the sync, but couldn't save it automatically."
    echo "Ask your developer to check that git is set up with access to this repository."
  fi
fi

if [ $sync_status -ne 0 ]; then
  echo ""
  echo "The sync itself hit a problem - scroll up to see what it said."
fi

echo ""
read -n 1 -s -r -p "All done - press any key to close this window..."
echo ""
