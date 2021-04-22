#!/bin/bash

#npm ci
export PATH=$(npm bin):$PATH

mkdir -p build
cd build
emcmake cmake -DCMAKE_BUILD_TYPE=Release ..
emmake make -j$(nproc)