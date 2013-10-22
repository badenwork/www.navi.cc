#!/bin/sh


BRANCH=`git rev-parse --abbrev-ref HEAD`
USER=wwwnavicc
HOST=new.navi.cc

echo "Publich: $BRANCH"

grunt production
rsync -avz --delete -e ssh ./dist/ $USER@$HOST:~/SDK/newgps.navi.cc/www-$BRANCH/


#cd ../www.navi.cc.ghpages
