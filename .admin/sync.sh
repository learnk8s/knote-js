#!/bin/bash

usage() {
  cat <<EOF
$(basename $0) sources targets [target-root]

ARGUMENTS:
  sources:     comma-separated list of files and directories
  targets:     comma-separated list target directories
  target-root: common dirname of all the target directories (default is ".")

EXAMPLES:
  $(basename $0) index.js,package.json,package-lock.json,public,views 01,02,03,04,05
  $(basename $0) kube/mongo.yaml 03,04,05
  $(basename $0) kube 04,05
EOF
}

[[ "$#" -ne 2 && "$#" -ne 3 ]] && { usage; exit 1; }

IFS=, sources=($1)
IFS=, targets=($2)
targetRoot=${3:-.}

for s in "${sources[@]}"; do
  s=${s%/}
  for t in "${targets[@]}"; do
    t=${targetRoot%/}/${t%/}
    [[ -d "$s" ]] && rm -rf "$t/$s"
    mkdir -p "$t/$(dirname $s)"
    cp -r "$s" "$t/$(dirname $s)"
  done 
done
