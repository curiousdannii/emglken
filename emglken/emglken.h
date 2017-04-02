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

#define grect_set_from_size(boxref, wid, hgt)   \
    ((boxref)->left = 0, (boxref)->top = 0,     \
     (boxref)->right = (wid), (boxref)->bottom = (hgt))

typedef struct glk_window_struct window_t;
typedef struct glk_stream_struct stream_t;
typedef struct glk_fileref_struct fileref_t;

#define MAGIC_WINDOW_NUM (9826)
#define MAGIC_STREAM_NUM (8269)
#define MAGIC_FILEREF_NUM (6982)

struct glk_window_struct {
    glui32 magicnum;
    glui32 rock;
    glui32 type;
    glui32 updatetag; /* numeric tag for the window in output */
    
    window_t *parent; /* pair window which contains this one */
    void *data; /* one of the window_*_t structures */
    
    stream_t *str; /* the window stream. */
    stream_t *echostr; /* the window's echo stream, if any. */

    glui32 inputgen;    
    int line_request;
    int line_request_uni;
    int char_request;
    int char_request_uni;

    glui32 style;
    glui32 hyperlink;
    
    gidispatch_rock_t disprock;
    window_t *next, *prev; /* in the big linked list of windows */
};

#define strtype_File (1)
#define strtype_Window (2)
#define strtype_Memory (3)
#define strtype_Resource (4)

struct glk_stream_struct {
    glui32 magicnum;
    glui32 rock;
    glui32 tag;

    int type; /* file, window, or memory stream */
    int unicode; /* one-byte or four-byte chars? Not meaningful for windows */
    
    glui32 readcount, writecount;
    int readable, writable;
    
    /* for strtype_Window */
    window_t *win;
    
    /* for strtype_File */
    glui32 lastop; /* 0, filemode_Write, or filemode_Read */
    
    /* for strtype_Resource */
    int isbinary;

    /* for strtype_Memory and strtype_Resource. Separate pointers for 
       one-byte and four-byte streams */
    unsigned char *buf;
    unsigned char *bufptr;
    unsigned char *bufend;
    unsigned char *bufeof;
    glui32 *ubuf;
    glui32 *ubufptr;
    glui32 *ubufend;
    glui32 *ubufeof;
    glui32 buflen;
    gidispatch_rock_t arrayrock;

    gidispatch_rock_t disprock;
    stream_t *next, *prev; /* in the big linked list of streams */
};

struct glk_fileref_struct {
    glui32 magicnum;
    glui32 rock;
    glui32 tag;

    char *filename;
    int filetype;
    int textmode;

    gidispatch_rock_t disprock;
    fileref_t *next, *prev; /* in the big linked list of filerefs */
};

/* A few global variables */

extern window_t *gli_rootwin;
extern window_t *gli_focuswin;
extern void (*gli_interrupt_handler)(void);

/* The following typedefs are copied from cheapglk.h. They support the
   tables declared in cgunigen.c. */

typedef glui32 gli_case_block_t[2]; /* upper, lower */
/* If both are 0xFFFFFFFF, you have to look at the special-case table */

typedef glui32 gli_case_special_t[3]; /* upper, lower, title */
/* Each of these points to a subarray of the unigen_special_array
   (in cgunicode.c). In that subarray, element zero is the length,
   and that's followed by length unicode values. */

typedef glui32 gli_decomp_block_t[2]; /* count, position */
/* The position points to a subarray of the unigen_decomp_array.
   If the count is zero, there is no decomposition. */


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

extern void gli_msgline_warning(char *msg);
extern void gli_msgline_error(char *msg);
extern void gli_msgline(char *msg);
extern void gli_msgline_redraw(void);

extern int gli_msgin_getline(char *prompt, char *buf, int maxlen, int *length);
extern int gli_msgin_getchar(char *prompt, int hilite);

extern void gli_putchar_utf8(glui32 val, FILE *fl);
extern glui32 gli_parse_utf8(unsigned char *buf, glui32 buflen,
    glui32 *out, glui32 outlen);
extern int gli_encode_utf8(glui32 val, char *buf, int len);

extern void gli_initialize_events(void);
extern void gli_event_store(glui32 type, window_t *win, glui32 val1, glui32 val2);
extern int gli_timer_need_update(glui32 *msec);

extern void gli_initialize_windows(/*data_metrics_t *metrics*/);
extern void gli_fast_exit(void);
extern void gli_display_warning(char *msg);
extern void gli_display_error(char *msg);
extern glui32 gli_window_current_generation(void);
extern window_t *gli_window_find_by_tag(glui32 tag);
extern window_t *gli_new_window(glui32 type, glui32 rock, glui32 windowtag);
extern void gli_delete_window(window_t *win);
extern window_t *gli_window_iterate_treeorder(window_t *win);
//extern void gli_window_rearrange(window_t *win, grect_t *box, data_metrics_t *metrics);
//extern void gli_windows_update(data_specialreq_t *special, int newgeneration);
extern void gli_windows_refresh(glui32 fromgen);
//extern void gli_windows_metrics_change(data_metrics_t *newmetrics);
extern void gli_windows_trim_buffers(void);
extern void gli_window_put_char(window_t *win, glui32 ch);
extern void gli_windows_unechostream(stream_t *str);
extern void gli_window_prepare_input(window_t *win, glui32 *buf, glui32 len);
extern void gli_window_accept_line(window_t *win, glui32 len);
extern void gli_print_spaces(int len);

extern void gcmd_win_change_focus(window_t *win, glui32 arg);
extern void gcmd_win_refresh(window_t *win, glui32 arg);

extern stream_t *gli_new_stream(int type, int readable, int writable, 
    glui32 rock);
extern void gli_delete_stream(stream_t *str);
extern stream_t *gli_stream_open_window(window_t *win);
extern strid_t gli_stream_open_pathname(char *pathname, int writemode, 
    int textmode, glui32 rock);
extern void gli_stream_set_current(stream_t *str);
extern void gli_stream_fill_result(stream_t *str, 
    stream_result_t *result);
extern void gli_stream_echo_line(stream_t *str, char *buf, glui32 len);
extern void gli_stream_echo_line_uni(stream_t *str, glui32 *buf, glui32 len);
extern void gli_streams_close_all(void);

extern fileref_t *gli_new_fileref(char *filename, glui32 usage, 
    glui32 rock);
extern void gli_delete_fileref(fileref_t *fref);

/* Functions implemented in library.js */

extern void glem_cancel_char_event(glui32 wintag);
extern void glem_cancel_hyperlink_event(glui32 wintag);
extern void glem_cancel_line_event(glui32 wintag);
extern void glem_cancel_mouse_event(glui32 wintag);
extern void glem_exit();
extern void glem_fatal_error(char *msg);
extern glui32 glem_fileref_create_by_name(glui32 usage, char *name, glui32 rock);
extern void glem_fileref_create_by_prompt(glui32 usage, glui32 fmode, glui32 rock, glui32 *tagptr);
extern glui32 glem_fileref_create_from_fileref(glui32 usage, glui32 oldtag, glui32 rock);
extern glui32 glem_fileref_create_temp(glui32 usage, glui32 rock);
extern void glem_fileref_delete_file(glui32 tag);
extern void glem_fileref_destroy(glui32 tag);
extern glui32 glem_fileref_does_file_exist(glui32 tag);
extern glui32 glem_get_buffer_stream(glui32 tag, void *buf, glui32 len, int unicode);
extern glsi32 glem_get_char_stream(glui32 tag, int unicode);
extern glui32 glem_get_line_stream(glui32 tag, void *buf, glui32 len, int unicode);
extern glui32 glem_get_window_stream_tag(glui32 wintag);
extern glui32 glem_image_draw(glui32 win, glui32 image, glsi32 val1, glsi32 val2);
extern glui32 glem_image_draw_scaled(glui32 win, glui32 image, glsi32 val1, glsi32 val2, glui32 width, glui32 height);
extern glui32 glem_new_window(glui32 split, glui32 method, glui32 size, glui32 wintype, glui32 rock, glui32 *pairwintag);
extern void glem_put_buffer_stream(glui32 str, void *buf, glui32 len, int unicode);
extern void glem_put_char_stream_uni(glui32 str, glui32 ch);
extern void glem_request_char_event(glui32 wintag, int unicode);
extern void glem_request_hyperlink_event(glui32 tag);
extern void glem_request_line_event(glui32 wintag, void *buf, glui32 maxlen, glui32 initlen, int unicode);
extern void glem_request_mouse_event(glui32 tag);
extern void glem_select(glui32 *data);
extern void glem_set_echo_line_event(glui32 tag, glui32 val);
extern void glem_set_hyperlink_stream(glui32 tag, glui32 linkval);
extern void glem_set_style_stream(glui32 tag, glui32 style);
extern void glem_set_terminators_line_event(glui32 tag, glui32 *keycodes, glui32 count);
extern void glem_stream_close(glui32 tag);
extern glui32 glem_stream_get_position(glui32 tag);
extern glui32 glem_stream_open_file(glui32 tag, glui32 fmode, glui32 rock, int unicode);
extern glui32 glem_stream_open_resource(glui32 filenum, glui32 rock, int unicode);
extern void glem_stream_set_current(glui32 tag);
extern void glem_stream_set_position(glui32 tag, glsi32 pos, glui32 seekmode);
extern void glem_window_clear(glui32 wintag);
extern void glem_window_close(glui32 wintag);
extern void glem_window_erase_rect(glui32 wintag, glsi32 left, glsi32 top, glui32 width, glui32 height);
extern void glem_window_fill_rect(glui32 wintag, glui32 color, glsi32 left, glsi32 top, glui32 width, glui32 height);
extern void glem_window_flow_break(glui32 wintag);
extern void glem_window_get_arrangement(glui32 wintag, glui32 *methodptr, glui32 *sizeptr, glui32 *keywinptr);
extern void glem_window_get_size(glui32 wintag, glui32 *widthptr, glui32 *heightptr);
extern void glem_window_move_cursor(glui32 wintag, glui32 xpos, glui32 ypos);
extern void glem_window_set_arrangement(glui32 wintag, glui32 method, glui32 size, glui32 keywintag);
extern void glem_window_set_background_color(glui32 wintag, glui32 color);
extern void init_emglken();


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
