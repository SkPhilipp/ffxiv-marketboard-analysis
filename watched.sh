#!/usr/bin/env bash

for watch_file in ./watches/*
do
    node index.js "$watch_file"
done
