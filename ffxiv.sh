#!/usr/bin/env bash

for watch_file in $(find watches -name '*.json')
do
    echo "$watch_file.html"
    node index.js "$watch_file" --html
done
