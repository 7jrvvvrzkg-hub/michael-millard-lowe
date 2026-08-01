#!/bin/bash
# ---------------------------------------------------------------------------
# Shared Chairish-sync logic - not meant to be double-clicked directly.
# ---------------------------------------------------------------------------
# Used by both sync-double-click.command (runs this in a visible Terminal
# window, then waits for a keypress) and Sync From Chairish.app (runs this
# invisibly and shows the output in a dialog box instead). Because it can
# be run non-interactively by the app, this file itself never waits for a
# keypress and always finishes on its own.
#
# The two checks below turn the most common setup problems into a plain
# one-line explanation instead of a raw "command not found" or a wall of
# git internals - those are exactly what shows up if Node.js isn't
# installed yet, or if this folder is an unzipped copy rather than a real
# `git clone` of the project.

cd "$(dirname "$0")/.." || {
  echo "Could not find the project folder - don't move this file out of the scripts/ folder."
  exit 1
}

echo "Michael Millard-Lowe Antiques - Chairish Sync"
echo "=============================================="
echo ""

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js isn't installed on this computer yet."
  echo "Install it from https://nodejs.org (the LTS version), then try again."
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "This folder isn't a real copy of the project from GitHub, so there's"
  echo "nowhere to save changes to."
  echo "Ask your developer to set this up as a proper git clone (not just an"
  echo "unzipped copy) - see the README's setup section."
  exit 1
fi

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
