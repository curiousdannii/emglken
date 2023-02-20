/*

Emglken port of Scare
=====================

Copyright (c) 2023 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

import EmglkenVM from './vm.js'
import ScareCore from '../build/scare-core.js'

export default class Scare extends EmglkenVM
{
    default_options()
    {
        return {
            vmcore: ScareCore,
        }
    }
}