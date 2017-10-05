/* main.c: Top-level source file for Emglken, an Emscripten port of the Glk API.
    Glk API which this implements: version 0.7.5.
    Designed by Andrew Plotkin <erkyrath@eblong.com>
    http://eblong.com/zarf/glk/
*/

#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "glk.h"
#include "emglken.h"

/* Declarations of preferences flags. */
#if GIDEBUG_LIBRARY_SUPPORT
int gli_debugger = FALSE;
#endif /* GIDEBUG_LIBRARY_SUPPORT */

void __attribute__((noinline)) init_emglken()
{
    /* Test for compile-time errors. If one of these spouts off, you
        must edit glk.h and recompile. */
    if (sizeof(glui32) != 4) {
        glem_fatal_error( "Compile-time error: glui32 is not a 32-bit value. Please fix glk.h." );
        glk_exit();
    }
    if ((glui32)(-1) < 0) {
        glem_fatal_error( "Compile-time error: glui32 is not unsigned. Please fix glk.h." );
        glk_exit();
    }

    /* Initialize things. */
    gli_initialize_misc();
    gli_initialize_windows();
    gli_initialize_events();

    if (gli_debugger)
        gidebug_announce_cycle(gidebug_cycle_Start);
}