cmake_minimum_required(VERSION 3.13)

project(Emglken
    VERSION 0.2.4
    LANGUAGES C)

include(emglken/common.cmake)

#[[
add_library(emglken STATIC)
add_sources(emglken "emglken/"
    SRCS gi_blorb.c gi_debug.c gi_dispa.c main.c rgblorb.c rgevent.c
    rgfref.c rggestal.c rgmisc.c rgschan.c rgstream.c rgwindow.c)
target_include_directories(emglken
    PUBLIC emglken)
]]

add_library(remglk STATIC)
add_sources(remglk "remglk/"
    SRCS main.c rgevent.c rgfref.c rggestal.c
    rgdata.c rgmisc.c rgauto.c rgstream.c rgstyle.c
    rgwin_blank.c rgwin_buf.c rgwin_grid.c rgwin_pair.c rgwin_graph.c
    rgwindow.c rgschan.c rgblorb.c
    cgunicod.c cgdate.c gi_dispa.c gi_debug.c gi_blorb.c)
    add_sources(remglk "src/" SRCS getc.c)
target_compile_options(remglk PRIVATE -Wall)
target_link_options(remglk PRIVATE -Wl,--wrap=getc,--wrap=ungetc)
target_include_directories(remglk
    PUBLIC remglk/)

add_executable(glulxe-core)
add_sources(glulxe-core "glulxe/"
    SRCS accel.c debugger.c exec.c files.c float.c funcs.c
    gestalt.c glkop.c heap.c main.c operand.c osdepend.c profile.c
    search.c serial.c string.c vm.c unixstrt.c unixautosave.c)
#add_sources(glulxe-core "emglken/" SRCS emglulxeen.c)
emglken_vm(glulxe-core
    EMTERPRETIFY_FILE "glulxe-core.js.bin"
    EMTERPRETIFY_WHITELIST "emglken/glulxe-whitelist.json"
    EXPORTED_FUNCTIONS "[_emautosave,_emglulxeen]")
target_compile_definitions(glulxe-core PRIVATE OS_UNIX)
target_compile_options(glulxe-core PRIVATE -Wall -Wmissing-prototypes -Wstrict-prototypes -Wno-unused)
#make_bundle(glulxe.js glulxe-core "Glulxe" emglken/glulxe.js)

#[[
add_executable(glulxe-profiler-core)
add_sources(glulxe-profiler-core "glulxe/"
    SRCS accel.c debugger.c exec.c files.c float.c funcs.c
    gestalt.c glkop.c heap.c main.c operand.c osdepend.c profile.c
    search.c serial.c string.c vm.c)
add_sources(glulxe-profiler-core "emglken/" SRCS emglulxeen.c)
emglken_vm(glulxe-profiler-core
    EMTERPRETIFY_FILE "glulxe-profiler-core.js.bin"
    EMTERPRETIFY_WHITELIST "emglken/glulxe-whitelist.json"
    EXPORTED_FUNCTIONS "[_emautosave,_emglulxeen]")
target_compile_definitions(glulxe-profiler-core PRIVATE FLOAT_COMPILE_SAFER_POWF OS_UNIX VM_PROFILING)
target_compile_options(glulxe-profiler-core PRIVATE -Wall -Wmissing-prototypes -Wstrict-prototypes -Wno-unused)
make_bundle(glulxe-profiler.js glulxe-profiler-core "Glulxe" emglken/glulxe-profiler.js)

add_executable(git-core)
add_sources(git-core "git/"
    SRCS accel.c compiler.c gestalt.c git.c glkop.c heap.c
    memory.c opcodes.c operands.c peephole.c savefile.c saveundo.c
    search.c terp.c)
add_sources(git-core "emglken/" SRCS emgiten.c)
emglken_vm(git-core
    EMTERPRETIFY_FILE "git-core.js.bin"
    EMTERPRETIFY_WHITELIST "emglken/git-whitelist.json"
    EXPORTED_FUNCTIONS "[_emgiten]"
    EXTRA_EXPORTED_RUNTIME_METHODS "[ccall]")
target_compile_definitions(git-core PRIVATE USE_OWN_POWF)
make_bundle(git.js git-core "Git" emglken/git.js)

add_executable(hugo-core)
add_sources(hugo-core "hugo/source/"
    SRCS he.c heexpr.c hemisc.c heobject.c heparse.c heres.c herun.c heset.c stringfn.c)
add_sources(hugo-core "hugo/heglk/"
    SRCS heglk.c emhugoen.c)
emglken_vm(hugo-core
    EMTERPRETIFY_FILE "hugo-core.js.bin"
    EMTERPRETIFY_WHITELIST "emglken/hugo-whitelist.json"
    EXPORTED_FUNCTIONS "[_emhugoen]")
target_compile_definitions(hugo-core PRIVATE COMPILE_V25 GLK NO_KEYPRESS_CURSOR HUGO_INLINE=static\ inline)
target_compile_options(hugo-core PRIVATE -Wall)
make_bundle(hugo.js hugo-core "Hugo" emglken/hugo.js)
]]