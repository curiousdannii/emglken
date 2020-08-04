/*

Emglken port of Glulxe
======================

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

import { createRequire } from 'module'

import EmglkenVM from './vm.mjs'

const require = createRequire(import.meta.url)

// Can't work until https://github.com/emscripten-core/emscripten/issues/11792 is fixed
//let GlulxCore = '../build/glulxe-core.js'
// So instead require CommonJS module
const GlulxCore = require('../build/glulxe-core.js')

class Glulxe extends EmglkenVM
{
    default_options()
    {
        return {
            vmcore: GlulxCore,
        }
    }
}

export default Glulxe