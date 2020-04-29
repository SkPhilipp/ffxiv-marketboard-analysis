#!/usr/bin/env bash

for watch_file in ./watches/*
do
    echo "$watch_file.html"
    node index.js "$watch_file" --html
done
