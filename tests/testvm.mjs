#!/usr/bin/env node

// Test a VM

import fs from 'fs'
import { createRequire } from 'module'
import readline from 'readline'

import GiDispa from '../emglken/include/dispatch.js'
import GlkOte from 'glkote-term'
import minimist from 'minimist'
import MuteStream from 'mute-stream'

// Position options: vm filename, file
// Boolean options:
// b: run the bundled version of the VM
const argv = minimist( process.argv.slice( 2 ), { boolean: 'b' } )

const require = createRequire(import.meta.url)

// Load the requested VM
let VM = require(argv._[0])

const vm = new VM()
const Glk = GlkOte.Glk

// Readline options
const stdin = process.stdin
const stdout = new MuteStream()
stdout.pipe( process.stdout )
const rl = readline.createInterface({
    input: stdin,
    output: stdout,
    prompt: '',
})
const rl_opts = {
    rl: rl,
    stdin: stdin,
    stdout: stdout,
}

const options = {
	vm: vm,
	Dialog: new GlkOte.Dialog( rl_opts ),
	GiDispa: new GiDispa(),
	Glk: Glk,
	GlkOte: new GlkOte( rl_opts ),

	profcalls: argv.profcalls || 0,
	showlog: true,
}

Glk.set_references( options )

// Set up the profile stream if it has been set
// TODO Fix up a fake file stream or something
/*if ( argv.profile_filename )
{
	const fref = Glk.glk_fileref_create_by_name( 0, argv.profile_filename, 0 )
	if ( fref )
	{
		options.profile_stream = Glk.glk_stream_open_file( fref, 1, 0 )
		Glk.glk_fileref_destroy( fref )
	}
}*/

vm.prepare( fs.readFileSync( argv._[1] ), options )

// This will call vm.init()
Glk.init( options )