#!/usr/bin/env node

// Test a VM

import fs from 'fs'
import { createRequire } from 'module'
import readline from 'readline'

import GlkOte from 'glkote-term'
import minimist from 'minimist'
import MuteStream from 'mute-stream'

const require = createRequire(import.meta.url)

async function run()
{
    // Position options: vm filename, file
    // Boolean options:
    // r: run the VM in remglk mode
    const argv = minimist(process.argv.slice(2), {boolean: 'r'})

    const show_help = argv._.length < 2

    const Module = {
        arguments: [argv._[1]],
        emglken_stdin_buffers: [],
        emglken_stdin_index: 0,
        emglken_stdin_ready() {},
    }

    // Remglk mode
    if (argv.r)
    {
        // Load the requested VM
        // Can't work until https://github.com/emscripten-core/emscripten/issues/11792 is fixed
        //let VMmodule = (await import(argv._[0])).default
        // So instead require CommonJS module
        const VMmodule = require(argv._[0])

        process.stdin.on('data', chunk => {
            Module.emglken_stdin_buffers.push(chunk)
            Module.emglken_stdin_ready()
        })

        VMmodule(Module)
    }

    // GlkOte mode
    else
    {
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
            show_help,
        }

        const VMmodule = (await import(argv._[0])).default
        const vm = new VMmodule()
        vm.prepare(show_help ? null : fs.readFileSync(argv._[1]), options)
        vm.start()
    }
}

run()