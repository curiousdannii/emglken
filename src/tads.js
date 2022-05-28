/*

Emglken port of TADS
====================

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

import EmglkenVM from './vm.js'
import TADSCore from '../build/tads-core.js'

export default class TADS extends EmglkenVM
{
    default_options()
    {
        return {
            vmcore: TADSCore,
        }
    }
}