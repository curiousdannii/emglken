/* Intercept getc/ungetcs in Emscripten
   To be linked with "-Wl,--wrap=getc,--wrap=ungetc" */

#include <stdio.h>
#include <emscripten.h>

extern int __real_getc(FILE *f);
extern int __real_ungetc(int c, FILE *f);

EM_JS(int, emglken_getc, (), {
    return Asyncify.handleAsync(async () => {
        if (!Module.emglken_stdin_buffers.length)
        {
            await new Promise(resolve => { Module.emglken_stdin_ready = resolve });
        }
        const val = Module.emglken_stdin_buffers[0][Module.emglken_stdin_index++];
        if (Module.emglken_stdin_index === Module.emglken_stdin_buffers[0].length)
        {
            Module.emglken_stdin_buffers.shift();
            Module.emglken_stdin_index = 0;
        }
        return val;
    });
});

EM_JS(int, emglken_ungetc, (int c), {
    if (Module.emglken_stdin_buffers.length)
    {
        Module.emglken_stdin_buffers[0] = Module.emglken_stdin_buffers[0].slice(Module.emglken_stdin_index);
        Module.emglken_stdin_index = 0;
    }
    Module.emglken_stdin_buffers.unshift([c]);
});

int __wrap_getc(FILE *f)
{
    if (f == stdin)
    {
        return emglken_getc();
    }
    else
    {
        return __real_getc(f);
    }
}

int __wrap_ungetc(int c, FILE *f)
{
    if (f == stdin)
    {
        emglken_ungetc(c);
        return c;
    }
    else
    {
        return __real_ungetc(c, f);
    }
}