/*

Emglken VM
==========

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

import EmglkenFS from './emglkenfs.mjs'

const base_options = {
    arguments: ['storyfile'],
}

export default class EmglkenVM
{
    // Store the data and options
    prepare(data, options)
    {
        this.data = data
        this.options = Object.assign({}, base_options, this.default_options(), options)
    }

    // Start GlkOte and the vmcore
    start()
    {
        const encoder = new TextEncoder()
        let buffer = ''

        const Module = {
            arguments: this.options.show_help ? ['-help'] : this.options.arguments,
            emglken_stdin_buffers: [],
            emglken_stdin_ready() {},
            print: data =>
            {
                if (buffer === '' && data !== '' && !data.startsWith('{'))
                {
                    console.log(data)
                }
                else
                {
                    buffer += data
                    if (data.endsWith('}'))
                    {
                        try
                        {
                            const obj = JSON.parse(buffer)
                            buffer = ''
                            this.options.GlkOte.update(obj)
                        }
                        catch (e) {}
                    }
                }
            },
            preRun: () =>
            {
                const FS = Module.FS
                this.EFS = new EmglkenFS(this)
                FS.mkdir('/emglken')
                FS.mount(this.EFS, {}, '/emglken')
                FS.chdir('/emglken')
            },
        }
        this.Module = Module

        this.options.accept = data => {
            const json_data = JSON.stringify(data)
            const buffer = encoder.encode(json_data)
            Module.emglken_stdin_buffers.push(buffer)
            Module.emglken_stdin_ready()
        }

        this.options.vmcore(Module)
        this.options.GlkOte.init(this.options)
    }
}