/*

Emglken File System
===================

Copyright (c) 2020 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

const DIR_MODE = 16895 // 040777
const FILE_MODE = 33206 // 100666
const SEEK_CUR = 1
const SEEK_END = 2

// WASI error codes
// See https://github.com/WebAssembly/wasi-libc/blob/master/libc-bottom-half/headers/public/wasi/api.h
const EINVAL = 28
const ENOENT = 44

export default class EmglkenFS
{
    constructor(VM)
    {
        this.dialog = VM.options.dialog
        this.FS = VM.Module.FS
        this.VM = VM
    }

    close(stream)
    {
        if (stream.name === 'storyfile')
        {}
        else
        {
            throw new Error('EmglkenFS.close')
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
                throw new Error('EmglkenFS.llseek')
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
        if (name === 'storyfile')
        {
            return this.createNode(parent, name, FILE_MODE)
        }
        throw this.FS.genericErrors[ENOENT]
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
            throw new Error('EmglkenFS.open')
        }
    }

    read(stream, buffer, offset, length, position)
    {
        let size = 0
        if (length === 0)
        {
            return 0
        }
        if (stream.name === 'storyfile')
        {
            size = Math.min(stream.data.length - position, length)
            buffer.set(stream.data.subarray(position, position + size), offset)
        }
        else
        {
            throw new Error('EmglkenFS.read')
        }
        return size
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

    setattr()
    {
        throw new Error('EmglkenFS.setattr')
    }

    symlink()
    {
        throw new Error('EmglkenFS.symlink')
    }

    unlink()
    {
        throw new Error('EmglkenFS.unlink')
    }

    write()
    {
        throw new Error('EmglkenFS.write')
    }
}