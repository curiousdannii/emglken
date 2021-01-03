/*

Emglken port of Bocfel
======================

Copyright (c) 2021 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

const EmglkenVM = require('./vm.js')
const BocfelCore = require('../build/bocfel-core.js')

module.exports = class Bocfel extends EmglkenVM
{
    default_options()
    {
        return {
            vmcore: BocfelCore,
        }
    }
}