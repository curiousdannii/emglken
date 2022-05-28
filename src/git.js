/*

Emglken port of Git
===================

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

import EmglkenVM from './vm.js'
import GitCore from '../build/git-core.js'

export default class Git extends EmglkenVM
{
    default_options()
    {
        return {
            vmcore: GitCore,
        }
    }
}