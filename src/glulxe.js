/*

Emglken port of Glulxe
======================

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

import EmglkenVM from './vm.js'
import GlulxCore from '../build/glulxe-core.js'

export default class Glulxe extends EmglkenVM
{
    default_options()
    {
        return {
            vmcore: GlulxCore,
        }
    }
}