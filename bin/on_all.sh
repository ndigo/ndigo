#!/bin/bash
# echo "here $PWD, param1 $1"
if [[ $PWD == *"packages"* ]]; then
  # echo "packages is in pwd!"
  packagesToWork="${PWD##*/}"
else
  # echo "packages is NOT in pwd!"
  packagesToWork="$(ls -d packages/* | sed 's/packages\///; s/\///')"
fi

for package in $packagesToWork; do
  # echo "yarn --cwd packages/$package $1 &"
  eval "yarn --cwd packages/$package $1 &"
done
wait