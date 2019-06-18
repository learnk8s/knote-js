#!/bin/bash

root=${1:-.}
tree -a -I 'node_modules|uploads|.git*' "$root"

