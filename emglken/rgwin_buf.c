/* rgwin_buf.c: The buffer window type
        for RemGlk, remote-procedure-call implementation of the Glk API.
    Designed by Andrew Plotkin <erkyrath@eblong.com>
    http://eblong.com/zarf/glk/
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "glk.h"
#include "emglken.h"
#include "rgwin_buf.h"

/* Maximum buffer size. The slack value is how much larger than the size 
    we should get before we trim. */
#define BUFFER_SIZE (5000)
#define BUFFER_SLACK (1000)

static long find_style_by_pos(window_textbuffer_t *dwin, long pos);
static void set_last_run(window_textbuffer_t *dwin, glui32 style, glui32 hyperlink);

window_textbuffer_t *win_textbuffer_create(window_t *win)
{
    window_textbuffer_t *dwin = (window_textbuffer_t *)malloc(sizeof(window_textbuffer_t));
    dwin->owner = win;
    
    dwin->numchars = 0;
    dwin->charssize = 500;
    dwin->chars = (glui32 *)malloc(dwin->charssize * sizeof(glui32));
    
    dwin->numruns = 0;
    dwin->runssize = 40;
    dwin->runs = (tbrun_t *)malloc(dwin->runssize * sizeof(tbrun_t));
    
    if (!dwin->chars || !dwin->runs)
        return NULL;

    dwin->inbuf = NULL;
    dwin->inunicode = FALSE;
    dwin->inecho = FALSE;
    dwin->intermkeys = 0;
    
    dwin->numruns = 1;
    dwin->runs[0].style = style_Normal;
    dwin->runs[0].hyperlink = 0;
    dwin->runs[0].pos = 0;
    
    dwin->width = -1;
    dwin->height = -1;

    return dwin;
}

void win_textbuffer_destroy(window_textbuffer_t *dwin)
{
    if (dwin->inbuf) {
        if (gli_unregister_arr) {
            char *typedesc = (dwin->inunicode ? "&+#!Iu" : "&+#!Cn");
            (*gli_unregister_arr)(dwin->inbuf, dwin->inmax, typedesc, dwin->inarrayrock);
        }
        dwin->inbuf = NULL;
    }
    
    dwin->owner = NULL;
    
    if (dwin->runs) {
        free(dwin->runs);
        dwin->runs = NULL;
    }
    
    if (dwin->chars) {
        free(dwin->chars);
        dwin->chars = NULL;
    }
    
    free(dwin);
}

/* Find the last stylerun for which pos >= style.pos. We know run[0].pos == 0,
    so the result is always >= 0. */
static long find_style_by_pos(window_textbuffer_t *dwin, long pos)
{
    long beg, end, val;
    tbrun_t *runs = dwin->runs;
    
    /* Do a binary search, maintaining 
            runs[beg].pos <= pos < runs[end].pos
        (we pretend that runs[numruns].pos is infinity) */
    
    beg = 0;
    end = dwin->numruns;
    
    while (beg+1 < end) {
        val = (beg+end) / 2;
        if (pos >= runs[val].pos) {
            beg = val;
        }
        else {
            end = val;
        }
    }
    
    return beg;
}

void win_textbuffer_putchar(window_t *win, glui32 ch)
{
    window_textbuffer_t *dwin = win->data;
    long lx;
    
    if (dwin->numchars >= dwin->charssize) {
        dwin->charssize *= 2;
        dwin->chars = (glui32 *)realloc(dwin->chars, 
            dwin->charssize * sizeof(glui32));
    }
    
    lx = dwin->numchars;
    
    if (win->style != dwin->runs[dwin->numruns-1].style
        || win->hyperlink != dwin->runs[dwin->numruns-1].hyperlink) {
        set_last_run(dwin, win->style, win->hyperlink);
    }
    
    dwin->chars[lx] = ch;
    dwin->numchars++;
}

/* If the last (dangling) run is empty, set its style/link attributes.
   Otherwise, add a new empty run with those attributes. */
static void set_last_run(window_textbuffer_t *dwin, glui32 style, glui32 hyperlink)
{
    long lx = dwin->numchars;
    long rx = dwin->numruns-1;
    
    if (dwin->runs[rx].pos == lx) {
        dwin->runs[rx].style = style;
        dwin->runs[rx].hyperlink = hyperlink;
    }
    else {
        rx++;
        if (rx >= dwin->runssize) {
            dwin->runssize *= 2;
            dwin->runs = (tbrun_t *)realloc(dwin->runs,
                dwin->runssize * sizeof(tbrun_t));
        }
        dwin->runs[rx].pos = lx;
        dwin->runs[rx].style = style;
        dwin->runs[rx].hyperlink = hyperlink;
        dwin->numruns++;
    }

}

/* Prepare the window for line input. */
void win_textbuffer_init_line(window_t *win, void *buf, int unicode, 
    int maxlen, int initlen)
{
    window_textbuffer_t *dwin = win->data;
    
    dwin->inbuf = buf;
    dwin->inunicode = unicode;
    dwin->inmax = maxlen;
    dwin->incurpos = initlen;
    
    if (gli_register_arr) {
        char *typedesc = (dwin->inunicode ? "&+#!Iu" : "&+#!Cn");
        dwin->inarrayrock = (*gli_register_arr)(dwin->inbuf, maxlen, typedesc);
    }
}

void win_textbuffer_prepare_input(window_t *win, glui32 *buf, glui32 len)
{
    window_textbuffer_t *dwin = win->data;
    int ix;

    if (!dwin->inbuf)
        return;

    if (len > dwin->inmax)
        len = dwin->inmax;

    dwin->incurpos = len;
}

void win_textbuffer_accept_line(window_t *win, glui32 len)
{
    //long len;
    void *inbuf;
    int inmax, inunicode, inecho;
    glui32 termkey = 0;
    gidispatch_rock_t inarrayrock;
    window_textbuffer_t *dwin = win->data;
    
    if (!dwin->inbuf)
        return;
    
    inbuf = dwin->inbuf;
    inmax = dwin->inmax;
    inarrayrock = dwin->inarrayrock;
    inunicode = dwin->inunicode;

    /* ### set termkey */

    gli_event_store(evtype_LineInput, win, len, termkey);
    win->line_request = FALSE;
    dwin->inbuf = NULL;
    dwin->incurpos = 0;
    dwin->inmax = 0;
    dwin->inecho = FALSE;
    dwin->intermkeys = 0;

    //if (inecho)
    //    win_textbuffer_putchar(win, '\n');

    if (gli_unregister_arr) {
        char *typedesc = (inunicode ? "&+#!Iu" : "&+#!Cn");
        (*gli_unregister_arr)(inbuf, inmax, typedesc, inarrayrock);
    }
}

/* Abort line input, storing whatever's been typed so far. */
void win_textbuffer_cancel_line(window_t *win, event_t *ev)
{
    long len;
    void *inbuf;
    int inmax, inunicode, inecho;
    gidispatch_rock_t inarrayrock;
    window_textbuffer_t *dwin = win->data;

    if (!dwin->inbuf)
        return;

    inbuf = dwin->inbuf;
    inmax = dwin->inmax;
    inarrayrock = dwin->inarrayrock;
    inunicode = dwin->inunicode;
    inecho = dwin->inecho;

    len = dwin->incurpos;
    /*if (inecho && win->echostr) {
        if (!inunicode)
            gli_stream_echo_line(win->echostr, (char *)inbuf, len);
        else
            gli_stream_echo_line_uni(win->echostr, (glui32 *)inbuf, len);
    }*/

    if (inecho) {
        /* Add the typed text to the buffer. */
        int ix;
        if (!inunicode) {
            for (ix=0; ix<len; ix++) {
                glui32 ch = ((char *)inbuf)[ix];
                win_textbuffer_putchar(win, ch);
            }
        }
        else {
            for (ix=0; ix<len; ix++) {
                glui32 ch = ((glui32 *)inbuf)[ix];
                win_textbuffer_putchar(win, ch);
            }
        }
    }
    
    win->style = dwin->origstyle;
    win->hyperlink = dwin->orighyperlink;
    set_last_run(dwin, win->style, win->hyperlink);

    ev->type = evtype_LineInput;
    ev->win = win;
    ev->val1 = len;
    
    win->line_request = FALSE;
    dwin->inbuf = NULL;
    dwin->incurpos = 0;
    dwin->inmax = 0;
    dwin->inecho = FALSE;
    dwin->intermkeys = 0;

    if (inecho)
        win_textbuffer_putchar(win, '\n');
    
    if (gli_unregister_arr) {
        char *typedesc = (inunicode ? "&+#!Iu" : "&+#!Cn");
        (*gli_unregister_arr)(inbuf, inmax, typedesc, inarrayrock);
    }
}