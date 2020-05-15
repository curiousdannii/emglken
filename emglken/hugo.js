/*

Emglken port of Hugo
===================

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

const EmglkenVM = require( './vm.js' )
const create_fake_stream = require( './create_fake_stream.js' )

class Hugo extends EmglkenVM
{

	default_options()
	{
		return {
			dirname: __dirname,
			emptfile: 'hugo-core.js.bin',
			module: require( './hugo-core.js' ),
		}
	}
	
	start()
	{
		const data_stream = create_fake_stream( this.data, 0, this.options.GiDispa )
		this.vm['_emhugoen']( data_stream.addr )
		delete this.data
	}

}

module.exports = Hugo