/* gtwindow.c: Window objects
        for RemGlk, remote-procedure-call implementation of the Glk API.
    Designed by Andrew Plotkin <erkyrath@eblong.com>
    http://eblong.com/zarf/glk/
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <math.h>

#include "glk.h"
#include "emglken.h"
#include "gi_blorb.h"

/* Linked list of all windows */
static window_t *gli_windowlist = NULL; 

window_t *gli_rootwin = NULL; /* The topmost window. */
window_t *gli_focuswin = NULL; /* The window selected by the player. 
    (This has nothing to do with the "current output stream", which is
    gli_currentstr in gtstream.c. In fact, the program doesn't know
    about gli_focuswin at all.) */

void (*gli_interrupt_handler)(void) = NULL;

/* Set up the window system. This is called from main(). */
void gli_initialize_windows()
{
    int ix;

    srandom(time(NULL));
    gli_rootwin = NULL;
    gli_focuswin = NULL;
}

/* Get out fast. This is used by the ctrl-C interrupt handler, under Unix. 
    It doesn't pause and wait for a keypress, and it calls the Glk interrupt
    handler. Otherwise it's the same as glk_exit(). */
void gli_fast_exit()
{
    if (gli_interrupt_handler) {
        (*gli_interrupt_handler)();
    }

    gli_streams_close_all();
    exit(0);
}

window_t *gli_window_find_by_tag(glui32 tag)
{
    window_t *win;
    for (win=gli_windowlist; win; win=win->next) {
        if (win->updatetag == tag)
            return win;
    }
    return NULL;
}

window_t *gli_new_window(glui32 type, glui32 rock, glui32 updatetag)
{
    window_t *win = (window_t *)malloc(sizeof(window_t));
    if (!win)
        return NULL;
    
    win->rock = rock;
    win->type = type;
    win->updatetag = updatetag;
    
    win->parent = NULL; /* for now */
    win->line_request = FALSE;

    win->str = gli_stream_open_window(win);

    win->prev = NULL;
    win->next = gli_windowlist;
    gli_windowlist = win;
    if (win->next) {
        win->next->prev = win;
    }
    
    if (gli_register_obj)
        win->disprock = (*gli_register_obj)(win, gidisp_Class_Window);
    
    return win;
}

void gli_delete_window(window_t *win)
{
    window_t *prev, *next;
    
    if (gli_unregister_obj)
        (*gli_unregister_obj)(win, gidisp_Class_Window, win->disprock);
    
    if (win->str) {
        gli_delete_stream(win->str);
        win->str = NULL;
    }
    
    prev = win->prev;
    next = win->next;
    win->prev = NULL;
    win->next = NULL;

    if (prev)
        prev->next = next;
    else
        gli_windowlist = next;
    if (next)
        next->prev = prev;
        
    free(win);
}

winid_t glk_window_open(winid_t splitwin, glui32 method, glui32 size, 
    glui32 wintype, glui32 rock)
{
    window_t *newwin, *pairwin, *oldparent;
    glui32 val;
    glui32 windowtag, pairwintag;
    
    if (!gli_rootwin) {
        if (splitwin) {
            gli_strict_warning("window_open: ref must be NULL");
            return 0;
        }
        /* ignore method and size now */
        oldparent = NULL;
    }
    else {
    
        if (!splitwin) {
            gli_strict_warning("window_open: ref must not be NULL");
            return 0;
        }
        
        val = (method & winmethod_DivisionMask);
        if (val != winmethod_Fixed && val != winmethod_Proportional) {
            gli_strict_warning("window_open: invalid method (not fixed or proportional)");
            return 0;
        }
        
        val = (method & winmethod_DirMask);
        if (val != winmethod_Above && val != winmethod_Below 
            && val != winmethod_Left && val != winmethod_Right) {
            gli_strict_warning("window_open: invalid method (bad direction)");
            return 0;
        }
        
        oldparent = splitwin->parent;
        if (oldparent && oldparent->type != wintype_Pair) {
            gli_strict_warning("window_open: parent window is not Pair");
            return 0;
        }
    
    }

    if (wintype == wintype_Graphics && !glk_gestalt(gestalt_Graphics, 0)) {
        /* Graphics windows not supported; silently return null */
        return 0;
    }
    
    if (splitwin) {
        windowtag = glem_new_window(splitwin->updatetag, method, size, wintype, rock, &pairwintag);
    }
    else {
        windowtag = glem_new_window(0, method, size, wintype, rock, &pairwintag);
    }
    if (!windowtag) {
        return 0;
    }
    newwin = gli_new_window(wintype, rock, windowtag);
    if (!newwin) {
        gli_strict_warning("window_open: unable to create window");
        return 0;
    }
    
    switch (wintype) {
        case wintype_Blank:
            break;
        case wintype_TextGrid:
            break;
        case wintype_TextBuffer:
            break;
        case wintype_Graphics:
            break;
        case wintype_Pair:
            gli_strict_warning("window_open: cannot open pair window directly");
            gli_delete_window(newwin);
            return 0;
        default:
            /* Unknown window type -- do not print a warning, just return 0
                to indicate that it's not possible. */
            gli_delete_window(newwin);
            return 0;
    }
    
    if (!splitwin) {
        gli_rootwin = newwin;
    }
    else {
        /* create pairwin, with newwin as the key */
        pairwin = gli_new_window(wintype_Pair, 0, pairwintag);
            
        pairwin->child1 = splitwin;
        pairwin->child2 = newwin;
        
        splitwin->parent = pairwin;
        newwin->parent = pairwin;
        pairwin->parent = oldparent;

        if (oldparent) {
            if (oldparent->child1 == splitwin)
                oldparent->child1 = pairwin;
            else
                oldparent->child2 = pairwin;
        }
        else {
            gli_rootwin = pairwin;
        }
    }
    
    return newwin;
}

static void gli_window_close(window_t *win, int recurse)
{
    window_t *wx;
    
    if (gli_focuswin == win) {
        gli_focuswin = NULL;
    }
    
    switch (win->type) {
        case wintype_Blank:
            break;
        case wintype_Pair: {
            if (recurse) {
                if (win->child1)
                    gli_window_close(win->child1, TRUE);
                if (win->child2)
                    gli_window_close(win->child2, TRUE);
            }
            }
            break;
        case wintype_TextBuffer:
            break;
        case wintype_TextGrid:
            break;
        case wintype_Graphics:
            break;
    }
    
    gli_delete_window(win);
}

void glk_window_close(window_t *win, stream_result_t *result)
{
    if (!win) {
        gli_strict_warning("window_close: invalid ref");
        return;
    }
    
    glem_window_close( win->updatetag );
        
    if (win == gli_rootwin || win->parent == NULL) {
        /* close the root window, which means all windows. */
        
        gli_rootwin = 0;
        
        /* begin (simpler) closation */
        glem_stream_finalise( win->str->tag, result, FALSE );
        gli_window_close(win, TRUE); 
    }
    else {
        /* have to jigger parent */
        window_t *pairwin, *sibwin, *grandparwin, *wx;
        int keydamage_flag;
        
        pairwin = win->parent;
        if (win == pairwin->child1) {
            sibwin = pairwin->child2;
        }
        else if (win == pairwin->child2) {
            sibwin = pairwin->child1;
        }
        else {
            gli_strict_warning("window_close: window tree is corrupted");
            return;
        }

        grandparwin = pairwin->parent;
        if (!grandparwin) {
            gli_rootwin = sibwin;
            sibwin->parent = NULL;
        }
        else {
            if (grandparwin->child1 == pairwin)
                grandparwin->child1 = sibwin;
            else
                grandparwin->child2 = sibwin;
            sibwin->parent = grandparwin;
        }
        
        /* Begin closation */
        
        glem_stream_finalise( win->str->tag, result, FALSE );

        /* Close the child window (and descendants), so that key-deletion can
            crawl up the tree to the root window. */
        gli_window_close(win, TRUE); 
        
        /* This probably isn't necessary, but the child *is* gone, so just
            in case. */
        if (win == pairwin->child1) {
            pairwin->child1 = NULL;
        }
        else if (win == pairwin->child2) {
            pairwin->child2 = NULL;
        }
        
        /* Now we can delete the parent pair. */
        gli_window_close(pairwin, FALSE);
    }
}

void glk_window_get_arrangement(window_t *win, glui32 *method, glui32 *size, 
    winid_t *keywin)
{
    glui32 keywintag;
    
    if (!win) {
        gli_strict_warning("window_get_arrangement: invalid ref");
        return;
    }
    
    if (win->type != wintype_Pair) {
        gli_strict_warning("window_get_arrangement: not a Pair window");
        return;
    }
    
    glem_window_get_arrangement( win->updatetag, method, size, &keywintag );
    *keywin = gli_window_find_by_tag( keywintag );
}

winid_t glk_window_iterate(winid_t win, glui32 *rock)
{
    if (!win) {
        win = gli_windowlist;
    }
    else {
        win = win->next;
    }
    
    if (win) {
        if (rock)
            *rock = win->rock;
        return win;
    }
    
    if (rock)
        *rock = 0;
    return NULL;
}

glui32 glk_window_get_rock(window_t *win)
{
    if (!win) {
        gli_strict_warning("window_get_rock: invalid ref.");
        return 0;
    }
    
    return win->rock;
}

winid_t glk_window_get_root()
{
    if (!gli_rootwin)
        return NULL;
    return gli_rootwin;
}

winid_t glk_window_get_parent(window_t *win)
{
    if (!win) {
        gli_strict_warning("window_get_parent: invalid ref");
        return 0;
    }
    if (win->parent)
        return win->parent;
    else
        return 0;
}

winid_t glk_window_get_sibling(window_t *win)
{
    window_t *parwin;
    
    if (!win) {
        gli_strict_warning("window_get_sibling: invalid ref");
        return 0;
    }
    if (!win->parent)
        return 0;
    
    parwin = win->parent;
    if (parwin->child1 == win)
        return parwin->child2;
    else if (parwin->child2 == win)
        return parwin->child1;
    return 0;
}

glui32 glk_window_get_type(window_t *win)
{
    if (!win) {
        gli_strict_warning("window_get_parent: invalid ref");
        return 0;
    }
    return win->type;
}

strid_t glk_window_get_stream(window_t *win)
{
    if (!win) {
        gli_strict_warning("window_get_stream: invalid ref");
        return NULL;
    }
    
    return win->str;
}

strid_t glk_window_get_echo_stream(window_t *win)
{
    return gli_stream_find_by_tag( glem_get_window_echostream_tag( win->updatetag ) );
}

void glk_set_window(window_t *win)
{
    if (!win) {
        gli_stream_set_current(NULL);
    }
    else {
        gli_stream_set_current(win->str);
    }
}

void gli_window_accept_line(window_t *win, glui32 len)
{
    void *inbuf;
    int inmax, inunicode, inecho;
    glui32 termkey = 0;
    
    if (!win->line_request || !win->buf)
        return;
    
    inbuf = win->buf;
    inmax = win->buflen;
    inunicode = win->unicode;

    /* ### set termkey */

    gli_event_store(evtype_LineInput, win, len, termkey);
    win->line_request = FALSE;
    win->buf = NULL;
    win->incurpos = 0;
    win->buflen = 0;

    if (gli_unregister_arr) {
        char *typedesc = (inunicode ? "&+#!Iu" : "&+#!Cn");
        (*gli_unregister_arr)(inbuf, inmax, typedesc, win->arrayrock);
    }
}

void glk_request_line_event(window_t *win, char *buf, glui32 maxlen, 
    glui32 initlen)
{
    if (!win) {
        gli_strict_warning("request_line_event: invalid ref");
        return;
    }
    
    if (win->line_request) {
        gli_strict_warning("request_line_event: window already has keyboard request");
        return;
    }

    if (win->type != wintype_TextBuffer && win->type != wintype_TextGrid)
    {
        gli_strict_warning("request_line_event: window does not support keyboard input");
    }

    win->line_request = TRUE;
    win->buf = buf;
    win->unicode = FALSE;
    win->buflen = maxlen;
    win->incurpos = initlen;
    
    if (gli_register_arr) {
        win->arrayrock = (*gli_register_arr)(buf, maxlen, "&+#!Cn");
    }

    glem_request_line_event( win->updatetag, buf, maxlen, initlen, FALSE );
}

#ifdef GLK_MODULE_UNICODE

void glk_request_line_event_uni(window_t *win, glui32 *buf, glui32 maxlen, glui32 initlen)
{
    if (!win) {
        gli_strict_warning("request_line_event_uni: invalid ref");
        return;
    }
    
    if (win->line_request) {
        gli_strict_warning("request_line_event_uni: window already has keyboard request");
        return;
    }

    if (win->type != wintype_TextBuffer && win->type != wintype_TextGrid)
    {
        gli_strict_warning("request_line_event_uni: window does not support keyboard input");
    }

    win->line_request = TRUE;
    win->buf = buf;
    win->unicode = TRUE;
    win->buflen = maxlen;
    win->incurpos = initlen;
    
    if (gli_register_arr) {
        win->arrayrock = (*gli_register_arr)(buf, maxlen, "&+#!Iu");
    }

    glem_request_line_event( win->updatetag, buf, maxlen, initlen, TRUE );
}

#endif /* GLK_MODULE_UNICODE */