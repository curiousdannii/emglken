/* gtevent.c: Event handling, including glk_select() and timed input code
        for RemGlk, remote-procedure-call implementation of the Glk API.
    Designed by Andrew Plotkin <erkyrath@eblong.com>
    http://eblong.com/zarf/glk/
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/time.h>

#include "glk.h"
#include "emglken.h"

/* A pointer to the place where the pending glk_select() will store its
    event. When not inside a glk_select() call, this will be NULL. */
static event_t *curevent = NULL; 

/* The current timed-event request, exactly as passed to
   glk_request_timer_events(). */
static glui32 timing_msec; 
/* The last timing value that was sent out. (0 means null was sent.) */
static glui32 last_timing_msec;
/* When the current timer started or last fired. */
static struct timeval timing_start; 

static glsi32 gli_timer_request_since_start(void);
static char *alloc_utf_buffer(glui32 *ustr, int ulen);

/* Set up the input system. This is called from main(). */
void gli_initialize_events()
{
    timing_msec = 0;
    last_timing_msec = 0;
}

void glk_select(event_t *event)
{
    curevent = event;
    gli_event_clearevent(curevent);
    
    if (gli_debugger)
        gidebug_announce_cycle(gidebug_cycle_InputWait);

    glui32 data[4];

    glem_select( data );
    window_t *win = gli_window_find_by_tag( data[1] );

    switch ( data[0] )
    {
        case evtype_LineInput:
            if (!win)
                break;
            if (!win->line_request)
                break;
            //gli_window_prepare_input( win, NULL, data[2] );
            gli_window_accept_line( win, data[2] );
            break;

        case evtype_CharInput:
            if (!win)
                break;
            if (!win->char_request)
                break;
            win->char_request = FALSE;
            win->char_request_uni = FALSE;
            gli_event_store( evtype_CharInput, win, data[2], 0 );
            break;

        case evtype_Hyperlink:
            if (!win)
                break;
            if (!win->hyperlink_request)
                break;
            win->hyperlink_request = FALSE;
            gli_event_store( evtype_Hyperlink, win, data[2], 0 );
            break;

        default:
            gli_event_store( data[0], win, data[2], data[3] );
            break;
    }

    curevent = NULL;

    if (gli_debugger)
        gidebug_announce_cycle(gidebug_cycle_InputAccept);
}

void glk_select_poll(event_t *event)
{
    curevent = event;

    /* We can only sensibly check for unfired timer events. */
    /* ### This is not consistent with the modern understanding that
       the display layer handles timer events. Might want to just rip
       all this timing code out entirely. */
    if (timing_msec) {
        glsi32 time = gli_timer_request_since_start();
        if (time >= 0 && time >= timing_msec) {
            gettimeofday(&timing_start, NULL);
            /* Resend timer request at next update. */
            last_timing_msec = 0;
            /* Call it a timer event. */
            curevent->type = evtype_Timer;
        }
    }

    curevent = NULL;
}

/* Convert an array of Unicode chars to (null-terminated) UTF-8.
   The caller should free this after use.
*/
static char *alloc_utf_buffer(glui32 *ustr, int ulen)
{
    /* We do this in a lazy way; we alloc the largest possible buffer. */
    int len = 4*ulen+4;
    char *buf = malloc(len);
    if (!buf)
        return NULL;

    char *ptr = buf;
    int ix = 0;
    int cx = 0;
    while (cx < ulen) {
        ix += gli_encode_utf8(ustr[cx], ptr+ix, len-ix);
        cx++;
    }

    *(ptr+ix) = '\0';
    return buf;
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

/* Various modules can call this to indicate that an event has occurred.
    This doesn't try to queue events, but since a single keystroke or
    idle event can only cause one event at most, this is fine. */
void gli_event_store(glui32 type, window_t *win, glui32 val1, glui32 val2)
{
    if (curevent) {
        curevent->type = type;
        curevent->win = win;
        curevent->val1 = val1;
        curevent->val2 = val2;
    }
}

void glk_request_timer_events(glui32 millisecs)
{
    if (!pref_timersupport)
        return;
    timing_msec = millisecs;
    gettimeofday(&timing_start, NULL);
}

/* Return whether the timer request has changed since the last call.
   If so, also return the request value as *msec. */
int gli_timer_need_update(glui32 *msec)
{
    if (last_timing_msec != timing_msec) {
        *msec = timing_msec;
        last_timing_msec = timing_msec;
        return TRUE;
    }
    else {
        *msec = 0;
        return FALSE;
    }
}

/* Work out how many milliseconds it has been since timing_start.
   If there is no timer, returns -1. */
static glsi32 gli_timer_request_since_start()
{
    struct timeval tv;

    if (!pref_timersupport)
        return -1;
    if (!timing_msec)
        return -1;

    gettimeofday(&tv, NULL);

    if (tv.tv_sec < timing_start.tv_sec) {
        return 0;
    }
    else if (tv.tv_sec == timing_start.tv_sec) {
        if (tv.tv_usec < timing_start.tv_usec)
            return 0;
        return (tv.tv_usec - timing_start.tv_usec) / 1000;
    }
    else {
        glsi32 res = (tv.tv_sec - timing_start.tv_sec) * 1000;
        res += ((tv.tv_usec - timing_start.tv_usec) / 1000);
        return res;
    }
}
