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

// And now some things just to patch over Emscripten's lack of a none environment. These could probably be removed if https://github.com/emscripten-core/emscripten/issues/12184 ever gets implemented
// Add an importScripts function to prevent an assertion error
function importScripts() {}
// Fake locateFile so that Lectrote doesn't get tripped up on import.meta.url not being handled in CJS properly
Module['locateFile'] = function() {}