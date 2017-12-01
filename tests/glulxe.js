#!/usr/bin/env node

'use strict'

const fs = require( 'fs' )
const minimist = require( 'minimist' )
const GlkOte = require( 'glkote-term' )
const GiDispa = require( '../emglken/emglken_dispatch.js' )

const argv = minimist( process.argv.slice( 2 ), { boolean: 'b' } )

const vm_path = argv.profile_filename ?
	( argv.b ? '../glulxe-profiler.js' : '../glulxe/glulxe-profiler.js' ) :
	( argv.b ? '../glulxe.js' : '../glulxe/glulxe.js' )

const Glulxe = new require( vm_path )

const vm = new Glulxe()
const Glk = GlkOte.Glk

const options = {
	vm: vm,
	Dialog: new GlkOte.Dialog(),
	GiDispa: new GiDispa(),
	Glk: Glk,
	GlkOte: new GlkOte(),

	profcalls: argv.profcalls || 0,
}

Glk.set_references( options )

// Set up the profile stream if it has been set
if ( argv.profile_filename )
{
	const fref = Glk.glk_fileref_create_by_name( 0, argv.profile_filename, 0 )
	if ( fref )
	{
		options.profile_stream = Glk.glk_stream_open_file( fref, 1, 0 )
		Glk.glk_fileref_destroy( fref )
	}
}

vm.prepare( fs.readFileSync( argv._[0] ), options )

// This will call vm.init()
Glk.init( options )
