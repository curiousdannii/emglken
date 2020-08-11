/*

Emglken port of TADS
====================

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

const EmglkenVM = require('./vm.js')
const TADSCore = require('../build/tads-core.js')

module.exports = class TADS extends EmglkenVM
{
    default_options()
    {
        return {
            vmcore: TADSCore,
        }
    }
}