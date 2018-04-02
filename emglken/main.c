/* main.c: Top-level source file for Emglken, an Emscripten port of the Glk API.
    Glk API which this implements: version 0.7.5.
    Designed by Andrew Plotkin <erkyrath@eblong.com>
    http://eblong.com/zarf/glk/
*/

#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "emscripten.h"
#include "glk.h"
#include "emglken.h"

/* Declarations of preferences flags. */
#if GIDEBUG_LIBRARY_SUPPORT
int gli_debugger = FALSE;
#endif /* GIDEBUG_LIBRARY_SUPPORT */

// Register an array
void EMSCRIPTEN_KEEPALIVE glem_register_arr( stream_t *obj, glui32 *buf, glui32 maxlen, int unicode )
{
    if ( gli_register_arr )
    {
        obj->arrayrock = (*gli_register_arr)( buf, maxlen, unicode ? "&+#!Iu" : "&+#!Cn" );
    }
}

// Register an object created by GlkApi
void EMSCRIPTEN_KEEPALIVE *glem_register_obj( glui32 objclass, glui32 tag, glui32 rock )
{
    switch ( objclass )
    {
        case gidisp_Class_Fileref:
            return gli_new_fileref( tag, rock );

        case gidisp_Class_Stream:
            return gli_new_stream( tag, rock );

        case gidisp_Class_Window:
            return gli_new_window( tag, rock );

        default:
            return NULL;
    }
}

void EMSCRIPTEN_KEEPALIVE glem_unregister_arr( stream_t *obj, glui32 *buf, glui32 maxlen, int unicode )
{
    if ( gli_unregister_arr )
    {
        (*gli_unregister_arr)( buf, maxlen, unicode ? "&+#!Iu" : "&+#!Cn", obj->arrayrock );
    }
}

void EMSCRIPTEN_KEEPALIVE glem_unregister_obj( glui32 objclass, void *obj )
{
    switch ( objclass )
    {
        case gidisp_Class_Fileref:
            gli_delete_fileref( obj );
            break;

        case gidisp_Class_Stream:
            gli_delete_stream( obj );
            break;

        case gidisp_Class_Window:
            gli_delete_window( obj );
            break;
    }
}

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