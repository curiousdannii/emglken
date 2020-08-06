/*

Emglken File System
===================

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

const DIR_MODE = 16895 // 040777
const FILE_MODE = 33206 // 100666
const SEEK_SET = 0
const SEEK_CUR = 1
const SEEK_END = 2

// WASI error codes
// See https://github.com/WebAssembly/wasi-libc/blob/master/libc-bottom-half/headers/public/wasi/api.h
const EINVAL = 28
const ENOENT = 44

// Convert Linux flags to Glk flags
function convert_flags(flags)
{
    // O_APPEND => filemode_WriteAppend
    if (flags & 0x400)
    {
        return 5
    }
    // O_WRONLY => filemode_Write
    if (flags & 1)
    {
        return 1
    }
    // O_RDWR => filemode_ReadWrite
    if (flags & 2)
    {
        return 3
    }
    // O_RDONLY => filemode_Read
    return 2
}

module.exports = class EmglkenFS
{
    constructor(VM)
    {
        this.dialog = VM.options.Dialog
        this.streaming = this.dialog.streaming
        this.FS = VM.Module.FS
        this.VM = VM
    }

    close(stream)
    {
        if (stream.name === 'storyfile')
        {}
        else
        {
            if (this.streaming)
            {
                stream.fstream.fclose()
            }
            else
            {
                throw new Error('EmglkenFS.close: non-streaming Dialog')
            }
        }
    }

    createNode(parent, name, mode, dev)
    {
        const FS = this.FS
        if (!FS.isDir(mode) && !FS.isFile(mode))
        {
            throw new FS.ErrnoError(EINVAL)
        }
        const node = FS.createNode(parent, name, mode)
        node.node_ops = this
        node.stream_ops = this
        return node
    }

    getattr()
    {
        throw new Error('EmglkenFS.getattr')
    }

    llseek(stream, offset, whence)
    {
        let position = offset
        if (whence === SEEK_CUR)
        {
            position += stream.position
        }
        else if (whence === SEEK_END)
        {
            if (stream.name === 'storyfile')
            {
                position += stream.data.length
            }
            else
            {
                if (this.streaming)
                {
                    const curpos = stream.fstream.ftell()
                    stream.fstream.fseek(0, SEEK_END)
                    position += stream.fstream.ftell()
                    stream.fstream.fseek(curpos, SEEK_SET)
                }
                else
                {
                    throw new Error('EmglkenFS.llseek: non-streaming Dialog')
                }
            }
        }
        if (position < 0)
        {
            throw new this.FS.ErrnoError(EINVAL)
        }
        return position
    }

    lookup(parent, name)
    {
        if (name !== 'storyfile')
        {
            if (!this.dialog.file_ref_exists({filename: name}))
            {
                throw new this.FS.ErrnoError(ENOENT)
            }
        }
        return this.createNode(parent, name, FILE_MODE)
    }

    mknod()
    {
        throw new Error('EmglkenFS.mknod')
    }

    mmap()
    {
        throw new Error('EmglkenFS.mmap')
    }

    mount()
    {
        return this.createNode(null, '/', DIR_MODE, 0)
    }

    msync()
    {
        throw new Error('EmglkenFS.msync')
    }

    open(stream)
    {
        stream.name = stream.node.name
        if (stream.name === 'storyfile')
        {
            stream.data = this.VM.data
        }
        else
        {
            const fmode = convert_flags(stream.flags)
            if (this.streaming)
            {
                stream.fstream = this.dialog.file_fopen(fmode, {filename: stream.name})
            }
            else
            {
                throw new Error('EmglkenFS.open: non-streaming Dialog')
            }
        }
    }

    read(stream, buffer, offset, length, position)
    {
        if (length === 0)
        {
            return 0
        }
        if (stream.name === 'storyfile')
        {
            const size = Math.min(stream.data.length - position, length)
            buffer.set(stream.data.subarray(position, position + size), offset)
            return size
        }
        else
        {
            if (this.streaming)
            {
                stream.fstream.fseek(position, SEEK_SET)
                const buf = stream.fstream.BufferClass.from(buffer.buffer, offset, length)
                return stream.fstream.fread(buf, length)
            }
            else
            {
                throw new Error('EmglkenFS.read: non-streaming Dialog')
            }
        }
    }

    readdir()
    {
        throw new Error('EmglkenFS.readdir')
    }

    readlink()
    {
        throw new Error('EmglkenFS.readlink')
    }

    rename()
    {
        throw new Error('EmglkenFS.rename')
    }

    rmdir()
    {
        throw new Error('EmglkenFS.rmdir')
    }

    setattr(node, attr)
    {
        // I don't think we need to do anything here?
        // Maybe truncate a file?
    }

    symlink()
    {
        throw new Error('EmglkenFS.symlink')
    }

    unlink()
    {
        throw new Error('EmglkenFS.unlink')
    }

    write(stream, buffer, offset, length, position)
    {
        if (this.streaming)
        {
            stream.fstream.fseek(position, SEEK_SET)
            const buf = stream.fstream.BufferClass.from(buffer).subarray(offset, offset + length)
            return stream.fstream.fwrite(buf, length)
        }
        else
        {
            throw new Error('EmglkenFS.write: non-streaming Dialog')
        }
    }
}