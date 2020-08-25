/*

Emglken port of Glulxe
======================

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

const EmglkenVM = require('./vm.js')
const GlulxeCore = require('../build/glulxe-core.js')

module.exports = class Glulxe extends EmglkenVM
{
    default_options()
    {
        return {
            vmcore: GlulxeCore,
        }
    }

    async start()
    {
        // Handle autosaves
        if (this.options.do_vm_autosave)
        {
            const Dialog = this.options.Dialog
            this.options.arguments.push('--autosave', '--autoskiparrange')

            if (this.options.clear_vm_autosave)
            {
                Dialog.autosave_write(this.autoid, null)
            }
            else
            {
                const snapshot = Dialog.autosave_read(this.autoid)
                if (snapshot && snapshot.emglken === 1)
                {
                    this.options.arguments.push('--autorestore', '-autometrics')
                    this.restore_glk = snapshot.glkote
                }
            }
        }
        await super.start()
    }
}