/* gtfref.c: File reference objects
        for RemGlk, remote-procedure-call implementation of the Glk API.
    Designed by Andrew Plotkin <erkyrath@eblong.com>
    http://eblong.com/zarf/glk/
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h> /* for unlink() */
#include <sys/stat.h> /* for stat() */

#include "glk.h"
#include "gi_dispa.h"
#include "emglken.h"

/* This code implements filerefs as they work in a stdio system: a
    fileref contains a pathname, a text/binary flag, and a file
    type.
*/

/* Linked list of all filerefs */
static fileref_t *gli_filereflist = NULL; 

#define BUFLEN (256)

static char workingdir[BUFLEN] = ".";

fileref_t *gli_new_fileref(glui32 usage, glui32 rock)
{
    fileref_t *fref = (fileref_t *)malloc(sizeof(fileref_t));
    if (!fref)
        return NULL;
    
    fref->rock = rock;
    
    fref->prev = NULL;
    fref->next = gli_filereflist;
    gli_filereflist = fref;
    if (fref->next) {
        fref->next->prev = fref;
    }
    
    if (gli_register_obj)
        fref->disprock = (*gli_register_obj)(fref, gidisp_Class_Fileref);

    return fref;
}

void gli_delete_fileref(fileref_t *fref)
{
    fileref_t *prev, *next;
    
    if (gli_unregister_obj)
        (*gli_unregister_obj)(fref, gidisp_Class_Fileref, fref->disprock);
    
    prev = fref->prev;
    next = fref->next;
    fref->prev = NULL;
    fref->next = NULL;

    if (prev)
        prev->next = next;
    else
        gli_filereflist = next;
    if (next)
        next->prev = prev;
    
    glem_fileref_destroy( fref->tag );
    free(fref);
}

void glk_fileref_destroy(fileref_t *fref)
{
    if (!fref) {
        gli_strict_warning("fileref_destroy: invalid ref");
        return;
    }
    gli_delete_fileref(fref);
}

frefid_t glk_fileref_create_temp(glui32 usage, glui32 rock)
{
    fileref_t *fref;
    
    fref = gli_new_fileref(usage, rock);
    if (!fref) {
        gli_strict_warning("fileref_create_temp: unable to create fileref.");
        return NULL;
    }
    
    fref->tag = glem_fileref_create_temp( usage, rock );

    return fref;
}

frefid_t glk_fileref_create_from_fileref(glui32 usage, frefid_t oldfref,
    glui32 rock)
{
    fileref_t *fref; 

    if (!oldfref) {
        gli_strict_warning("fileref_create_from_fileref: invalid ref");
        return NULL;
    }

    fref = gli_new_fileref(usage, rock);
    if (!fref) {
        gli_strict_warning("fileref_create_from_fileref: unable to create fileref.");
        return NULL;
    }
    
    fref->tag = glem_fileref_create_from_fileref( usage, oldfref->tag, rock );

    return fref;
}

frefid_t glk_fileref_create_by_name(glui32 usage, char *name,
    glui32 rock)
{
    fileref_t *fref;

    fref = gli_new_fileref(usage, rock);
    if (!fref) {
        gli_strict_warning("fileref_create_by_name: unable to create fileref.");
        return NULL;
    }
    
    fref->tag = glem_fileref_create_by_name( usage, name, rock );

    return fref;
}

frefid_t glk_fileref_create_by_prompt(glui32 usage, glui32 fmode,
    glui32 rock)
{
    fileref_t *fref;
    glui32 tag;
    
    glem_fileref_create_by_prompt( usage, fmode, rock, &tag );
    fref = gli_new_fileref(usage, rock);
    if ( !fref || !tag )
    {
        gli_strict_warning("fileref_create_by_prompt: unable to create fileref.");
        return NULL;
    }
    fref->tag = tag;
    
    return fref;
}

frefid_t glk_fileref_iterate(fileref_t *fref, glui32 *rock)
{
    if (!fref) {
        fref = gli_filereflist;
    }
    else {
        fref = fref->next;
    }
    
    if (fref) {
        if (rock)
            *rock = fref->rock;
        return fref;
    }
    
    if (rock)
        *rock = 0;
    return NULL;
}

glui32 glk_fileref_get_rock(fileref_t *fref)
{
    if (!fref) {
        gli_strict_warning("fileref_get_rock: invalid ref.");
        return 0;
    }
    
    return fref->rock;
}