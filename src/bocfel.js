/*

Emglken port of Bocfel
======================

Copyright (c) 2021 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

import EmglkenVM from './vm.js'
import BocfelCore from '../build/bocfel-core.js'

export default class Bocfel extends EmglkenVM
{
    default_options()
    {
        return {
            vmcore: BocfelCore,
        }
    }
}