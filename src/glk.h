// Emglken compatibility patches

#ifndef EMGLKEN_GLK
#define EMGLKEN_GLK

#include "../remglk/glk.h"
#include "remglk.h"

#define GLK_MODULE_FILEREF_GET_NAME
extern char *glkunix_fileref_get_filename(frefid_t fref);
#define garglk_fileref_get_name glkunix_fileref_get_filename

#endif /* EMGLKEN_GLK */