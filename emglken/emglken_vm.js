/*

Emglken VM
==========

Copyright (c) 2017 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

class EmglkenVM
{

	// Store the data and options
	prepare( data, options )
	{
		// If we are not given the Glk and GiDispa options then we cannot continue
		if ( !options.Glk )
		{
			throw new Error( 'A reference to Glk is required' )
		}
		if ( !options.GiDispa )
		{
			throw new Error( 'A reference to GiDispa is required' )
		}
		this.data = data
		this.options = Object.assign( {}, this.default_options(), options )

		this.setsig()
	}

	// Initialise the Module and then call the start func
	init()
	{
		const moduleoptions = {
			Glk: this.options.Glk,
			GiDispa: this.options.GiDispa,
		}
		// Node
		if ( typeof process === 'object' )
		{
			const fs = require( 'fs' )

			moduleoptions.memoryInitializerPrefixURL = this.options.dirname + '/'
			fs.readFile( this.options.dirname + '/' + this.options.emptfile, ( err, data ) =>
			{
				moduleoptions.emterpreterFile = data.buffer
				this.vm = this.options.module( moduleoptions )
				this.vm.then( () => this.start() )
			})
		}
	}

	get_signature()
	{
		return this.signature
	}

	resume( res )
	{
		this.vm.glem_callback( res )
	}

}

module.exports = EmglkenVM