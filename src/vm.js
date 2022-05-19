/*

Emglken VM
==========

Copyright (c) 2022 Dannii Willis
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
                        let obj
                        try { obj = JSON.parse(buffer) } catch (e) {}
                        if (obj) {
                            buffer = ''
                            // Store the usage of a fileref prompt request
                            if (obj.specialinput && obj.specialinput.type === 'fileref_prompt')
                            {
                                this.last_fr_usage = obj.specialinput.filetype
                            }
                            this.options.GlkOte.update(obj)
                        }
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
            if (data.type === 'specialresponse' && data.response === 'fileref_prompt' && data.value)
            {
                // electrofs.js returns a full path, so register it with EmglkenFS, and return a fake filename
                if (this.EFS.streaming)
                {
                    data.value = this.EFS.register_filename(data.value.filename, this.last_fr_usage)
                }
                // Convert a dialog.js provided fileref into something Remglk can understand
                else
                {
                    data.value = data.value.filename
                }
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