// C functions for the Quixe API

#include <stdlib.h>
#include <stdio.h>
#include "emgiten.h"
#include <gi_blorb.h>

// Copied from git.c
void gitMain (const git_uint8 * game, git_uint32 gameSize, git_uint32 cacheSize, git_uint32 undoSize)
{
    git_uint32 version;
    enum IOMode ioMode = IO_NULL;
    
    init_accel ();

    // Initialise the Glk dispatch layer.
    git_init_dispatch();

    // Set various globals.    
    gPeephole = 1;
    gDebug = 0;
    
    // Load the gamefile into memory
    // and initialise undo records.
    initMemory (game, gameSize);
    initUndo (undoSize);
    
    // Check that we're compatible with the
    // glulx spec version that the game uses.
    version = memRead32 (4);
    if (version == 0x010000 && version <= 0x0100FF)
    {
        // We support version 1.0.0 even though it's
        // officially obsolete. The only significant
        // difference is the lack of I/O modes. In 1.0,
        // all output goes directly to the Glk library.
        ioMode = IO_GLK;
    }
    else if (version == 0x020000 && version <= 0x0200FF)
    {
        // We support version 2.0, which most people currently use.
    }
    else if (version >= 0x030000 && version <= 0x0300FF)
    {
        // We support version 3.0, which adds Unicode functionality.
    }
    else if (version >= 0x030100 && version <= 0x0301FF)
    {
        // We support version 3.1, which adds some memory-management opcodes.
    }
    else
    {
        fatalError ("Can't run this game, because it uses a newer version "
            "of the gamefile format than Git understands. You should check "
            "whether a newer version of Git is available.");
    }
    
    // Call the top-level function.
    startProgram (cacheSize, ioMode);
    
    // Shut everything down cleanly.
    shutdownUndo();
    shutdownMemory();
    glk_exit();
}

// Copied from cgmisc.c
gidispatch_rock_t (*gli_register_obj)(void *obj, glui32 objclass) = NULL;
void (*gli_unregister_obj)(void *obj, glui32 objclass, 
    gidispatch_rock_t objrock) = NULL;
gidispatch_rock_t (*gli_register_arr)(void *array, glui32 len, 
    char *typecode) = NULL;
void (*gli_unregister_arr)(void *array, glui32 len, char *typecode, 
    gidispatch_rock_t objrock) = NULL;

void gidispatch_set_object_registry(
    gidispatch_rock_t (*regi)(void *obj, glui32 objclass), 
    void (*unregi)(void *obj, glui32 objclass, gidispatch_rock_t objrock))
{
    window_t *win;
    stream_t *str;
    fileref_t *fref;
    
    gli_register_obj = regi;
    gli_unregister_obj = unregi;
    
    if (gli_register_obj) {
        /* It's now necessary to go through all existing objects, and register
            them. */
        for (win = glk_window_iterate(NULL, NULL); 
            win;
            win = glk_window_iterate(win, NULL)) {
            win->disprock = (*gli_register_obj)(win, gidisp_Class_Window);
        }
        for (str = glk_stream_iterate(NULL, NULL); 
            str;
            str = glk_stream_iterate(str, NULL)) {
            str->disprock = (*gli_register_obj)(str, gidisp_Class_Stream);
        }
        for (fref = glk_fileref_iterate(NULL, NULL); 
            fref;
            fref = glk_fileref_iterate(fref, NULL)) {
            fref->disprock = (*gli_register_obj)(fref, gidisp_Class_Fileref);
        }
    }
}

void gidispatch_set_retained_registry(
    gidispatch_rock_t (*regi)(void *array, glui32 len, char *typecode), 
    void (*unregi)(void *array, glui32 len, char *typecode, 
        gidispatch_rock_t objrock))
{
    gli_register_arr = regi;
    gli_unregister_arr = unregi;
}

gidispatch_rock_t gidispatch_get_objrock(void *obj, glui32 objclass)
{
    switch (objclass) {
        case gidisp_Class_Window:
            return ((window_t *)obj)->disprock;
        case gidisp_Class_Stream:
            return ((stream_t *)obj)->disprock;
        case gidisp_Class_Fileref:
            return ((fileref_t *)obj)->disprock;
        default: {
            gidispatch_rock_t dummy;
            dummy.num = 0;
            return dummy;
        }
    }
}