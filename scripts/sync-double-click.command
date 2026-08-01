#!/bin/bash
# Double-click this file to sync new items from Chairish in a plain
# Terminal window. If you'd rather use the app with the logo icon instead,
# see "Sync From Chairish.app" in this same folder - both do the same
# thing, this one just shows its progress in Terminal instead of a dialog.
DIR="$(cd "$(dirname "$0")" && pwd)"
bash "$DIR/sync-chairish-core.sh"
echo ""
read -n 1 -s -r -p "All done - press any key to close this window..."
echo ""
