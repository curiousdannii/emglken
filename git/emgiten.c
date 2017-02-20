// C functions for the Quixe API

#include "emgiten.h"
#include <gi_blorb.h>
#include <stdlib.h>
#include <stdio.h>

enum IOMode ioMode = IO_NULL;

void gitPrepare (const git_uint8 * game, git_uint32 gameSize, git_uint32 cacheSize, git_uint32 undoSize)
{
    git_uint32 version;
    
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
}

void callStartProgram (git_uint32 cacheSize)
{
    // Call the top-level function.
    startProgram (cacheSize, ioMode);
}