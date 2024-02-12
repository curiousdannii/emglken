#!/usr/bin/env node

// Write build/file-sizes.json

import * as fs from 'fs'
import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'

const results = {};

const build_path = resolve(dirname(fileURLToPath(import.meta.url)), '../build')
for (const file of fs.readdirSync(build_path)) {
    if (file.endsWith('.js') || file.endsWith('.wasm')) {
        results[file] = fs.statSync(resolve(build_path, file)).size
    }
}

fs.writeFileSync(resolve(build_path, 'file-sizes.json'), JSON.stringify(results))