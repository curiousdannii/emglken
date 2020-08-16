/*

Emglken port of Hugo
====================

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

const EmglkenVM = require('./vm.js')
const HugoCore = require('../build/hugo-core.js')

module.exports = class Hugo extends EmglkenVM
{
    default_options()
    {
        return {
            vmcore: HugoCore,
        }
    }
}