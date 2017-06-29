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
#include "gi_blorb.h"

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

stream_t *gli_new_stream(int type, int readable, int writable, 
    glui32 rock)
{
    stream_t *str = (stream_t *)malloc(sizeof(stream_t));
    if (!str)
        return NULL;
    
    str->type = type;
    str->rock = rock;

    //str->unicode = FALSE;
    
    str->win = NULL;
    
    str->readcount = 0;
    str->writecount = 0;
    str->readable = readable;
    str->writable = writable;
    
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
    
    gli_windows_unechostream(str);

    switch (str->type) {
        case strtype_Window:
            /* nothing necessary; the window is already being closed */
            break;
        case strtype_Memory: 
            if (gli_unregister_arr) {
                /* This could be a char array or a glui32 array. */
                //char *typedesc = (str->unicode ? "&+#!Iu" : "&+#!Cn");
                //void *buf = (str->unicode ? (void*)str->ubuf : (void*)str->buf);
                //(*gli_unregister_arr)(buf, str->buflen, typedesc,
                //    str->arrayrock);
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

    if (str->type != strtype_Memory)
    {
        glem_stream_close( str->tag );
    }

    free(str);
}

void gli_stream_fill_result(stream_t *str, stream_result_t *result)
{
    if (!result)
        return;
    
    result->readcount = str->readcount;
    result->writecount = str->writecount;
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
    
    gli_stream_fill_result(str, result);
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
    str = gli_new_stream(strtype_Memory, 
        (fmode != filemode_Write), 
        (fmode != filemode_Read), 
        rock);
    if ( !str || !tag )
    {
        gli_strict_warning("stream_open_memory: unable to create stream.");
        return 0;
    }
    
    if (buf && buflen) {
        //str->buf = (unsigned char *)buf;
        //str->bufptr = (unsigned char *)buf;
        //str->buflen = buflen;
        //str->bufend = str->buf + str->buflen;
        //if (fmode == filemode_Write)
        //    str->bufeof = (unsigned char *)buf;
        //else
        //    str->bufeof = str->bufend;
        if (gli_register_arr) {
            str->arrayrock = (*gli_register_arr)(buf, buflen, "&+#!Cn");
        }
        str->tag = tag;
    }
    
    return str;
}

stream_t *gli_stream_open_window(window_t *win)
{
    stream_t *str;
    
    str = gli_new_stream(strtype_Window, FALSE, TRUE, 0);
    if (!str)
        return NULL;

    str->win = win;
    str->tag = glem_get_window_stream_tag( win->updatetag );
    
    return str;
}

strid_t glk_stream_open_file(fileref_t *fref, glui32 fmode,
    glui32 rock)
{
    stream_t *str;
    char modestr[16];
    glui32 tag;

    if (!fref) {
        gli_strict_warning("stream_open_file: invalid fileref ref.");
        return 0;
    }
    
    tag = glem_stream_open_file( fref->tag, fmode, rock, FALSE );
    str = gli_new_stream(strtype_File, 
        (fmode == filemode_Read || fmode == filemode_ReadWrite), 
        !(fmode == filemode_Read), 
        rock);
    if ( !str || !tag )
    {
        gli_strict_warning("stream_open_file: unable to create stream.");
        return 0;
    }
    
    str->tag = tag;
    
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
    str = gli_new_stream(strtype_Memory, 
        (fmode != filemode_Write), 
        (fmode != filemode_Read), 
        rock);
    if ( !str || !tag )
    {
        gli_strict_warning("stream_open_memory_uni: unable to create stream.");
        return NULL;
    }
    
    //str->unicode = TRUE;

    if (ubuf && buflen) {
        //str->ubuf = ubuf;
        //str->ubufptr = ubuf;
        //str->buflen = buflen;
        //str->ubufend = str->ubuf + str->buflen;
        //if (fmode == filemode_Write)
        //    str->ubufeof = ubuf;
        //else
        //    str->ubufeof = str->ubufend;
        if (gli_register_arr) {
            str->arrayrock = (*gli_register_arr)(ubuf, buflen, "&+#!Iu");
        }
        str->tag = tag;
    }
    
    return str;
}

strid_t glk_stream_open_file_uni(fileref_t *fref, glui32 fmode,
    glui32 rock)
{
    stream_t *str;
    char modestr[16];
    glui32 tag;

    if (!fref) {
        gli_strict_warning("stream_open_file_uni: invalid fileref ref.");
        return 0;
    }

    tag = glem_stream_open_file( fref->tag, fmode, rock, TRUE );
    str = gli_new_stream(strtype_File, 
        (fmode == filemode_Read || fmode == filemode_ReadWrite), 
        !(fmode == filemode_Read), 
        rock);
    if ( !str || !tag )
    {
        gli_strict_warning("stream_open_file_uni: unable to create stream.");
        return 0;
    }

    str->tag = tag;
    //str->unicode = TRUE;

    return str;
}

#endif /* GLK_MODULE_UNICODE */


#ifdef GLK_MODULE_RESOURCE_STREAM

strid_t glk_stream_open_resource(glui32 filenum, glui32 rock)
{
    strid_t str;
    giblorb_err_t err;
    giblorb_result_t res;
    giblorb_map_t *map = giblorb_get_resource_map();
    if (!map)
        return 0; /* Not running from a blorb file */

    err = giblorb_load_resource(map, giblorb_method_Memory, &res, giblorb_ID_Data, filenum);
    if (err)
        return 0; /* Not found, or some other error */

    /* We'll use the in-memory copy of the chunk data as the basis for
       our new stream. It's important to not call chunk_unload() until
       the stream is closed (and we won't). 

       This will be memory-hoggish for giant data chunks, but I don't
       expect giant data chunks at this point. A more efficient model
       would be to use the file on disk, but this requires some hacking
       into the file stream code (we'd need to open a new FILE*) and
       I don't feel like doing that.

       Note that binary chunks are normally type BINA, but FORM
       chunks also count as binary. (This allows us to embed AIFF
       files as readable resources, for example.) */

    if (res.chunktype == giblorb_ID_TEXT)
        {}
    else if (res.chunktype == giblorb_ID_BINA
        || res.chunktype == giblorb_make_id('F', 'O', 'R', 'M'))
        {}
    else
        return 0; /* Unknown chunk type */

    str = gli_new_stream(strtype_Resource,
        TRUE, FALSE, rock);
    if (!str) {
        gli_strict_warning("stream_open_resource: unable to create stream.");
        return NULL;
    }
    
    if (res.data.ptr && res.length) {
        //str->buf = (unsigned char *)res.data.ptr;
        //str->bufptr = (unsigned char *)res.data.ptr;
        //str->buflen = res.length;
        //str->bufend = str->buf + str->buflen;
        //str->bufeof = str->bufend;
    }
    
    return str;
}

strid_t glk_stream_open_resource_uni(glui32 filenum, glui32 rock)
{
    strid_t str;
    giblorb_err_t err;
    giblorb_result_t res;
    giblorb_map_t *map = giblorb_get_resource_map();
    if (!map)
        return 0; /* Not running from a blorb file */

    err = giblorb_load_resource(map, giblorb_method_Memory, &res, giblorb_ID_Data, filenum);
    if (err)
        return 0; /* Not found, or some other error */

    if (res.chunktype == giblorb_ID_TEXT)
        {}
    else if (res.chunktype == giblorb_ID_BINA
        || res.chunktype == giblorb_make_id('F', 'O', 'R', 'M'))
        {}
    else
        return 0; /* Unknown chunk type */

    str = gli_new_stream(strtype_Resource, 
        TRUE, FALSE, rock);
    if (!str) {
        gli_strict_warning("stream_open_resource_uni: unable to create stream.");
        return NULL;
    }
    
    //str->unicode = TRUE;

    /* We have been handed an array of bytes. (They're big-endian
       four-byte chunks, or perhaps a UTF-8 byte sequence, rather than
       native-endian four-byte integers). So we drop it into buf,
       rather than ubuf -- we'll have to do the translation in the
       get() functions. */

    if (res.data.ptr && res.length) {
        //str->buf = (unsigned char *)res.data.ptr;
        //str->bufptr = (unsigned char *)res.data.ptr;
        //str->buflen = res.length;
        //str->bufend = str->buf + str->buflen;
        //str->bufeof = str->bufend;
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
    if (str->type != strtype_Memory)
    {
        glem_stream_set_current( str->tag );
    }
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

static void gli_set_hyperlink(stream_t *str, glui32 linkval)
{
    if (!str || !str->writable)
        return;

    if (!glk_gestalt(gestalt_Hyperlinks, 0))
        return;
    
    switch (str->type) {
        case strtype_Window:
            str->win->hyperlink = linkval;
            if (str->win->echostr)
                gli_set_hyperlink(str->win->echostr, linkval);
            break;
    }
    if (str->type != strtype_Memory)
    {
        glem_set_hyperlink_stream( str->tag, linkval );
    }
}

#ifdef GLK_MODULE_HYPERLINKS

void glk_set_hyperlink(glui32 linkval)
{
    gli_set_hyperlink(gli_currentstr, linkval);
}

void glk_set_hyperlink_stream(strid_t str, glui32 linkval)
{
    if (!str) {
        gli_strict_warning("set_hyperlink_stream: invalid ref");
        return;
    }
    gli_set_hyperlink(str, linkval);
}

#endif /* GLK_MODULE_HYPERLINKS */
