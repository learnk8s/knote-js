#!/usr/bin/env bash

echo $1

mkdir -p config
cp ../environments/$1/configmap/* config/

if [ -d  ../environments/$1/secret ]; then
  mkdir -p secret
  cp ../environments/$1/secret/* secret/
fi


helm package .
