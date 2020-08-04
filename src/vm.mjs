/*

Emglken VM
==========

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

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
            arguments: this.options.arguments,
            emglken_stdin_buffers: [],
            emglken_stdin_index: 0,
            emglken_stdin_ready() {},
            print: (data) =>
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
            },
            preRun()
            {
                
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