#ifndef EMGLKEN_H
#define EMGLKEN_H

/* emglken.h: Private header file for the Emglken library
    Emglken Library: version 0.1.0.
    Glk API which this implements: version 0.7.5.
    Originally designed by Andrew Plotkin <erkyrath@eblong.com>
	Adapted by Dannii Willis <curiousdannii@gmail.com>
    https://github.com/curiousdannii/emglken
*/

#define LIBRARY_VERSION "0.1.0"

#include "../cheapglk/gi_dispa.h"
#include "../cheapglk/gi_debug.h"

/* First, we define our own TRUE and FALSE and NULL, because ANSI
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
    (printf("Glk library error: %s\n", msg)) 

#if GIDEBUG_LIBRARY_SUPPORT
/* Has the user requested debug support? */
extern int gli_debugger;
#else /* GIDEBUG_LIBRARY_SUPPORT */
#define gli_debugger (0)
#endif /* GIDEBUG_LIBRARY_SUPPORT */

/* Callbacks necessary for the dispatch layer. */
extern gidispatch_rock_t (*gli_register_obj)(void *obj, glui32 objclass);
extern void (*gli_unregister_obj)(void *obj, glui32 objclass, 
    gidispatch_rock_t objrock);
extern gidispatch_rock_t (*gli_register_arr)(void *array, glui32 len, 
    char *typecode);
extern void (*gli_unregister_arr)(void *array, glui32 len, char *typecode, 
    gidispatch_rock_t objrock);

/* Some useful type declarations. */

typedef struct glk_window_struct window_t;
typedef struct glk_stream_struct stream_t;
typedef struct glk_fileref_struct fileref_t;

#define MAGIC_WINDOW_NUM (9876)
#define MAGIC_STREAM_NUM (8769)
#define MAGIC_FILEREF_NUM (7698)

struct glk_window_struct {
    gidispatch_rock_t disprock;
};

#define strtype_File (1)
#define strtype_Window (2)
#define strtype_Memory (3)
#define strtype_Resource (4)

struct glk_stream_struct {
    gidispatch_rock_t disprock;
};

struct glk_fileref_struct {
    gidispatch_rock_t disprock;
};

#endif /* EMGLKEN_H */