/*

Emglken VM
==========

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

const EmglkenFS = require('./emglkenfs.js')

const base_options = {
    arguments: ['storyfile'],
}

module.exports = class EmglkenVM
{
    // Store the data and options
    prepare(data, options)
    {
        this.data = data
        this.options = Object.assign({}, base_options, this.default_options(), options)
    }

    // Start GlkOte and the vmcore
    async start()
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
            wasmBinary: this.options.wasmBinary,
        }
        this.Module = Module

        this.options.accept = data => {
            // Convert a Dialog.js provided fileref into something Remglk will understand
            if (data.type === 'specialresponse' && data.response === 'fileref_prompt')
            {
                data.value = data.value.filename
            }

            const json_data = JSON.stringify(data)
            const buffer = encoder.encode(json_data)
            Module.emglken_stdin_buffers.push(buffer)
            Module.emglken_stdin_ready()
        }

        await this.options.vmcore(Module)
        this.options.GlkOte.init(this.options)
    }
}