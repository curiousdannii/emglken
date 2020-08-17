#!/usr/bin/env node

/*

Emglken runner
==============

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

const fs = require('fs')
const readline = require('readline')

const GlkOte = require('glkote-term')
const MuteStream = require('mute-stream')

const formats = [
    {
        id: 'glulx',
        extensions: /(gblorb|ulx)$/,
        engine: 'glulxe.js',
    },

    {
        id: 'hugo',
        extensions: /hex$/,
        engine: 'hugo.js',
    },

    {
        id: 'tads',
        extensions: /(gam|t3)$/,
        engine: 'tads.js',
    },
]

function run()
{
    const storyfile = process.argv[2]

    let format
    for (const formatspec of formats)
    {
        if (formatspec.extensions.test(storyfile))
        {
            format = formatspec
            break
        }
    }

    if (!format)
    {
        console.error('Unknown storyfile format')
        return
    }

    // Readline options
    const stdin = process.stdin
    const stdout = new MuteStream()
    stdout.pipe(process.stdout)
    const rl = readline.createInterface({
        input: stdin,
        output: stdout,
        prompt: '',
    })
    const rl_opts = {
        rl: rl,
        stdin: stdin,
        stdout: stdout,
    }

    const options = {
        Dialog: new GlkOte.Dialog(rl_opts),
        Glk: {},
        GlkOte: new GlkOte(rl_opts),
    }

    const engine = require('../src/' + format.engine)
    const vm = new engine()
    vm.prepare(fs.readFileSync(storyfile), options)
    vm.start()
}

run()