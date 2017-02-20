// Main header for git
// $Id: git.h,v 1.32 2004/12/22 12:40:07 iain Exp $

#ifndef EMGITEN_H
#define EMGITEN_H

#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <glk.h>
#include "git.h"

// emgiten.c

extern void gitPrepare (const git_uint8 * game,
    git_uint32 gameSize,
    git_uint32 cacheSize,
    git_uint32 undoSize);  

extern void callStartProgram (const git_uint32 cacheSize);

#endif // EMGITEN_H