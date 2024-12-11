#!/usr/bin/env node

// Write build/file-sizes.json

import * as fs from 'fs'
import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'
import {gzipSync} from 'zlib'

const results = {};

function add_file(name, path) {
    const data = fs.readFileSync(path)
    const data_gz = gzipSync(data)
    results[name] = {
        size: data.length,
        gz: data_gz.length,
    }
}

const build_path = resolve(dirname(fileURLToPath(import.meta.url)), '../build')
for (const file of fs.readdirSync(build_path)) {
    if (file.endsWith('.wasm')) {
        add_file(file, resolve(build_path, file))
    }
}

add_file('glkaudio_bg.wasm', resolve(build_path, '../asyncglk/src/glkaudio/pkg/glkaudio_bg.wasm'))

fs.writeFileSync(resolve(build_path, 'file-sizes.json'), JSON.stringify(results))