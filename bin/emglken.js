#!/usr/bin/env node

/*

Emglken runner
==============

Copyright (c) 2023 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

import fs from 'fs'
import readline from 'readline'

import GlkOteLib from 'glkote-term'
import minimist from 'minimist'
import MuteStream from 'mute-stream'

const formats = [
    {
        id: 'bocfel',
        extensions: /z([3458]|blorb)$/,
        engine: 'bocfel.js',
    },

    {
        id: 'glulxe',
        extensions: /(gblorb|ulx)$/,
        engine: 'glulxe.js',
    },

    {
        id: 'git',
        extensions: /(gblorb|ulx)$/,
        engine: 'git.js',
    },

    {
        id: 'hugo',
        extensions: /hex$/,
        engine: 'hugo.js',
    },

    {
        id: 'scare',
        extensions: /taf$/,
        engine: 'scare.js',
    },

    {
        id: 'tads',
        extensions: /(gam|t3)$/,
        engine: 'tads.js',
    },
]

async function run()
{
    const argv = minimist(process.argv.slice(2))

    const storyfile = argv._[0]

    let format
    for (const formatspec of formats)
    {
        if (formatspec.id === argv.vm || (!argv.vm && formatspec.extensions.test(storyfile)))
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
    let io_opts
    if (argv.rem)
    {
        io_opts = {
            stdin: process.stdin,
            stdout: process.stdout,
        }
    }
    else
    {
        const stdin = process.stdin
        const stdout = new MuteStream()
        stdout.pipe(process.stdout)
        const rl = readline.createInterface({
            input: stdin,
            output: stdout,
            prompt: '',
        })
        io_opts = {
            rl: rl,
            stdin: stdin,
            stdout: stdout,
        }
    }

    // RemGlk or dumb mode GlkOte
    const GlkOte = argv.rem ? GlkOteLib.RemGlkOte : GlkOteLib.DumbGlkOte

    const options = {
        Dialog: new GlkOteLib.DumbGlkOte.Dialog(io_opts),
        Glk: {},
        GlkOte: new GlkOte(io_opts),
        wasmBinary: fs.readFileSync(new URL(`../build/${format.id}-core.wasm`, import.meta.url))
    }

    process.on('unhandledRejection', error => {
        if (error.name !== 'ExitStatus' || error.message !== 'Program terminated with exit(0)') {
            console.log('Unhandled Rejection:', error)
        }
        process.exit()
    })

    const engine = (await import(`../src/${format.id}.js`)).default
    const vm = new engine()
    vm.init(fs.readFileSync(storyfile), options)
    vm.start()
}

run()