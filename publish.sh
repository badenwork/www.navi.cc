#!/bin/sh -eu
# -e: Exit immediately if a command exits with a non-zero status.
# -u: Treat unset variables as an error when substituting.

BRANCH=`git rev-parse --abbrev-ref HEAD`
USER=wwwnavicc
HOST=new.navi.cc

echo "Publich: $BRANCH"

grunt production || exit
grunt test || exit
echo rsync -avz --delete -e ssh ./dist/ $USER@$HOST:~/SDK/newgps.navi.cc/www-$BRANCH/


#cd ../www.navi.cc.ghpages
