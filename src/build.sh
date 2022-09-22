#!/bin/sh

cd "$(dirname "$0")/.."

EMVERSION=$(grep -oP '"emscripten-version":\s*"\K[\d.]+' package.json)

echo "Building Emglken with Emscripten v$EMVERSION"

mkdir -p build

docker run --rm -t \
    -u $(id -u):$(id -g) \
    -v $(pwd):/src \
    emscripten/emsdk:$EMVERSION \
    /bin/bash -c " \\
        emcmake cmake -DCMAKE_BUILD_TYPE=Release -S . -B build; \\
        emmake make -j$(nproc) --no-print-directory -C build \\
    "