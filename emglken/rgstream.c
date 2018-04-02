/* gtstream.c: Stream objects
        for RemGlk, remote-procedure-call implementation of the Glk API.
    Designed by Andrew Plotkin <erkyrath@eblong.com>
    http://eblong.com/zarf/glk/
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "glk.h"
#include "emglken.h"

/* This implements pretty much what any Glk implementation needs for 
    stream stuff. Memory streams, file streams (using stdio functions), 
    and window streams (which print through window functions in other
    files.) A different implementation would change the window stream
    stuff, but not file or memory streams. (Unless you're on a 
    wacky platform like the Mac and want to change stdio to native file 
    functions.) 
*/

static stream_t *gli_streamlist = NULL; /* linked list of all streams */

stream_t *gli_new_stream( glui32 tag, glui32 rock )
{
    stream_t *str = (stream_t *)malloc(sizeof(stream_t));
    if (!str)
        return NULL;
    
    str->tag = tag;
    str->rock = rock;

    str->prev = NULL;
    str->next = gli_streamlist;
    gli_streamlist = str;
    if (str->next) {
        str->next->prev = str;
    }
    
    if (gli_register_obj)
        str->disprock = (*gli_register_obj)(str, gidisp_Class_Stream);
    else
        str->disprock.ptr = NULL;
    
    return str;
}

void gli_delete_stream(stream_t *str)
{
    stream_t *prev, *next;

    if (gli_unregister_obj) {
        (*gli_unregister_obj)(str, gidisp_Class_Stream, str->disprock);
        str->disprock.ptr = NULL;
    }

    prev = str->prev;
    next = str->next;
    str->prev = NULL;
    str->next = NULL;

    if (prev)
        prev->next = next;
    else
        gli_streamlist = next;
    if (next)
        next->prev = prev;

    free(str);
}

strid_t glk_stream_iterate(strid_t str, glui32 *rock)
{
    if (!str) {
        str = gli_streamlist;
    }
    else {
        str = str->next;
    }
    
    if (str) {
        if (rock)
            *rock = str->rock;
        return str;
    }
    
    if (rock)
        *rock = 0;
    return NULL;
}

glui32 glk_stream_get_rock(stream_t *str)
{
    if (!str) {
        gli_strict_warning("stream_get_rock: invalid ref.");
        return 0;
    }
    
    return str->rock;
}