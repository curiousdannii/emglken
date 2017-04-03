/* rgwin_pair.c: The pair window type
        for RemGlk, remote-procedure-call implementation of the Glk API.
    Designed by Andrew Plotkin <erkyrath@eblong.com>
    http://eblong.com/zarf/glk/
*/

#include <stdio.h>
#include <stdlib.h>
#include "glk.h"
#include "emglken.h"
#include "rgwin_pair.h"

window_pair_t *win_pair_create(window_t *win, glui32 method, window_t *key, 
    glui32 size)
{
    window_pair_t *dwin = (window_pair_t *)malloc(sizeof(window_pair_t));
    dwin->owner = win;
    
    dwin->dir = method & winmethod_DirMask; 
    dwin->division = method & winmethod_DivisionMask;
    dwin->hasborder = ((method & winmethod_BorderMask) == winmethod_Border);
    dwin->key = key;
    dwin->keydamage = FALSE;
    dwin->size = size;
    
    dwin->vertical = (dwin->dir == winmethod_Left || dwin->dir == winmethod_Right);
    dwin->backward = (dwin->dir == winmethod_Left || dwin->dir == winmethod_Above);
    
    dwin->child1 = NULL;
    dwin->child2 = NULL;
    
    return dwin;
}

void win_pair_destroy(window_pair_t *dwin)
{
    dwin->owner = NULL;
    /* We leave the children untouched, because gli_window_close takes care
        of that if it's desired. */
    dwin->child1 = NULL;
    dwin->child2 = NULL;
    dwin->key = NULL;
    free(dwin);
}