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
let storyfile_data
let storyfile_name

// Our main start function
// We depart from the Quixe standard in these ways:
// - combines `start` with the `init` function
// - `options.arguments` must be set in order to play a storyfile
// - take a File-like object rather than just a Uint8Array (not an actual File, because we don't need it to be immutable, and it's more memory efficient to share the ArrayBuffer)
Module['start'] = function(storyfile, options) {
    Dialog = options.Dialog
    GlkOte = options.GlkOte
    storyfile_data = storyfile.data
    storyfile_name = storyfile.name
    options.accept = accept
    callMain(options.arguments)
    GlkOte.init(options)
}

function accept(data) {
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