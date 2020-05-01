#!/usr/bin/env bash

for watch_file in $(find watches -name '*.json')
do
    node index.js "$watch_file"
done
