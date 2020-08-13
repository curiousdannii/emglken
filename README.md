Emglken: Glk meets Emscripten
=============================

Over the years many Interactive Fiction interpreters have been written which use the Glk API, or have been adapted to do so. Emglken takes some of these interpreters, compiles them to use the [RemGlk](https://github.com/erkyrath/remglk) Glk library using [Emscripten](https://emscripten.org/), and then outputs to Javascript and WebAssembly. These interpreters, which once needed to be compiled for each distinct operating system and CPU combination, can now be run anywhere there's a modern Javascript runtime: on the web with [Parchment](https://github.com/curiousdannii/parchment), in desktop apps like [Lectrote](https://github.com/erkyrath/lectrote), or in Node.js directly.

Emglken itself doesn't have a lot of code, RemGlk does most of the work for us. What Emglken does provide is a virtual file system for Emscripten which lets RemGlk think it is running on a normal Linux filesystem, but is actually transformed to use [GlkOte](https://github.com/erkyrath/glkote)'s Dialog API. Emglken also provides a common interpreter interface to handle setting up the connections between each interpreter and GlkOte.

Both RemGlk and the Emglken customisations are MIT licensed, as are some of the interpreters, but others are licensed under other Free Software licenses as listed below.

Included Projects
-----------------

Name   | Upstream repo | License
------ | ------------- | -------
Git    | [DavidKinder/Git](https://github.com/DavidKinder/Git) | [MIT](https://github.com/DavidKinder/Git/blob/master/README.txt)
Glulxe | [erkyrath/glulxe](https://github.com/erkyrath/glulxe) | [MIT](https://github.com/erkyrath/glulxe/blob/master/LICENSE)
Hugo   | [curiousdannii/hugo](https://github.com/curiousdannii/hugo) | [BSD-2-Clause](https://github.com/curiousdannii/hugo/blob/master/LICENSE.txt)
RemGlk | [erkyrath/remglk](https://github.com/erkyrath/remglk) | [MIT](https://github.com/erkyrath/remglk/blob/master/LICENSE)
TADS   | [cspiegel/terps](https://github.com/cspiegel/terps) | [GPL-2.0](https://github.com/cspiegel/terps/blob/master/tads/COPYING)