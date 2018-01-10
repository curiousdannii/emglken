#!/usr/bin/env node

// Test a VM

import fs from 'fs'
import readline from 'readline'

import GiDispa from '../emglken/emglken_dispatch.js'
import GlkOte from 'glkote-term'
import minimist from 'minimist'
import MuteStream from 'mute-stream'

import SourceGit from '../git/git.js'
import BundledGit from '../git.js'
import SourceGlulx from '../glulxe/glulxe.js'
import BundledGlulx from '../glulxe.js'
import SourceGlulxProfiler from '../glulxe/glulxe-profiler.js'
import BundledGlulxProfiler from '../glulxe-profiler.js'
import SourceHugo from '../hugo/heglk/hugo.js'
import BundledHugo from '../hugo.js'

// Position options: vm name, file
// Boolean options:
// b: run the bundled version of the VM
const argv = minimist( process.argv.slice( 2 ), { boolean: 'b' } )

// Load the requested VM
let VM
if ( argv._[0] === 'git' )
{
	VM = argv.b ? BundledGit : SourceGit
}
if ( argv._[0] === 'glulxe' )
{
	if ( argv.profile_filename )
	{
		VM = argv.b ? BundledGlulxProfiler : SourceGlulxProfiler
	}
	else
	{
		VM = argv.b ? BundledGlulx : SourceGlulx
	}
}
if ( argv._[0] === 'hugo' )
{
	VM = argv.b ? BundledHugo : SourceHugo
}

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
if ( argv.profile_filename )
{
	const fref = Glk.glk_fileref_create_by_name( 0, argv.profile_filename, 0 )
	if ( fref )
	{
		options.profile_stream = Glk.glk_stream_open_file( fref, 1, 0 )
		Glk.glk_fileref_destroy( fref )
	}
}

vm.prepare( fs.readFileSync( argv._[1] ), options )

// This will call vm.init()
Glk.init( options )