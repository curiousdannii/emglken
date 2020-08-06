/*

Emglken port of Glulxe
======================

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

const EmglkenVM = require('./vm.js')
const GlulxCore = require('../build/glulxe-core.js')

module.exports = class Glulxe extends EmglkenVM
{
    default_options()
    {
        return {
            vmcore: GlulxCore,
        }
    }
}