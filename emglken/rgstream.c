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
static stream_t *gli_currentstr = NULL; /* the current output stream */

stream_t *gli_new_stream( int type, glui32 tag, glui32 rock )
{
    stream_t *str = (stream_t *)malloc(sizeof(stream_t));
    if (!str)
        return NULL;
    
    str->type = type;
    str->tag = tag;
    str->rock = rock;

    str->unicode = FALSE;
    str->buf = NULL;
    str->buflen = 0;

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
    
    if (str == gli_currentstr) {
        gli_currentstr = NULL;
    }

    switch (str->type) {
        case strtype_Window:
            /* nothing necessary; the window is already being closed */
            break;
        case strtype_Memory: 
            if (gli_unregister_arr) {
                /* This could be a char array or a glui32 array. */
                char *typedesc = (str->unicode ? "&+#!Iu" : "&+#!Cn");
                //void *buf = (str->unicode ? (void*)str->ubuf : (void*)str->buf);
                (*gli_unregister_arr)(str->buf, str->buflen, typedesc,
                    str->arrayrock);
            }
            break;
        case strtype_Resource: 
            /* nothing necessary; the array belongs to gi_blorb.c. */
            break;
        case strtype_File:
            break;
    }

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

void glk_stream_close(stream_t *str, stream_result_t *result)
{
    if (!str) {
        gli_strict_warning("stream_close: invalid ref.");
        return;
    }
    
    if (str->type == strtype_Window) {
        gli_strict_warning("stream_close: cannot close window stream");
        return;
    }
    
    glem_stream_finalise( str->tag, result, TRUE );
    gli_delete_stream(str);
}

void gli_streams_close_all()
{
    /* This is used only at shutdown time; it closes file streams (the
        only ones that need finalization.) */
    stream_t *str, *strnext;
    
    str=gli_streamlist;
    while (str) {
        strnext = str->next;
        
        if (str->type == strtype_File) {
            gli_delete_stream(str);
        }
        
        str = strnext;
    }
}

strid_t glk_stream_open_memory(char *buf, glui32 buflen, glui32 fmode, 
    glui32 rock)
{
    stream_t *str;
    glui32 tag;

    if (fmode != filemode_Read 
        && fmode != filemode_Write 
        && fmode != filemode_ReadWrite) {
        gli_strict_warning("stream_open_memory: illegal filemode");
        return 0;
    }

    tag = glem_stream_open_memory( buf, buflen, fmode, rock, FALSE );
    if ( tag )
    {
        str = gli_new_stream( strtype_Memory, tag, rock );
    }
    if ( !str )
    {
        gli_strict_warning("stream_open_memory: unable to create stream.");
        return 0;
    }
    
    if (buf && buflen) {
        str->buf = buf;
        str->buflen = buflen;
        if (gli_register_arr) {
            str->arrayrock = (*gli_register_arr)(buf, buflen, "&+#!Cn");
        }
    }
    
    return str;
}

strid_t glk_stream_open_file(fileref_t *fref, glui32 fmode,
    glui32 rock)
{
    stream_t *str;
    glui32 tag;

    if (!fref) {
        gli_strict_warning("stream_open_file: invalid fileref ref.");
        return 0;
    }
    
    tag = glem_stream_open_file( fref->tag, fmode, rock, FALSE );
    if ( tag )
    {
        str = gli_new_stream( strtype_File, tag, rock );
    }
    if ( !str )
    {
        gli_strict_warning("stream_open_file: unable to create stream.");
        return 0;
    }
    
    return str;
}

#ifdef GLK_MODULE_UNICODE

strid_t glk_stream_open_memory_uni(glui32 *ubuf, glui32 buflen, glui32 fmode, 
    glui32 rock)
{
    stream_t *str;
    glui32 tag;

    if (fmode != filemode_Read 
        && fmode != filemode_Write 
        && fmode != filemode_ReadWrite) {
        gli_strict_warning("stream_open_memory_uni: illegal filemode");
        return NULL;
    }

    tag = glem_stream_open_memory( ubuf, buflen, fmode, rock, TRUE );
    if ( tag )
    {
        str = gli_new_stream( strtype_Memory, tag, rock );
    }
    if ( !str )
    {
        gli_strict_warning("stream_open_memory_uni: unable to create stream.");
        return NULL;
    }

    str->unicode = TRUE;

    if (ubuf && buflen) {
        str->buf = ubuf;
        str->buflen = buflen;
        if (gli_register_arr) {
            str->arrayrock = (*gli_register_arr)(ubuf, buflen, "&+#!Iu");
        }
    }
    
    return str;
}

strid_t glk_stream_open_file_uni(fileref_t *fref, glui32 fmode,
    glui32 rock)
{
    stream_t *str;
    glui32 tag;

    if (!fref) {
        gli_strict_warning("stream_open_file_uni: invalid fileref ref.");
        return 0;
    }

    tag = glem_stream_open_file( fref->tag, fmode, rock, TRUE );
    if ( tag )
    {
        str = gli_new_stream( strtype_File, tag, rock );
    }
    if ( !str )
    {
        gli_strict_warning("stream_open_file_uni: unable to create stream.");
        return 0;
    }

    return str;
}

#endif /* GLK_MODULE_UNICODE */


#ifdef GLK_MODULE_RESOURCE_STREAM

strid_t glk_stream_open_resource(glui32 filenum, glui32 rock)
{
    strid_t str;
    glui32 tag;

    tag = glem_stream_open_resource( filenum, rock, FALSE );
    if ( tag )
    {
        str = gli_new_stream( strtype_Resource, tag, rock );
    }
    if ( !str )
    {
        gli_strict_warning("stream_open_resource: unable to create stream.");
        return NULL;
    }
    
    return str;
}

strid_t glk_stream_open_resource_uni(glui32 filenum, glui32 rock)
{
    strid_t str;
    glui32 tag;

    tag = glem_stream_open_resource( filenum, rock, TRUE );
    if ( tag )
    {
        str = gli_new_stream( strtype_Resource, tag, rock );
    }
    if ( !str )
    {
        gli_strict_warning("stream_open_resource_uni: unable to create stream.");
        return NULL;
    }
    
    return str;
}

#endif /* GLK_MODULE_RESOURCE_STREAM */

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

stream_t *gli_stream_find_by_tag(glui32 tag)
{
    stream_t *str;
    for (str=gli_streamlist; str; str=str->next) {
        if (str->tag == tag)
            return str;
    }
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

void gli_stream_set_current(stream_t *str)
{
    gli_currentstr = str;
    glem_stream_set_current( str->tag );
}

void glk_stream_set_current(stream_t *str)
{
    gli_stream_set_current(str);
}

strid_t glk_stream_get_current()
{
    if (gli_currentstr)
        return gli_currentstr;
    else
        return 0;
}