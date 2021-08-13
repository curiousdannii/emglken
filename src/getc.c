/* Intercept getc/ungetc in Emscripten
   To be linked with "-Wl,--wrap=getc,--wrap=ungetc" */

#include <stdio.h>
#include <emscripten.h>

extern int __real_getc(FILE *f);
extern int __real_ungetc(int c, FILE *f);

#define EMGLKEN_STDIN_BUFFER_LENGTH 256
static char emglken_stdin_buffer[EMGLKEN_STDIN_BUFFER_LENGTH];
static int emglken_stdin_buffer_index = 0;
static int emglken_stdin_buffer_contents_length = 0;
static int emglken_stdin_ungetc_value = EOF;

EM_ASYNC_JS(int, emglken_fill_stdin_buffer, (char *buffer, int maxlen), {
    if (!Module.emglken_stdin_buffers.length)
    {
        await new Promise(resolve => { Module.emglken_stdin_ready = resolve });
    }
    const input = Module.emglken_stdin_buffers.shift();
    const len = Math.min(input.length, maxlen);
    if (len == input.length)
    {
        HEAPU8.set(input, buffer);
    }
    else
    {
        HEAPU8.set(input.subarray(0, len), buffer);
        Module.emglken_stdin_buffers.unshift(input.subarray(len));
    }
    return len;
});

int __wrap_getc(FILE *f)
{
    if (f == stdin)
    {
        if (emglken_stdin_ungetc_value != EOF)
        {
            int res = emglken_stdin_ungetc_value;
            emglken_stdin_ungetc_value = EOF;
            return res;
        }
        if (emglken_stdin_buffer_index == emglken_stdin_buffer_contents_length)
        {
            emglken_stdin_buffer_contents_length = emglken_fill_stdin_buffer(emglken_stdin_buffer, EMGLKEN_STDIN_BUFFER_LENGTH);
            emglken_stdin_buffer_index = 0;
        }
        return emglken_stdin_buffer[emglken_stdin_buffer_index++];
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
        if (emglken_stdin_ungetc_value != EOF)
        {
            return EOF;
        }
        emglken_stdin_ungetc_value = c;
        return c;
    }
    else
    {
        return __real_ungetc(c, f);
    }
}