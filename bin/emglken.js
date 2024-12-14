#!/usr/bin/env node

/*

Emglken runner
==============

Copyright (c) 2024 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

import minimist from 'minimist'

import {CheapAsyncDialog, CheapGlkOte, RemGlk} from '../build/asyncglk.js'

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

async function run() {
    const argv = minimist(process.argv.slice(2))

    const storyfile = argv._[0]

    let format
    for (const formatspec of formats) {
        if (formatspec.id === argv.vm || (!argv.vm && formatspec.extensions.test(storyfile))) {
            format = formatspec
            break
        }
    }

    if (!format) {
        console.error('Unknown storyfile format')
        return
    }

    // RemGlk or dumb mode GlkOte
    const GlkOteClass = argv.rem ? RemGlk : CheapGlkOte
    const Dialog = new CheapAsyncDialog()
    const GlkOte = new GlkOteClass()
    await Dialog.init({GlkOte})
    const options = {
        arguments: [storyfile],
        Dialog,
        GlkOte,
    }

    process.on('unhandledRejection', error => {
        if (error.name !== 'ExitStatus' || error.message !== 'Program terminated with exit(0)') {
            console.log('Unhandled Rejection:', error)
        }
        process.exit()
    })

    const engine = (await import(`../build/${format.id}.js`)).default
    const vm = await engine()
    vm.start(options)
}

run()