/*

Emglken preamble
================

Copyright (c) 2024 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

// Make eslint happy
/* eslint no-unused-vars: "off" */
/* global callMain, Module */

let Dialog
let GlkOte
let glkote_event_data
// eslint-disable-next-line prefer-const
let glkote_event_ready = () => {}

// Our main start function
// We depart from the Quixe standard in these ways:
// - `options.arguments` must be set in order to play a storyfile
// - no longer receives the storyfile - the Dialog library will handle loading it
Module['start'] = function(options) {
    Dialog = options.Dialog
    if (!Dialog.async) {
        throw new Error('Emglken requires an async Dialog library')
    }
    GlkOte = options.GlkOte
    options.accept = accept
    callMain(options.arguments)
    GlkOte.init(options)
}

function accept(data) {
    if (glkote_event_data) {
        console.warn('Already have GlkOte event when next event arrives')
    }
    glkote_event_data = data
    glkote_event_ready()
}

// Log output
//Module['print'] = console.log

// In single-file mode new URL constructor won't work
Module['locateFile'] = function(filename) {
    try {
        return new URL(filename, import.meta.url).href
    }
    catch {
        return filename
    }
}