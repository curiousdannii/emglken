FROM emscripten/emsdk:3.1.53

ENV CARGO_HOME=/.cargo \
    PATH="/.cargo/bin:$PATH" \
    RUSTUP_HOME=/.rustup

RUN curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain 1.76.0 --target wasm32-unknown-emscripten -y && \
    chmod -R 777 /.cargo /.rustup