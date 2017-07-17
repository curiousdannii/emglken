/*

Emglken VM
==========

Copyright (c) 2017 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

const base_options = {
	siglen: 64,
}

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
		this.options = Object.assign( {}, base_options, this.default_options(), options )

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
				if ( err )
				{
					throw err
				}
				moduleoptions.emterpreterFile = data.buffer
				this.vm = this.options.module( moduleoptions )
				this.vm.then( () => this.start() )
			})
		}
		else
		{
			throw new Error( 'Unsupported runtime environment' )
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

	setsig()
	{
		this.signature = ''
		var i = 0
		while ( i < this.options.siglen )
		{
			this.signature += ( this.data[i] < 0x10 ? '0' : '' ) + this.data[i++].toString( 16 )
		}
	}

}

module.exports = EmglkenVM