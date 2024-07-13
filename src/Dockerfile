# Cross-language LTO needs the Rust and Emscripten LLVM versions to be compatible
# See https://doc.rust-lang.org/rustc/linker-plugin-lto.html

# LLVM version: 18~19
FROM emscripten/emsdk:3.1.63

ENV CARGO_HOME=/.cargo \
    PATH="/.cargo/bin:$PATH" \
    RUSTUP_HOME=/.rustup

RUN embuilder --lto=thin build libc libc++abi-noexcept libc++-noexcept libcompiler_rt \
    libdlmalloc libsockets libstubs zlib

# LLVM version: 17
RUN curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain 1.77.0 --target wasm32-unknown-emscripten -y && \
    chmod -R 777 /.cargo /.rustup /emsdk