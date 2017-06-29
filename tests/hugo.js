#!/usr/bin/env node

'use strict'

const fs = require( 'fs' )
const minimist = require( 'minimist' )
const GlkOte = require( 'glkote-term' )
const GiDispa = require( '../emglken/emglken_dispatch.js' )

const argv = minimist( process.argv.slice( 2 ), { boolean: 'b' } )
const Hugo = new require( argv.b ? '../hugo.js' : '../hugo/heglk/hugo.js' )

const vm = new Hugo()
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
