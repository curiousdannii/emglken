/* emglken.h: Private header file for Emglken
    Designed by Andrew Plotkin <erkyrath@eblong.com>
    http://eblong.com/zarf/glk/
*/

#ifndef EMGLKEN_H
#define EMGLKEN_H

#include "gi_dispa.h"
#include "gi_debug.h"

#define LIBRARY_VERSION "0.1.0"

/* We define our own TRUE and FALSE and NULL, because ANSI
    is a strange world. */
#ifndef TRUE
#define TRUE 1
#endif
#ifndef FALSE
#define FALSE 0
#endif
#ifndef NULL
#define NULL 0
#endif

/* This macro is called whenever the library code catches an error
    or illegal operation from the game program. */

#define gli_strict_warning(msg)   \
    (glem_fatal_error(msg))

#define gli_fatal_error(msg)   \
    (glem_fatal_error(msg))

/* Some useful type declarations. */

typedef struct glk_window_struct window_t;
typedef struct glk_stream_struct stream_t;
typedef struct glk_fileref_struct fileref_t;

#define MAGIC_WINDOW_NUM (9826)
#define MAGIC_STREAM_NUM (8269)
#define MAGIC_FILEREF_NUM (6982)

struct glk_window_struct {
    glui32 updatetag; /* numeric tag for the window in output */
    glui32 rock;

    glui32 type;

    // Window relationships
    window_t *parent; /* pair window which contains this one */
    window_t *child1, *child2; /* for pair windows only */
    
    stream_t *str; /* the window stream. */

    // Needed for retaining line input arrays
    int line_request;
    int unicode; /* one-byte or four-byte chars? Not meaningful for windows */
    void *buf;
    glui32 buflen;
    glui32 incurpos;
    gidispatch_rock_t arrayrock;
    
    gidispatch_rock_t disprock;
    window_t *next, *prev; /* in the big linked list of windows */
};

#define strtype_File (1)
#define strtype_Window (2)
#define strtype_Memory (3)
#define strtype_Resource (4)

struct glk_stream_struct {
    glui32 tag;
    glui32 rock;

    int type; /* file, window, or memory stream */

    // Needed for retaining arrays for memory streams
    int unicode; /* one-byte or four-byte chars? Not meaningful for windows */
    void *buf;
    glui32 buflen;
    gidispatch_rock_t arrayrock;

    gidispatch_rock_t disprock;
    stream_t *next, *prev; /* in the big linked list of streams */
};

struct glk_fileref_struct {
    glui32 tag;
    glui32 rock;

    gidispatch_rock_t disprock;
    fileref_t *next, *prev; /* in the big linked list of filerefs */
};

/* A few global variables */

extern window_t *gli_rootwin;
extern window_t *gli_focuswin;
extern void (*gli_interrupt_handler)(void);

extern gidispatch_rock_t (*gli_register_obj)(void *obj, glui32 objclass);
extern void (*gli_unregister_obj)(void *obj, glui32 objclass, gidispatch_rock_t objrock);
extern gidispatch_rock_t (*gli_register_arr)(void *array, glui32 len, char *typecode);
extern void (*gli_unregister_arr)(void *array, glui32 len, char *typecode, 
    gidispatch_rock_t objrock);

#if GIDEBUG_LIBRARY_SUPPORT
/* Has the user requested debug support? */
extern int gli_debugger;
#else /* GIDEBUG_LIBRARY_SUPPORT */
#define gli_debugger (0)
#endif /* GIDEBUG_LIBRARY_SUPPORT */

/* Declarations of library internal functions. */

extern void gli_initialize_misc(void);

extern void gli_initialize_events(void);
extern void gli_event_store(glui32 type, window_t *win, glui32 val1, glui32 val2);
extern int gli_timer_need_update(glui32 *msec);

extern void gli_initialize_windows(void);
extern void gli_fast_exit(void);
extern void gli_display_warning(char *msg);
extern void gli_display_error(char *msg);
extern window_t *gli_window_find_by_tag(glui32 tag);
extern window_t *gli_new_window(glui32 type, glui32 rock, glui32 windowtag);
extern void gli_delete_window(window_t *win);
extern void gli_window_accept_line(window_t *win, glui32 len);

extern stream_t *gli_new_stream(int type, glui32 tag, glui32 rock);
extern void gli_delete_stream(stream_t *str);
extern void gli_stream_set_current(stream_t *str);
extern void gli_streams_close_all(void);
extern stream_t *gli_stream_find_by_tag(glui32 tag);

extern fileref_t *gli_new_fileref(glui32 tag, glui32 rock);
extern void gli_delete_fileref(fileref_t *fref);

/* Functions implemented in library.js */

extern void glem_cancel_line_event(glui32 wintag, glui32 *evdata);
extern void glem_exit(void);
extern void glem_fatal_error(char *msg);
extern glui32 glem_fileref_create_by_name(glui32 usage, char *name, glui32 rock);
extern void glem_fileref_create_by_prompt(glui32 usage, glui32 fmode, glui32 rock, glui32 *tagptr);
extern glui32 glem_fileref_create_from_fileref(glui32 usage, glui32 oldtag, glui32 rock);
extern glui32 glem_fileref_create_temp(glui32 usage, glui32 rock);
extern void glem_fileref_destroy(glui32 tag);
extern glui32 glem_get_window_echostream_tag(glui32 wintag);
extern glui32 glem_new_window(glui32 split, glui32 method, glui32 size, glui32 wintype, glui32 rock, glui32 *strtagptr, glui32 *pairwintag);
extern void glem_request_line_event(glui32 wintag, void *buf, glui32 maxlen, glui32 initlen, int unicode);
extern void glem_select(glui32 *evdata);
extern void glem_stream_finalise(glui32 tag, stream_result_t *result, int close);
extern glui32 glem_stream_open_file(glui32 tag, glui32 fmode, glui32 rock, int unicode);
extern glui32 glem_stream_open_memory(void *buf, glui32 buflen, glui32 fmode, glui32 rock, int unicode);
extern glui32 glem_stream_open_resource(glui32 filenum, glui32 rock, int unicode);
extern void glem_stream_set_current(glui32 tag);
extern void glem_window_close(glui32 wintag);
extern void glem_window_get_arrangement(glui32 wintag, glui32 *methodptr, glui32 *sizeptr, glui32 *keywinptr);
extern void init_emglken(void);


/* A macro that I can't think of anywhere else to put it. */

#define gli_event_clearevent(evp)  \
    ((evp)->type = evtype_None,    \
    (evp)->win = NULL,    \
    (evp)->val1 = 0,   \
    (evp)->val2 = 0)

/* A macro which reads and decodes one character of UTF-8. Needs no
   explanation, I'm sure.

   Oh, okay. The character will be written to *chptr (so pass in "&ch",
   where ch is a glui32 variable). eofcond should be a condition to
   evaluate end-of-stream -- true if no more characters are readable.
   nextch is a function which reads the next character; this is invoked
   exactly as many times as necessary.

   val0, val1, val2, val3 should be glui32 scratch variables. The macro
   needs these. Just define them, you don't need to pay attention to them
   otherwise.

   The macro itself evaluates to true if ch was successfully set, or
   false if something went wrong. (Not enough characters, or an
   invalid byte sequence.)

   This is not the worst macro I've ever written, but I forget what the
   other one was.
*/

#define UTF8_DECODE_INLINE(chptr, eofcond, nextch, val0, val1, val2, val3)  ( \
    (eofcond ? 0 : ( \
        (((val0=nextch) < 0x80) ? (*chptr=val0, 1) : ( \
            (eofcond ? 0 : ( \
                (((val1=nextch) & 0xC0) != 0x80) ? 0 : ( \
                    (((val0 & 0xE0) == 0xC0) ? (*chptr=((val0 & 0x1F) << 6) | (val1 & 0x3F), 1) : ( \
                        (eofcond ? 0 : ( \
                            (((val2=nextch) & 0xC0) != 0x80) ? 0 : ( \
                                (((val0 & 0xF0) == 0xE0) ? (*chptr=(((val0 & 0xF)<<12)  & 0x0000F000) | (((val1 & 0x3F)<<6) & 0x00000FC0) | (((val2 & 0x3F))    & 0x0000003F), 1) : ( \
                                    (((val0 & 0xF0) != 0xF0 || eofcond) ? 0 : (\
                                        (((val3=nextch) & 0xC0) != 0x80) ? 0 : (*chptr=(((val0 & 0x7)<<18)   & 0x1C0000) | (((val1 & 0x3F)<<12) & 0x03F000) | (((val2 & 0x3F)<<6)  & 0x000FC0) | (((val3 & 0x3F))     & 0x00003F), 1) \
                                        )) \
                                    )) \
                                )) \
                            )) \
                        )) \
                )) \
            )) \
        )) \
    )

#ifdef NO_MEMMOVE
    extern void *memmove(void *dest, void *src, int n);
#endif /* NO_MEMMOVE */

#endif /* EMGLKEN_H */
