/* gtevent.c: Event handling, including glk_select() and timed input code
        for RemGlk, remote-procedure-call implementation of the Glk API.
    Designed by Andrew Plotkin <erkyrath@eblong.com>
    http://eblong.com/zarf/glk/
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "glk.h"
#include "emglken.h"

/* Set up the input system. This is called from main(). */
void gli_initialize_events()
{
}

void glk_select(event_t *event)
{
    glem_select( event );

    // Unregister a pending array if needed
    stream_t *obj = NULL;
    glui32 *buf = NULL;
    glui32 maxlen = 0;
    int unicode = 0;
    glem_get_pending_unregister_arr( &obj, &buf, &maxlen, &unicode );
    if ( obj != NULL )
    {
        glem_unregister_arr( obj, buf, maxlen, unicode );
    }
}

#if GIDEBUG_LIBRARY_SUPPORT

/* Block and wait for debug commands. The library will accept debug commands
   until gidebug_perform_command() returns nonzero.

   This behaves a lot like glk_select(), except that it only handles debug
   input, not any of the standard event types.
*/
/*void gidebug_pause()
{
    if (!gli_debugger)
        return;

    gidebug_announce_cycle(gidebug_cycle_DebugPause);

    char *allocbuf;
    int unpause = FALSE;

    while (!unpause) {
        gli_windows_update(NULL, TRUE);

        data_event_t *data = data_event_read();

        if (data->gen != gli_window_current_generation() && data->dtag != dtag_Refresh)
            gli_fatal_error("Input generation number does not match.");

        switch (data->dtag) {
            case dtag_DebugInput:
                allocbuf = alloc_utf_buffer(data->linevalue, data->linelen);
                unpause = gidebug_perform_command(allocbuf);
                free(allocbuf);
                break;

            default:
                // Ignore all non-debug events. 
                break;
        }
        
    }    
    
    gidebug_announce_cycle(gidebug_cycle_DebugUnpause);
}*/

#endif /* GIDEBUG_LIBRARY_SUPPORT */