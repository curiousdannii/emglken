// Create a fake stream that won't be autosaved
// Code copied from GlkApi's glk_stream_open_memory and gli_new_stream

module.exports = function( buf, writeable, GiDispa )
{
    var str = {}
    str.type = 3
    str.rock = 0
    str.disprock = undefined

    str.unicode = false
    /* isbinary is only meaningful for Resource and streaming-File streams */
    //str.isbinary = false
    str.streaming = false
    //str.ref = null
    //str.win = null
    //str.file = null

    /* for buffer mode */
    //str.buf = null
    //str.bufpos = 0
    //str.buflen = 0
    //str.bufeof = 0
    str.timer_id = null
    str.flush_func = null

    /* for streaming mode */
    str.fstream = null

    str.readcount = 0
    str.writecount = 0
    str.readable = !writeable
    str.writable = writeable

    /*str.prev = null
    str.next = gli_streamlist
    gli_streamlist = str
    if (str.next)
        str.next.prev = str*/

    GiDispa.class_register( 'stream', str )

    if ( buf )
    {
        str.buf = buf
        str.buflen = buf.length
        str.bufpos = 0
        str.bufeof = writeable ? 0 : str.buflen
        GiDispa.retain_array( buf )
    }

    return str
}