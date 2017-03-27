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
#include "rgwin_pair.h"
#include "rgwin_blank.h"
#include "rgwin_grid.h"
#include "rgwin_buf.h"
#include "rgwin_graph.h"

/* The update generation number. */
static glui32 generation = 0;

/* Linked list of all windows */
static window_t *gli_windowlist = NULL; 

/* For use by gli_print_spaces() */
#define NUMSPACES (16)
static char spacebuffer[NUMSPACES+1];

window_t *gli_rootwin = NULL; /* The topmost window. */
window_t *gli_focuswin = NULL; /* The window selected by the player. 
    (This has nothing to do with the "current output stream", which is
    gli_currentstr in gtstream.c. In fact, the program doesn't know
    about gli_focuswin at all.) */

/* The current screen metrics. */
//static data_metrics_t metrics;
/* Flag: Has the window arrangement changed at all? */
static int geometry_changed;

void (*gli_interrupt_handler)(void) = NULL;

//static void compute_content_box(grect_t *box);

/* Set up the window system. This is called from main(). */
void gli_initialize_windows(/*data_metrics_t *newmetrics*/)
{
    int ix;

    generation = 0;
    srandom(time(NULL));
    gli_rootwin = NULL;
    gli_focuswin = NULL;
    
    /* Build a convenient array of spaces. */
    for (ix=0; ix<NUMSPACES; ix++)
        spacebuffer[ix] = ' ';
    spacebuffer[NUMSPACES] = '\0';
    
    //metrics = *newmetrics;

    geometry_changed = TRUE;
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

glui32 gli_window_current_generation()
{
    return generation;
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
    
    win->magicnum = MAGIC_WINDOW_NUM;
    win->rock = rock;
    win->type = type;
    win->updatetag = updatetag;
    
    win->parent = NULL; /* for now */
    win->data = NULL; /* for now */
    win->inputgen = 0;
    win->char_request = FALSE;
    win->line_request = FALSE;
    win->line_request_uni = FALSE;
    win->char_request_uni = FALSE;
    win->style = style_Normal;
    win->hyperlink = 0;

    win->str = gli_stream_open_window(win);
    win->echostr = NULL;

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
        
    win->magicnum = 0;
    
    win->echostr = NULL;
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
    window_pair_t *dpairwin;
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
            newwin->data = win_blank_create(newwin);
            break;
        case wintype_TextGrid:
            newwin->data = win_textgrid_create(newwin);
            break;
        case wintype_TextBuffer:
            newwin->data = win_textbuffer_create(newwin);
            break;
        case wintype_Graphics:
            newwin->data = win_graphics_create(newwin);
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
    
    if (!newwin->data) {
        gli_strict_warning("window_open: unable to create window");
        return 0;
    }
    
    if (!splitwin) {
        gli_rootwin = newwin;
    }
    else {
        /* create pairwin, with newwin as the key */
        pairwin = gli_new_window(wintype_Pair, 0, pairwintag);
        dpairwin = win_pair_create(pairwin, method, newwin, size);
        pairwin->data = dpairwin;
            
        dpairwin->child1 = splitwin;
        dpairwin->child2 = newwin;
        
        splitwin->parent = pairwin;
        newwin->parent = pairwin;
        pairwin->parent = oldparent;

        if (oldparent) {
            window_pair_t *dparentwin = oldparent->data;
            if (dparentwin->child1 == splitwin)
                dparentwin->child1 = pairwin;
            else
                dparentwin->child2 = pairwin;
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
    
    for (wx=win->parent; wx; wx=wx->parent) {
        if (wx->type == wintype_Pair) {
            window_pair_t *dwx = wx->data;
            if (dwx->key == win) {
                dwx->key = NULL;
                dwx->keydamage = TRUE;
            }
        }
    }
    
    switch (win->type) {
        case wintype_Blank: {
            window_blank_t *dwin = win->data;
            win_blank_destroy(dwin);
            }
            break;
        case wintype_Pair: {
            window_pair_t *dwin = win->data;
            if (recurse) {
                if (dwin->child1)
                    gli_window_close(dwin->child1, TRUE);
                if (dwin->child2)
                    gli_window_close(dwin->child2, TRUE);
            }
            win_pair_destroy(dwin);
            }
            break;
        case wintype_TextBuffer: {
            window_textbuffer_t *dwin = win->data;
            win_textbuffer_destroy(dwin);
            }
            break;
        case wintype_TextGrid: {
            window_textgrid_t *dwin = win->data;
            win_textgrid_destroy(dwin);
            }
            break;
        case wintype_Graphics: {
            window_graphics_t *dwin = win->data;
            win_graphics_destroy(dwin);
            }
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
        geometry_changed = TRUE;
        
        gli_stream_fill_result(win->str, result);
        gli_window_close(win, TRUE); 
    }
    else {
        /* have to jigger parent */
        //grect_t box;
        window_t *pairwin, *sibwin, *grandparwin, *wx;
        window_pair_t *dpairwin, *dgrandparwin;
        int keydamage_flag;
        
        pairwin = win->parent;
        dpairwin = pairwin->data;
        if (win == dpairwin->child1) {
            sibwin = dpairwin->child2;
        }
        else if (win == dpairwin->child2) {
            sibwin = dpairwin->child1;
        }
        else {
            gli_strict_warning("window_close: window tree is corrupted");
            return;
        }
        
        //box = pairwin->bbox;

        grandparwin = pairwin->parent;
        if (!grandparwin) {
            gli_rootwin = sibwin;
            sibwin->parent = NULL;
        }
        else {
            dgrandparwin = grandparwin->data;
            if (dgrandparwin->child1 == pairwin)
                dgrandparwin->child1 = sibwin;
            else
                dgrandparwin->child2 = sibwin;
            sibwin->parent = grandparwin;
        }
        
        /* Begin closation */
        
        gli_stream_fill_result(win->str, result);

        /* Close the child window (and descendants), so that key-deletion can
            crawl up the tree to the root window. */
        gli_window_close(win, TRUE); 
        
        /* This probably isn't necessary, but the child *is* gone, so just
            in case. */
        if (win == dpairwin->child1) {
            dpairwin->child1 = NULL;
        }
        else if (win == dpairwin->child2) {
            dpairwin->child2 = NULL;
        }
        
        /* Now we can delete the parent pair. */
        gli_window_close(pairwin, FALSE);

        keydamage_flag = FALSE;
        for (wx=sibwin; wx; wx=wx->parent) {
            if (wx->type == wintype_Pair) {
                window_pair_t *dwx = wx->data;
                if (dwx->keydamage) {
                    keydamage_flag = TRUE;
                    dwx->keydamage = FALSE;
                }
            }
        }
        
        /*if (keydamage_flag) {
            compute_content_box(&box);
            gli_window_rearrange(gli_rootwin, &box, &metrics);
        }
        else {
            gli_window_rearrange(sibwin, &box, &metrics);
        }*/
    }
}

void glk_window_get_arrangement(window_t *win, glui32 *method, glui32 *size, 
    winid_t *keywin)
{
    window_pair_t *dwin;
    glui32 val;
    
    if (!win) {
        gli_strict_warning("window_get_arrangement: invalid ref");
        return;
    }
    
    if (win->type != wintype_Pair) {
        gli_strict_warning("window_get_arrangement: not a Pair window");
        return;
    }
    
    glem_window_get_arrangement( win->updatetag, method, size, keywin );
}

void glk_window_set_arrangement(window_t *win, glui32 method, glui32 size, 
    winid_t key)
{
    window_pair_t *dwin;
    glui32 newdir;
    //grect_t box;
    int newvertical, newbackward;
    
    if (!win) {
        gli_strict_warning("window_set_arrangement: invalid ref");
        return;
    }
    
    if (win->type != wintype_Pair) {
        gli_strict_warning("window_set_arrangement: not a Pair window");
        return;
    }
    
    if (key) {
        window_t *wx;
        if (key->type == wintype_Pair) {
            gli_strict_warning("window_set_arrangement: keywin cannot be a Pair");
            return;
        }
        for (wx=key; wx; wx=wx->parent) {
            if (wx == win)
                break;
        }
        if (wx == NULL) {
            gli_strict_warning("window_set_arrangement: keywin must be a descendant");
            return;
        }
    }
    
    dwin = win->data;
    //box = win->bbox;
    
    newdir = method & winmethod_DirMask;
    newvertical = (newdir == winmethod_Left || newdir == winmethod_Right);
    newbackward = (newdir == winmethod_Left || newdir == winmethod_Above);
    if (!key)
        key = dwin->key;

    if ((newvertical && !dwin->vertical) || (!newvertical && dwin->vertical)) {
        if (!dwin->vertical)
            gli_strict_warning("window_set_arrangement: split must stay horizontal");
        else
            gli_strict_warning("window_set_arrangement: split must stay vertical");
        return;
    }
    
    if (key && key->type == wintype_Blank 
        && (method & winmethod_DivisionMask) == winmethod_Fixed) {
        gli_strict_warning("window_set_arrangement: a Blank window cannot have a fixed size");
        return;
    }

    if ((newbackward && !dwin->backward) || (!newbackward && dwin->backward)) {
        /* switch the children */
        window_t *tmpwin = dwin->child1;
        dwin->child1 = dwin->child2;
        dwin->child2 = tmpwin;
    }
    
    /* set up everything else */
    dwin->dir = newdir;
    dwin->division = method & winmethod_DivisionMask;
    dwin->key = key;
    dwin->size = size;
    dwin->hasborder = ((method & winmethod_BorderMask) == winmethod_Border);
    
    dwin->vertical = (dwin->dir == winmethod_Left || dwin->dir == winmethod_Right);
    dwin->backward = (dwin->dir == winmethod_Left || dwin->dir == winmethod_Above);
    
    glem_window_set_arrangement( win->updatetag, method, size, key );
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

window_t *gli_window_iterate_treeorder(window_t *win)
{
    if (!win)
        return gli_rootwin;
    
    if (win->type == wintype_Pair) {
        window_pair_t *dwin = win->data;
        if (!dwin->backward)
            return dwin->child1;
        else
            return dwin->child2;
    }
    else {
        window_t *parwin;
        window_pair_t *dwin;
        
        while (win->parent) {
            parwin = win->parent;
            dwin = parwin->data;
            if (!dwin->backward) {
                if (win == dwin->child1)
                    return dwin->child2;
            }
            else {
                if (win == dwin->child2)
                    return dwin->child1;
            }
            win = parwin;
        }
        
        return NULL;
    }
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
    window_pair_t *dparwin;
    
    if (!win) {
        gli_strict_warning("window_get_sibling: invalid ref");
        return 0;
    }
    if (!win->parent)
        return 0;
    
    dparwin = win->parent->data;
    if (dparwin->child1 == win)
        return dparwin->child2;
    else if (dparwin->child2 == win)
        return dparwin->child1;
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

void glk_window_get_size(window_t *win, glui32 *width, glui32 *height)
{    
    if (!win) {
        gli_strict_warning("window_get_size: invalid ref");
        return;
    }
    
    glem_window_get_size( win->updatetag, width, height );
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
    if (!win) {
        gli_strict_warning("window_get_echo_stream: invalid ref");
        return 0;
    }
    
    if (win->echostr)
        return win->echostr;
    else
        return 0;
}

void glk_window_set_echo_stream(window_t *win, stream_t *str)
{
    if (!win) {
        gli_strict_warning("window_set_echo_stream: invalid window id");
        return;
    }
    
    win->echostr = str;
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

void gli_windows_unechostream(stream_t *str)
{
    window_t *win;
    
    for (win=gli_windowlist; win; win=win->next) {
        if (win->echostr == str)
            win->echostr = NULL;
    }
}

static glui32 *dup_buffer(void *buf, int len, int unicode)
{
    int ix;
    glui32 *res = malloc(len * sizeof(glui32));
    if (!res)
        return NULL;

    if (!unicode) {
        char *cbuf = (char *)buf;
        for (ix=0; ix<len; ix++)
            res[ix] = cbuf[ix];
    }
    else {
        glui32 *cbuf = (glui32 *)buf;
        for (ix=0; ix<len; ix++)
            res[ix] = cbuf[ix];
    }

    return res;
}

#if GIDEBUG_LIBRARY_SUPPORT

/* A cache of debug lines generated this cycle. */
//static gen_list_t debug_output_cache = { NULL, 0, 0 };

/*void gidebug_output(char *text)
{
    // Send a line of text to the "debug console", if the user has
    //   requested debugging mode. *
    if (gli_debugger) {
        gen_list_append(&debug_output_cache, strdup(text));
    }
}*/

#endif /* GIDEBUG_LIBRARY_SUPPORT */

void gli_window_prepare_input(window_t *win, glui32 *buf, glui32 len)
{
    switch (win->type) {
        case wintype_TextGrid:
            win_textgrid_prepare_input(win, buf, len);
            break;
        case wintype_TextBuffer:
            win_textbuffer_prepare_input(win, buf, len);
            break;
    }
}

void gli_window_accept_line(window_t *win, glui32 len)
{
    switch (win->type) {
        case wintype_TextGrid:
            win_textgrid_accept_line(win, len);
            break;
        case wintype_TextBuffer:
            win_textbuffer_accept_line(win, len);
            break;
    }
}

void glk_request_char_event(window_t *win)
{
    win->char_request = TRUE;
    win->char_request_uni = FALSE;
    glem_request_char_event( win->updatetag, FALSE );
}

void glk_request_line_event(window_t *win, char *buf, glui32 maxlen, 
    glui32 initlen)
{
    if (!win) {
        gli_strict_warning("request_line_event: invalid ref");
        return;
    }
    
    if (win->char_request || win->line_request) {
        gli_strict_warning("request_line_event: window already has keyboard request");
        return;
    }
    
    switch (win->type) {
        case wintype_TextBuffer:
            win->line_request = TRUE;
            win->line_request_uni = FALSE;
            win_textbuffer_init_line(win, buf, FALSE, maxlen, initlen);
            glem_request_line_event( win->updatetag, buf, maxlen, initlen, FALSE );
            break;
        case wintype_TextGrid:
            win->line_request = TRUE;
            win->line_request_uni = FALSE;
            win_textgrid_init_line(win, buf, FALSE, maxlen, initlen);
            glem_request_line_event( win->updatetag, buf, maxlen, initlen, FALSE );
            break;
        default:
            gli_strict_warning("request_line_event: window does not support keyboard input");
            break;
    }
    
}

#ifdef GLK_MODULE_UNICODE

void glk_request_char_event_uni(window_t *win)
{
    win->char_request = TRUE;
    win->char_request_uni = TRUE;
    glem_request_char_event( win->updatetag, TRUE );
}

void glk_request_line_event_uni(window_t *win, glui32 *buf, glui32 maxlen, glui32 initlen)
{
    if (!win) {
        gli_strict_warning("request_line_event: invalid ref");
        return;
    }
    
    if (win->char_request || win->line_request) {
        gli_strict_warning("request_line_event: window already has keyboard request");
        return;
    }
    
    switch (win->type) {
        case wintype_TextBuffer:
            win->line_request = TRUE;
            win->line_request_uni = TRUE;
            //win->inputgen = generation+1;
            win_textbuffer_init_line(win, buf, TRUE, maxlen, initlen);
            glem_request_line_event( win->updatetag, buf, maxlen, initlen, TRUE );
            break;
        case wintype_TextGrid:
            win->line_request = TRUE;
            win->line_request_uni = TRUE;
            //win->inputgen = generation+1;
            win_textgrid_init_line(win, buf, TRUE, maxlen, initlen);
            glem_request_line_event( win->updatetag, buf, maxlen, initlen, TRUE );
            break;
        default:
            gli_strict_warning("request_line_event: window does not support keyboard input");
            break;
    }
    
}

#endif /* GLK_MODULE_UNICODE */

void glk_request_mouse_event(window_t *win)
{
    if (!win) {
        gli_strict_warning("request_mouse_event: invalid ref");
        return;
    }
    
    glem_request_mouse_event( win->updatetag );
    
    return;
}

void glk_cancel_char_event(window_t *win)
{
    if (!win) {
        gli_strict_warning("cancel_char_event: invalid ref");
        return;
    }
    
    switch (win->type) {
        case wintype_TextBuffer:
        case wintype_TextGrid:
            win->char_request = FALSE;
            win->inputgen = 0;
            break;
        default:
            /* do nothing */
            break;
    }
    glem_cancel_char_event( win->updatetag );
}

void glk_cancel_line_event(window_t *win, event_t *ev)
{
    event_t dummyev;
    
    if (!ev) {
        ev = &dummyev;
    }

    gli_event_clearevent(ev);
    
    if (!win) {
        gli_strict_warning("cancel_line_event: invalid ref");
        return;
    }
    
    switch (win->type) {
        case wintype_TextBuffer:
            if (win->line_request) {
                win_textbuffer_cancel_line(win, ev);
                win->inputgen = 0;
            }
            break;
        case wintype_TextGrid:
            if (win->line_request) {
                win_textgrid_cancel_line(win, ev);
                win->inputgen = 0;
            }
            break;
        default:
            /* do nothing */
            break;
    }
    glem_cancel_line_event( win->updatetag );
}

void glk_cancel_mouse_event(window_t *win)
{
    if (!win) {
        gli_strict_warning("cancel_mouse_event: invalid ref");
        return;
    }
    
    glem_cancel_mouse_event( win->updatetag );
    /* But, in fact, we can't do much about this. */
    
    return;
}

void glk_window_clear(window_t *win)
{
    glem_window_clear( win->updatetag );
}

void glk_window_move_cursor(window_t *win, glui32 xpos, glui32 ypos)
{
    if (!win) {
        gli_strict_warning("window_move_cursor: invalid ref");
        return;
    }
    
    switch (win->type) {
        case wintype_TextGrid:
            win_textgrid_move_cursor(win, xpos, ypos);
            break;
        default:
            gli_strict_warning("window_move_cursor: not a TextGrid window");
            break;
    }
}

#ifdef GLK_MODULE_LINE_ECHO

void glk_set_echo_line_event(window_t *win, glui32 val)
{
    if (!win) {
        gli_strict_warning("set_echo_line_event: invalid ref");
        return;
    }
    
    glem_set_echo_line_event( win->updatetag, val );
}

#endif /* GLK_MODULE_LINE_ECHO */

#ifdef GLK_MODULE_LINE_TERMINATORS

void glk_set_terminators_line_event(window_t *win, glui32 *keycodes, 
    glui32 count)
{

    if (!win) {
        gli_strict_warning("set_terminators_line_event: invalid ref");
        return;
    }
    
    glem_set_terminators_line_event( win->updatetag, keycodes, count );
}

#endif /* GLK_MODULE_LINE_TERMINATORS */

#ifdef GLK_MODULE_IMAGE

glui32 glk_image_draw(winid_t win, glui32 image, glsi32 val1, glsi32 val2)
{
    if (!glk_gestalt(gestalt_Graphics, 0)) {
        gli_strict_warning("image_draw: graphics not supported.");
        return FALSE;
    }
    return glem_image_draw( win->updatetag, image, val1, val2);
}

glui32 glk_image_draw_scaled(winid_t win, glui32 image, 
    glsi32 val1, glsi32 val2, glui32 width, glui32 height)
{
    if (!glk_gestalt(gestalt_Graphics, 0)) {
        gli_strict_warning("image_draw_scaled: graphics not supported.");
        return FALSE;
    }
    return glem_image_draw_scaled( win->updatetag, image, val1, val2, width, height);
}

void glk_window_flow_break(winid_t win)
{
    if (!win) {
        gli_strict_warning("flow_break: invalid ref");
        return;
    }
    
    glem_window_flow_break( win->updatetag );
}

void glk_window_erase_rect(winid_t win, 
    glsi32 left, glsi32 top, glui32 width, glui32 height)
{
    if (!win) {
        gli_strict_warning("window_erase_rect: invalid ref");
        return;
    }
    if (win->type != wintype_Graphics) {
        gli_strict_warning("window_erase_rect: not a graphics window");
        return;
    }
    
    glem_window_erase_rect( win->updatetag, left, top, width, height );
}

void glk_window_fill_rect(winid_t win, glui32 color, 
    glsi32 left, glsi32 top, glui32 width, glui32 height)
{
    if (!win) {
        gli_strict_warning("window_fill_rect: invalid ref");
        return;
    }
    if (win->type != wintype_Graphics) {
        gli_strict_warning("window_fill_rect: not a graphics window");
        return;
    }

    glem_window_fill_rect( win->updatetag, color, left, top, width, height );
}

void glk_window_set_background_color(winid_t win, glui32 color)
{
    glem_window_set_background_color( win->updatetag, color );
}

#endif /* GLK_MODULE_IMAGE */

#ifdef GLK_MODULE_HYPERLINKS

void glk_request_hyperlink_event(winid_t win)
{
    if (!win) {
        gli_strict_warning("request_hyperlink_event: invalid ref");
        return;
    }

    if (!glk_gestalt(gestalt_HyperlinkInput, 0))
        return;

    glem_request_hyperlink_event( win->updatetag );
}

void glk_cancel_hyperlink_event(winid_t win)
{
    if (!win) {
        gli_strict_warning("cancel_hyperlink_event: invalid ref");
        return;
    }

    if (!glk_gestalt(gestalt_HyperlinkInput, 0))
        return;

    glem_cancel_hyperlink_event( win->updatetag );
}

#endif /* GLK_MODULE_HYPERLINKS */
