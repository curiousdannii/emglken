cmake_minimum_required(VERSION 3.13)

project(Emglken
    VERSION 0.2.4
    LANGUAGES C)

include(src/common.cmake)

add_library(remglk STATIC)
add_sources(remglk "remglk/"
    SRCS main.c rgevent.c rgfref.c rggestal.c
    rgdata.c rgmisc.c rgauto.c rgstream.c rgstyle.c
    rgwin_blank.c rgwin_buf.c rgwin_grid.c rgwin_pair.c rgwin_graph.c
    rgwindow.c rgschan.c rgblorb.c
    cgunicod.c cgdate.c gi_dispa.c gi_debug.c gi_blorb.c)
target_sources(remglk PRIVATE src/getc.c)
target_compile_options(remglk PRIVATE -Wall)
target_link_options(remglk PRIVATE -Wl,--wrap=getc,--wrap=ungetc)
target_include_directories(remglk PUBLIC remglk/)

add_executable(glulxe-core)
add_sources(glulxe-core "glulxe/"
    SRCS accel.c debugger.c exec.c files.c float.c funcs.c
    gestalt.c glkop.c heap.c main.c operand.c osdepend.c profile.c
    search.c serial.c string.c vm.c unixstrt.c unixautosave.c)
emglken_vm(glulxe-core)
target_compile_definitions(glulxe-core PRIVATE OS_UNIX)
target_compile_options(glulxe-core PRIVATE -Wall -Wmissing-prototypes -Wstrict-prototypes -Wno-unused)
#make_bundle(glulxe.js glulxe-core "Glulxe" emglken/glulxe.js)

#[[
add_executable(glulxe-profiler-core)
add_sources(glulxe-profiler-core "glulxe/"
    SRCS accel.c debugger.c exec.c files.c float.c funcs.c
    gestalt.c glkop.c heap.c main.c operand.c osdepend.c profile.c
    search.c serial.c string.c vm.c unixstrt.c unixautosave.c)
emglken_vm(glulxe-profiler-core)
target_compile_definitions(glulxe-profiler-core PRIVATE OS_UNIX VM_PROFILING)
target_compile_options(glulxe-profiler-core PRIVATE -Wall -Wmissing-prototypes -Wstrict-prototypes -Wno-unused)
#make_bundle(glulxe-profiler.js glulxe-profiler-core "Glulxe" emglken/glulxe-profiler.js)

add_executable(git-core)
add_sources(git-core "git/"
    SRCS accel.c compiler.c gestalt.c git.c glkop.c heap.c
    memory.c opcodes.c operands.c peephole.c savefile.c saveundo.c
    search.c terp.c git_unix.c)
emglken_vm(git-core)
#make_bundle(git.js git-core "Git" emglken/git.js)

add_executable(hugo-core)
add_sources(hugo-core "hugo/source/"
    SRCS he.c heexpr.c hemisc.c heobject.c heparse.c heres.c herun.c heset.c stringfn.c)
add_sources(hugo-core "hugo/heglk/"
    SRCS heglk.c emhugoen.c)
emglken_vm(hugo-core)
target_compile_definitions(hugo-core PRIVATE COMPILE_V25 GLK NO_KEYPRESS_CURSOR HUGO_INLINE=static\ inline)
target_compile_options(hugo-core PRIVATE -Wall)
make_bundle(hugo.js hugo-core "Hugo" emglken/hugo.js)
]]