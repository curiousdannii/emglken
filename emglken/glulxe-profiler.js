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
			emptfile: 'glulxe-profiler-core.js.bin',
			module: require( './glulxe-profiler-core.js' ),

			profile_stream: 0,
			profcalls: 0,
		}
	}

	do_autosave() {}

	start()
	{
		const data_stream = create_fake_stream( this.data, 0, this.options.GiDispa )
		const profile_stream_tag = this.options.profile_stream ? this.options.profile_stream.addr : 0
		this.vm['_emglulxeen']( data_stream.addr, profile_stream_tag, this.options.profcalls )
		delete this.data
	}

}

module.exports = Glulxe