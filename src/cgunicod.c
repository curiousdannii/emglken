#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "glk.h"
#include "remglk.h"
#include <emscripten.h>

/* This file (and cgunigen.c) are copied directly from the cheapglk package. */

void gli_putchar_utf8(glui32 val, FILE *fl)
{
    if (val < 0x80) {
        putc(val, fl);
    }
    else if (val < 0x800) {
        putc((0xC0 | ((val & 0x7C0) >> 6)), fl);
        putc((0x80 |  (val & 0x03F)     ),  fl);
    }
    else if (val < 0x10000) {
        putc((0xE0 | ((val & 0xF000) >> 12)), fl);
        putc((0x80 | ((val & 0x0FC0) >>  6)), fl);
        putc((0x80 |  (val & 0x003F)      ),  fl);
    }
    else if (val < 0x200000) {
        putc((0xF0 | ((val & 0x1C0000) >> 18)), fl);
        putc((0x80 | ((val & 0x03F000) >> 12)), fl);
        putc((0x80 | ((val & 0x000FC0) >>  6)), fl);
        putc((0x80 |  (val & 0x00003F)      ),  fl);
    }
    else {
        putc('?', fl);
    }
}

int gli_encode_utf8(glui32 val, char *buf, int len)
{
    /* return the number of bytes (actually) generated */
    char *ptr = buf;
    char *end = buf+len;

    if (val < 0x80) {
        if (ptr < end)
            *ptr++ = val;
    }
    else if (val < 0x800) {
        if (ptr < end)
            *ptr++ = (0xC0 | ((val & 0x7C0) >> 6));
        if (ptr < end)
            *ptr++ = (0x80 |  (val & 0x03F)     );
    }
    else if (val < 0x10000) {
        if (ptr < end)
            *ptr++ = (0xE0 | ((val & 0xF000) >> 12));
        if (ptr < end)
            *ptr++ = (0x80 | ((val & 0x0FC0) >>  6));
        if (ptr < end)
            *ptr++ = (0x80 |  (val & 0x003F)      );
    }
    else if (val < 0x200000) {
        if (ptr < end)
            *ptr++ = (0xF0 | ((val & 0x1C0000) >> 18));
        if (ptr < end)
            *ptr++ = (0x80 | ((val & 0x03F000) >> 12));
        if (ptr < end)
            *ptr++ = (0x80 | ((val & 0x000FC0) >>  6));
        if (ptr < end)
            *ptr++ = (0x80 |  (val & 0x00003F)      );
    }
    else {
        if (ptr < end)
            *ptr++ = '?';
    }

    return (ptr - buf);
}

glui32 gli_parse_utf8(unsigned char *buf, glui32 buflen,
    glui32 *out, glui32 outlen)
{
    glui32 pos = 0;
    glui32 outpos = 0;
    glui32 res;
    glui32 val0, val1, val2, val3;

    while (outpos < outlen) {
        if (pos >= buflen)
            break;

        val0 = buf[pos++];

        if (val0 < 0x80) {
            res = val0;
            out[outpos++] = res;
            continue;
        }

        if ((val0 & 0xe0) == 0xc0) {
            if (pos+1 > buflen) {
                gli_strict_warning("incomplete two-byte character");
                break;
            }
            val1 = buf[pos++];
            if ((val1 & 0xc0) != 0x80) {
                gli_strict_warning("malformed two-byte character");
                break;
            }
            res = (val0 & 0x1f) << 6;
            res |= (val1 & 0x3f);
            out[outpos++] = res;
            continue;
        }

        if ((val0 & 0xf0) == 0xe0) {
            if (pos+2 > buflen) {
                gli_strict_warning("incomplete three-byte character");
                break;
            }
            val1 = buf[pos++];
            val2 = buf[pos++];
            if ((val1 & 0xc0) != 0x80) {
                gli_strict_warning("malformed three-byte character");
                break;
            }
            if ((val2 & 0xc0) != 0x80) {
                gli_strict_warning("malformed three-byte character");
                break;
            }
            res = (((val0 & 0xf)<<12)  & 0x0000f000);
            res |= (((val1 & 0x3f)<<6) & 0x00000fc0);
            res |= (((val2 & 0x3f))    & 0x0000003f);
            out[outpos++] = res;
            continue;
        }

        if ((val0 & 0xf0) == 0xf0) {
            if ((val0 & 0xf8) != 0xf0) {
                gli_strict_warning("malformed four-byte character");
                break;        
            }
            if (pos+3 > buflen) {
                gli_strict_warning("incomplete four-byte character");
                break;
            }
            val1 = buf[pos++];
            val2 = buf[pos++];
            val3 = buf[pos++];
            if ((val1 & 0xc0) != 0x80) {
                gli_strict_warning("malformed four-byte character");
                break;
            }
            if ((val2 & 0xc0) != 0x80) {
                gli_strict_warning("malformed four-byte character");
                break;
            }
            if ((val3 & 0xc0) != 0x80) {
                gli_strict_warning("malformed four-byte character");
                break;
            }
            res = (((val0 & 0x7)<<18)   & 0x1c0000);
            res |= (((val1 & 0x3f)<<12) & 0x03f000);
            res |= (((val2 & 0x3f)<<6)  & 0x000fc0);
            res |= (((val3 & 0x3f))     & 0x00003f);
            out[outpos++] = res;
            continue;
        }

        gli_strict_warning("malformed character");
    }

    return outpos;
}

#ifdef GLK_MODULE_UNICODE

EM_JS(glui32, emglken_common_buffer_transformer, (glui32 buf, glui32 len, glui32 numchars, glui32 func, glui32 dont_reduce), {
    const index = buf >> 2;
    const utf32 = HEAPU32.subarray(index, index + numchars);
    const data = dont_reduce ? utf32 : utf32.reduce((prev, ch) => prev + String.fromCodePoint(ch), "");
    const new_str = func(data);
    const newbuf = Uint32Array.from(new_str, ch => ch.codePointAt(0));
    const newlen = newbuf.length;
    HEAPU32.set(newbuf.subarray(0, Math.min(len, newlen)), index);
    return newlen;
});

EM_JS(glui32, glk_buffer_to_lower_case_uni, (glui32 *buf, glui32 len, glui32 numchars), {
    return emglken_common_buffer_transformer(buf, len, numchars, str => str.toLowerCase());
});

EM_JS(glui32, glk_buffer_to_upper_case_uni, (glui32 *buf, glui32 len, glui32 numchars), {
    return emglken_common_buffer_transformer(buf, len, numchars, str => str.toUpperCase());
});

EM_JS(glui32, glk_buffer_to_title_case_uni, (glui32 *buf, glui32 len, glui32 numchars, glui32 lowerrest), {
    return emglken_common_buffer_transformer(buf, len, numchars, utf32 => utf32.reduce((prev, ch, index) =>
    {
        const special_cases = {
            ß: 'Ss', Ǆ: 'ǅ', ǅ: 'ǅ', ǆ: 'ǅ', Ǉ: 'ǈ', ǈ: 'ǈ', ǉ: 'ǈ', Ǌ: 'ǋ', ǋ: 'ǋ', ǌ: 'ǋ',
            Ǳ: 'ǲ', ǲ: 'ǲ', ǳ: 'ǲ', և: 'Եւ', ᾲ: 'Ὰͅ', ᾳ: 'ᾼ', ᾴ: 'Άͅ', ᾷ: 'ᾼ͂', ᾼ: 'ᾼ', ῂ: 'Ὴͅ',
            ῃ: 'ῌ', ῄ: 'Ήͅ', ῇ: 'ῌ͂', ῌ: 'ῌ', ῲ: 'Ὼͅ', ῳ: 'ῼ', ῴ: 'Ώͅ', ῷ: 'ῼ͂', ῼ: 'ῼ', ﬀ: 'Ff',
            ﬁ: 'Fi', ﬂ: 'Fl', ﬃ: 'Ffi', ﬄ: 'Ffl', ﬅ: 'St', ﬆ: 'St', ﬓ: 'Մն', ﬔ: 'Մե',
            ﬕ: 'Մի', ﬖ: 'Վն', ﬗ: 'Մխ',
        };
        const slightly_less_special_cases = ['ᾈᾉᾊᾋᾌᾍᾎᾏ', 'ᾘᾙᾚᾛᾜᾝᾞᾟ', 'ᾨᾩᾪᾫᾬᾭᾮᾯ'];
        let thischar = String.fromCodePoint(ch);
        if (index === 0)
        {
            if (special_cases[thischar])
            {
                thischar = special_cases[thischar];
            }
            else if (ch >= 8064 && ch < 8112)
            {
                thischar = slightly_less_special_cases[((ch - 8064) / 16) | 0][ch % 8];
            }
            else
            {
                thischar = thischar.toUpperCase();
            }
        }
        else if (lowerrest)
        {
            thischar = thischar.toLowerCase();
        }
        return prev + thischar;
    }, ""), 1);
});

#endif /* GLK_MODULE_UNICODE */

#ifdef GLK_MODULE_UNICODE_NORM

EM_JS(glui32, glk_buffer_canon_decompose_uni, (glui32 *buf, glui32 len, glui32 numchars), {
    return emglken_common_buffer_transformer(buf, len, numchars, str => str.normalize("NFD"));
});

EM_JS(glui32, glk_buffer_canon_normalize_uni, (glui32 *buf, glui32 len, glui32 numchars), {
    return emglken_common_buffer_transformer(buf, len, numchars, str => str.normalize("NFC"));
});

#endif /* GLK_MODULE_UNICODE_NORM */