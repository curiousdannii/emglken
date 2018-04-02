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

void (*gli_interrupt_handler)(void) = NULL;

/* Set up the window system. This is called from main(). */
void gli_initialize_windows()
{
    int ix;

    srandom(time(NULL));
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

window_t *gli_new_window( glui32 tag, glui32 rock )
{
    window_t *win = (window_t *)malloc(sizeof(window_t));
    if (!win)
        return NULL;
    
    win->rock = rock;
    win->tag = tag;

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