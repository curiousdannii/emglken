// Main header for git
// $Id: git.h,v 1.32 2004/12/22 12:40:07 iain Exp $

#ifndef EMGITEN_H
#define EMGITEN_H

#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include "glk.h"
#include "emglken.h"
#include "git.h"

extern void emgiten (const git_uint8 * game,
    git_uint32 gameSize,
    git_uint32 cacheSize,
    git_uint32 undoSize);

extern float git_powf(float x, float y);

#endif // EMGITEN_H