/*

Emglken port of Hugo
====================

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

import EmglkenVM from './vm.js'
import HugoCore from '../build/hugo-core.js'

export default class Hugo extends EmglkenVM
{
    default_options()
    {
        return {
            vmcore: HugoCore,
        }
    }
}