/*

Emglken port of Glulxe
======================

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

const EmglkenVM = require( './vm.js' )
const create_fake_stream = require( './create_fake_stream.js' )

class Glulxe extends EmglkenVM
{

	default_options()
	{
		return {
			dirname: __dirname,
			emptfile: 'glulxe-core.js.bin',
			module: require( './glulxe-core.js' ),

			profile_stream: 0,
			profcalls: 0,
		}
	}

    do_autosave( save )
    {
        if ( !this.options.Dialog )
        {
            throw new Error( 'A reference to Dialog is required' )
        }

        let snapshot = null
        if ( ( save || 0 ) >= 0 )
        {
            const Glk = this.options.Glk
            const stream_results = new Glk.RefStruct()

            // Set up the streams to pass to the VM
            const ram_buffer = new Uint8Array( this.options.autosavelen )
            const ram_stream = Glk.glk_stream_open_memory( ram_buffer, 1, 0 )
            const misc_buffer = new Uint32Array( 256 )
            const misc_stream = Glk.glk_stream_open_memory_uni( misc_buffer, 1, 0 )

            // Call into the VM
            this.vm['_emautosave']( ram_stream.addr, misc_stream.addr )

            // Retrieve the RAM/savefile
            Glk.glk_stream_close( ram_stream, stream_results )
            const ram_len = stream_results.get_field( 1 )
            if ( !ram_len )
            {
                return
            }

            // Retrieve the misc autosave data
            Glk.glk_stream_close( misc_stream, stream_results )

            // Finally save the Glk state
            snapshot = {
                glk: Glk.save_allstate(),
                misc: Array.from( misc_buffer.slice( 0, stream_results.get_field( 1 ) ) ),
                ram: ram_buffer.slice( 0, ram_len ),
            }

            // For now manually filter out the gamefile stream
            //snapshot.glk.streams = snapshot.glk.streams.filter( str => !str.buf || str.buf.len < 2048 )
        }

        this.options.Dialog.autosave_write( this.signature, snapshot )
    }

	start()
	{
		const data_stream = create_fake_stream( this.data, 0, this.options.GiDispa )
		this.vm['_emglulxeen']( data_stream.addr, 0, 0 )
		delete this.data
	}

}

module.exports = Glulxe