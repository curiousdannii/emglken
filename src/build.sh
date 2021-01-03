#!/bin/bash

#npm ci
export PATH=$(npm bin):$PATH

mkdir -p build
cd build
emcmake cmake ..
emmake make -j$(nproc)