// Main header for Glulxe

#ifndef EMGLULXEEN_H
#define EMGLULXEEN_H

#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include "glk.h"
#include "emglken.h"
#include "glulxe.h"

extern void emautosave( strid_t ramStream, strid_t miscStream );
extern void emglulxeen( strid_t gameStream, strid_t profileStream, glui32 profcalls );

#endif // EMGLULXEEN_H