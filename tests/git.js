#!/usr/bin/env node

'use strict'

const fs = require( 'fs' )
const minimist = require( 'minimist' )
const GlkOte = require( 'glkote-term' )
const GiDispa = require( '../emglken/emglken_dispatch.js' )

const argv = minimist( process.argv.slice( 2 ), { boolean: 'b' } )
const Git = new require( argv.b ? '../git.js' : '../git/git.js' )

const vm = new Git()
const Glk = GlkOte.Glk

const options = {
	vm: vm,
	Dialog: new GlkOte.Dialog(),
	GiDispa: new GiDispa(),
	Glk: Glk,
	GlkOte: new GlkOte(),
}

vm.prepare( fs.readFileSync( argv._[0] ), options )

// This will call vm.init()
Glk.init( options )
