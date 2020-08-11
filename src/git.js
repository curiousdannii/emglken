/*

Emglken port of Git
===================

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

const EmglkenVM = require('./vm.js')
const GitCore = require('../build/git-core.js')

module.exports = class Git extends EmglkenVM
{
    default_options()
    {
        return {
            vmcore: GitCore,
        }
    }
}