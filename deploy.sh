#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# copy image files
cp *.gz dist/

# navigate into the build output directory
cd dist

git checkout main
git add -A
git commit -m 'deploy'

git push -f git@github.com:niivue/niivue-niimath.git main:gh-pages

cd -
