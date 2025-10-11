Emglken: Glk meets Emscripten
=============================

Over the years many Interactive Fiction interpreters have been written which use the Glk API, or have been adapted to do so. Emglken takes some of these interpreters, compiles them to use the [RemGlk-rs](https://github.com/curiousdannii/remglk-rs) Glk library using [Emscripten](https://emscripten.org/), and then outputs to Javascript and WebAssembly. These interpreters, which once needed to be compiled for each distinct operating system and CPU combination, can now be run anywhere there's a modern Javascript runtime: on the web with [Parchment](https://github.com/curiousdannii/parchment), in desktop apps like [Lectrote](https://github.com/erkyrath/lectrote), or in Node.js directly.

Emglken itself has almost no code at all; this project basically just takes care of compiling all the pieces together with the right settings, as well as providing a common JS interface to handle setting up the connections between each interpreter and GlkOte.

npm package and console app
---------------------------

Emglken has been published to the [npm package repository](https://www.npmjs.com/package/emglken). You can install the emglken package and use each interpreter as you wish. A basic console app is also provided, just run `emglken` with the path to the storyfile you want to run.

```
emglken storyfile.gblorb
```

Included Projects
-----------------

Emglken, RemGlk-rs and AsyncGlk (used by the console app) are MIT licensed, as are some of the interpreters, but others are licensed under other Free Software licenses as listed below.

Name   | Upstream repo | License
------ | ------------- | -------
AsyncGlk | [curiousdannii/asyncglk](https://github.com/curiousdannii/asyncglk) | [MIT](https://github.com/curiousdannii/asyncglk/blob/master/LICENSE)
Bocfel | [garglk/garglk](https://github.com/garglk/garglk) | [MIT](https://github.com/garglk/garglk/blob/master/terps/bocfel/LICENSE)
Git    | [DavidKinder/Git](https://github.com/DavidKinder/Git) | [MIT](https://github.com/DavidKinder/Git/blob/master/README.txt)
Glulxe | [erkyrath/glulxe](https://github.com/erkyrath/glulxe) | [MIT](https://github.com/erkyrath/glulxe/blob/master/LICENSE)
Hugo   | [hugoif/hugo-unix](https://github.com/hugoif/hugo-unix) | [BSD-2-Clause](https://github.com/hugoif/hugo-unix/blob/master/License.txt)
RemGlk-rs | [curiousdannii/remglk-rs](https://github.com/curiousdannii/remglk-rs) | [MIT](https://github.com/curiousdannii/remglk-rs/blob/master/LICENSE)
Scare  | [garglk/garglk](https://github.com/garglk/garglk) | [GPL-2.0](https://github.com/garglk/garglk/blob/master/terps/scare/COPYING)
TADS   | [tads-intfic/tads-runner](https://github.com/tads-intfic/tads-runner) | [GPL-2.0](https://github.com/tads-intfic/tads-runner/blob/master/COPYING)