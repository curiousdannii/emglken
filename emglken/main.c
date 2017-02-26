/* main.c: Top-level source file
        for RemGlk, remote-procedure-call implementation of the Glk API.
    Glk API which this implements: version 0.7.5.
    Designed by Andrew Plotkin <erkyrath@eblong.com>
    http://eblong.com/zarf/glk/
*/

#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "glk.h"
#include "emglken.h"
#include "glkstart.h"

/* Declarations of preferences flags. */
int pref_printversion = FALSE;
int pref_stderr = FALSE;
int pref_fixedmetrics = FALSE;
int pref_screenwidth = 80;
int pref_screenheight = 50;
int pref_timersupport = FALSE;
int pref_hyperlinksupport = FALSE;
int pref_graphicssupport = FALSE;
int pref_graphicswinsupport = FALSE;
char *pref_resourceurl = NULL;
#if GIDEBUG_LIBRARY_SUPPORT
int gli_debugger = FALSE;
#endif /* GIDEBUG_LIBRARY_SUPPORT */

/* Some constants for my wacky little command-line option parser. */
#define ex_Void (0)
#define ex_Int (1)
#define ex_Bool (2)
#define ex_Str (3)

static int errflag = FALSE;
static int inittime = FALSE;

static int extract_value(int argc, char *argv[], char *optname, int type,
    int *argnum, int *result, int defval);
static int string_to_bool(char *str);
static char *construct_resourceurl(char *str, int ispath);

#define STRBUFLEN (512)
static char extracted_string[STRBUFLEN];

void init_emglken()
{
    int ix, jx, val;
    glkunix_startup_t startdata;
    
    /* Test for compile-time errors. If one of these spouts off, you
        must edit glk.h and recompile. */
    if (sizeof(glui32) != 4) {
        printf("Compile-time error: glui32 is not a 32-bit value. Please fix glk.h.\n");
        glk_exit();
    }
    if ((glui32)(-1) < 0) {
        printf("Compile-time error: glui32 is not unsigned. Please fix glk.h.\n");
        glk_exit();
    }
    
    /* Initialize things. */
    gli_initialize_misc();
    gli_initialize_windows(/*metrics*/);
    gli_initialize_events();

    //inittime = TRUE;
    //if (!glkunix_startup_code(&startdata)) {
    //    glk_exit();
    //}
    //inittime = FALSE;

    if (gli_debugger)
        gidebug_announce_cycle(gidebug_cycle_Start);
}

/* Given a path or URL (taken from the resourcedir/resourceurl argument),
   return a (malloced) string containing a URL form. If ispath is
   true, the path is absolutized and turned into a file: URL. */
static char *construct_resourceurl(char *str, int ispath)
{
    char *res = NULL;

    if (!ispath) {
        /* We don't append a slash here, because maybe the user wants
           URLs like http://foo/prefix-pict-1.png. */
        res = malloc(strlen(str) + 1);
        if (!res)
            return NULL;
        strcpy(res, str);
    }
    else {
        /* This assumes Unix-style pathnames. Sorry. */
        char prefix[STRBUFLEN];
        prefix[0] = '\0';
        int len = strlen(str);
        int preslash = FALSE;
        if (len && str[0] != '/') {
            getcwd(prefix, STRBUFLEN);
            preslash = TRUE;
        }
        int postslash = FALSE;
        if (len && str[len-1] != '/')
            postslash = TRUE;
        res = malloc(16 + strlen(prefix) + len + 1);
        if (!res)
            return NULL;
        sprintf(res, "file://%s%s%s%s", prefix, (preslash?"/":""), str, (postslash?"/":""));
    }

    return res;
}

/* This opens a file for reading or writing. (You cannot open a file
   for appending using this call.)

   This should be used only by glkunix_startup_code(). 
*/
strid_t glkunix_stream_open_pathname_gen(char *pathname, glui32 writemode,
    glui32 textmode, glui32 rock)
{
    if (!inittime)
        return 0;
    return gli_stream_open_pathname(pathname, (writemode != 0), (textmode != 0), rock);
}

/* This opens a file for reading. It is a less-general form of 
   glkunix_stream_open_pathname_gen(), preserved for backwards 
   compatibility.

   This should be used only by glkunix_startup_code().
*/
strid_t glkunix_stream_open_pathname(char *pathname, glui32 textmode, 
    glui32 rock)
{
    if (!inittime)
        return 0;
    return gli_stream_open_pathname(pathname, FALSE, (textmode != 0), rock);
}
