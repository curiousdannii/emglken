#!/bin/bash

set -e

cd "$(dirname "$0")"

mkdir -p build

npx esbuild src/asyncglk.ts \
    --bundle \
    --format=esm \
    --outfile=build/asyncglk.js \
    --packages=external \
    --platform=node

# Build the docker image if it doesn't exist
DOCKER_TAG=$(sha1sum src/Dockerfile)
DOCKER_TAG=${DOCKER_TAG:0:8}
if [ -z "$(docker images -q emglken:$DOCKER_TAG 2> /dev/null)" ]; then
    echo "Building Emglken Docker image emglken:$DOCKER_TAG"
    docker build -f src/Dockerfile --tag emglken:$DOCKER_TAG src
fi

DEBUG=
if [[ $DEBUG ]]; then
    CMAKE_TYPE="Debug"
else
    RUST_TARGET="--release"
    CMAKE_TYPE="Release"
fi

docker run --rm -t \
    -u $(id -u):$(id -g) \
    -v $(pwd):/src \
    -v $HOME/.cargo/registry:/.cargo/registry \
    emglken:$DOCKER_TAG \
    /bin/bash -c -e " \\
        RUSTFLAGS=-Csymbol-mangling-version=v0 cargo build \\
            $RUST_TARGET \\
            --target=wasm32-unknown-emscripten; \\
        emcmake cmake -DCMAKE_BUILD_TYPE=$CMAKE_TYPE -S . -B build; \\
        emmake make -j$(nproc) --no-print-directory -C build \\
    "

./tools/write-file-sizes.js