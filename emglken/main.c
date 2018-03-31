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

// After autorestoring we have to restore all of our Glk state, in addition to GlkApi's state
void glem_restore_state(void)
{
    // First restore GlkApi
    glem_restore_glkapi();

    glui32 buflen, child1, child2, parent, rock, strtag, tag;
    int line_request, type, unicode;
    void *buf;
    stream_t *str;
    window_t *win;

    // Iterate filerefs
    tag = glem_fileref_iterate( 0, &rock );
    while ( tag != 0 )
    {
        gli_new_fileref( tag, rock );
        tag = glem_fileref_iterate( tag, &rock );
    }

    // Iterate streams
    tag = glem_stream_iterate( 0, &rock, &type, &unicode, &buf, &buflen );
    while ( tag != 0 )
    {
        str = gli_new_stream( type, tag, rock );
        str->unicode = unicode;
        if ( buf && buflen )
        {
            str->buf = buf;
            str->buflen = buflen;
            if ( gli_register_arr )
            {
                str->arrayrock = (*gli_register_arr)( buf, buflen, unicode ? "&+#!Iu" : "&+#!Cn" );
            }
            buf = NULL;
        }
        if ( tag == glem_stream_get_current() )
        {
            gli_stream_set_current( str );
        }
        tag = glem_stream_iterate( tag, &rock, &type, &unicode, &buf, &buflen );
    }

    // Iterate windows
    tag = glem_window_iterate( 0, &rock, &type, &line_request, &unicode, &buf, &buflen );
    while ( tag != 0 )
    {
        win = gli_new_window( type, rock, tag );
        // Set a temporary root, we'll check it's correct below, but this is needed in case we get an error before then
        if ( !gli_rootwin )
        {
            gli_rootwin = win;
        }
        win->line_request = line_request;
        win->unicode = unicode;
        if ( buf && buflen )
        {
            win->buf = buf;
            win->buflen = buflen;
            if ( gli_register_arr )
            {
                win->arrayrock = (*gli_register_arr)( buf, buflen, unicode ? "&+#!Iu" : "&+#!Cn" );
            }
            buf = NULL;
        }
        tag = glem_window_iterate( tag, &rock, &type, &line_request, &unicode, &buf, &buflen );
    }

    // Now sync up the tree
    win = glk_window_iterate( NULL, 0 );
    while ( win != NULL )
    {
        glem_window_get_tree( win->updatetag, &child1, &child2, &parent, &strtag );
        if ( child1 )
        {
            win->child1 = gli_window_find_by_tag( child1 );
        }
        if ( child2 )
        {
            win->child2 = gli_window_find_by_tag( child2 );
        }
        if ( parent )
        {
            win->parent = gli_window_find_by_tag( parent );
        }
        else
        {
            gli_rootwin = win;
        }
        if ( strtag )
        {
            win->str = gli_stream_find_by_tag( strtag );
        }
        win = glk_window_iterate( win, 0 );
    }
}