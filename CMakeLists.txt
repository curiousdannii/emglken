cmake_minimum_required(VERSION 3.13)

project(Emglken
    VERSION 0.3.0
    LANGUAGES C CXX)

include(src/common.cmake)

# Thin LTO (as the CMAKE setting would turn on) results in an "undefined symbol: calloc" when linking Glulxe
# https://github.com/emscripten-core/emscripten/issues/15676
#set(CMAKE_INTERPROCEDURAL_OPTIMIZATION TRUE)
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -flto=full")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -flto=full")

add_library(remglk STATIC)
add_sources(remglk "remglk/"
    SRCS main.c rgevent.c rgfref.c rggestal.c
    rgdata.c rgmisc.c rgauto.c rgstream.c rgstyle.c
    rgwin_blank.c rgwin_buf.c rgwin_grid.c rgwin_pair.c rgwin_graph.c
    rgwindow.c rgschan.c rgblorb.c
    cgdate.c gi_dispa.c gi_debug.c gi_blorb.c)
add_sources(remglk "src/"
    SRCS cgunicod.c getc.c)
target_compile_options(remglk PRIVATE -Wall -Wno-unused-but-set-variable)
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

#[[
add_executable(glulxe-profiler-core)
add_sources(glulxe-profiler-core "glulxe/"
    SRCS accel.c debugger.c exec.c files.c float.c funcs.c
    gestalt.c glkop.c heap.c main.c operand.c osdepend.c profile.c
    search.c serial.c string.c vm.c unixstrt.c unixautosave.c)
emglken_vm(glulxe-profiler-core)
target_compile_definitions(glulxe-profiler-core PRIVATE OS_UNIX VM_PROFILING)
target_compile_options(glulxe-profiler-core PRIVATE -Wall -Wmissing-prototypes -Wstrict-prototypes -Wno-unused)
]]

add_executable(bocfel-core)
add_sources(bocfel-core "garglk/terps/bocfel/"
    SRCS blorb.c branch.c dict.c glkstart.c iff.c io.c math.c meta.c memory.c
    objects.c osdep.c patches.c process.c random.c screen.c sound.c stack.c
    stash.c unicode.c util.c zoom.c zterp.c)
emglken_vm(bocfel-core)
target_compile_definitions(bocfel-core PRIVATE ZTERP_GLK ZTERP_UNIX)
target_compile_options(bocfel-core PRIVATE -Wall)
# Prevent warnings from some Glk functions not being used in Bocfel
target_link_options(bocfel-core PRIVATE -sASYNCIFY_REMOVE=[])
# Cannot run the ignore indirect optimisation, but maybe I can later determine which functions need instrumenting
target_link_options(bocfel-core PRIVATE -sASYNCIFY_IGNORE_INDIRECT=0)

add_executable(git-core)
add_sources(git-core "git/"
    SRCS accel.c compiler.c gestalt.c git.c glkop.c heap.c
    memory.c opcodes.c operands.c peephole.c savefile.c saveundo.c
    search.c terp.c git_unix.c)
emglken_vm(git-core)
target_compile_definitions(git-core PRIVATE USE_DIRECT_THREADING USE_INLINE)
target_compile_options(git-core PRIVATE -Wall -Wno-int-conversion -Wno-pointer-sign)

add_executable(hugo-core)
add_sources(hugo-core "hugo/source/"
    SRCS he.c heexpr.c hemisc.c heobject.c heparse.c heres.c herun.c heset.c stringfn.c)
add_sources(hugo-core "hugo/heglk/"
    SRCS heglk.c heglkunix.c)
emglken_vm(hugo-core)
target_compile_definitions(hugo-core PRIVATE COMPILE_V25 GLK NO_KEYPRESS_CURSOR HUGO_INLINE=static\ inline)
target_compile_options(hugo-core PRIVATE -Wall -Wno-unused-but-set-variable)
# Prevent warnings from some Glk functions being inlined and so no longer being removed
target_link_options(hugo-core PRIVATE -sASYNCIFY_REMOVE=['glk_get_*'])

add_executable(tads-core)
add_sources(tads-core "tads/glk/"
    SRCS memicmp.c osbuffer.c osextra.c osglk.c osglkban.c osmisc.c osparse.c
    osportable.cc t23run.cpp t2askf.c t2indlg.c t3askf.cpp t3indlg.cpp vmuni_cs.cpp)
add_sources(tads-core "tads/tads2/"
    SRCS argize.c bif.c bifgdum.c cmap.c cmd.c dat.c dbgtr.c errmsg.c execmd.c
    fio.c fioxor.c getstr.c ler.c linfdum.c lst.c mch.c mcm.c mcs.c obj.c oem.c
    os0.c oserr.c osifc.c osnoui.c osrestad.c osstzprs.c ostzposix.c out.c output.c
    ply.c qas.c regex.c run.c runstat.c suprun.c trd.c voc.c vocab.c)
add_sources(tads-core "tads/tads3/"
    SRCS charmap.cpp md5.cpp resldexe.cpp resload.cpp sha2.cpp std.cpp tcerr.cpp
    tcerrmsg.cpp tcgen.cpp tcglob.cpp tcmain.cpp tcprs.cpp tcprs_rt.cpp tcprsnf.cpp
    tcprsnl.cpp tcprsstm.cpp tcsrc.cpp tct3.cpp tct3_d.cpp tct3nl.cpp tct3stm.cpp
    tct3unas.cpp tctok.cpp utf8.cpp vmanonfn.cpp vmbif.cpp vmbifl.cpp vmbifreg.cpp
    vmbift3.cpp vmbiftad.cpp vmbiftio.cpp vmbignum.cpp vmbignumlib.cpp vmbt3_nd.cpp
    vmbytarr.cpp vmcfgmem.cpp vmcoll.cpp vmconhmp.cpp vmconsol.cpp vmcrc.cpp
    vmcset.cpp vmdate.cpp vmdict.cpp vmdynfunc.cpp vmerr.cpp vmerrmsg.cpp
    vmfile.cpp vmfilnam.cpp vmfilobj.cpp vmfref.cpp vmfunc.cpp vmglob.cpp
    vmgram.cpp vmhash.cpp vmhostsi.cpp vmhosttx.cpp vmimage.cpp vmimg_nd.cpp
    vmini_nd.cpp vminit.cpp vminitim.cpp vmintcls.cpp vmisaac.cpp vmiter.cpp
    vmlog.cpp vmlookup.cpp vmlst.cpp vmmain.cpp vmmcreg.cpp vmmeta.cpp
    vmnetfillcl.cpp vmobj.cpp vmop.cpp vmpack.cpp vmpat.cpp vmpool.cpp
    vmpoolim.cpp vmregex.cpp vmrun.cpp vmrunsym.cpp vmsa.cpp vmsave.cpp vmsort.cpp
    vmsortv.cpp vmsrcf.cpp vmstack.cpp vmstr.cpp vmstrbuf.cpp vmstrcmp.cpp
    vmtmpfil.cpp vmtobj.cpp vmtype.cpp vmtypedh.cpp vmtz.cpp vmtzobj.cpp
    vmundo.cpp vmvec.cpp vmconnom.cpp)
emglken_vm(tads-core)
set_property(TARGET tads-core PROPERTY CXX_STANDARD 11)
target_compile_definitions(tads-core PRIVATE GARGOYLE VMGLOB_STRUCT GLK_UNICODE GLK_TIMERS TC_TARGET_T3 RUNTIME)
# Define __GNU_LIBRARY__ so that tads3/sha2.cpp doesn't get confused when trying to load endian headers
target_compile_definitions(tads-core PRIVATE __GNU_LIBRARY__)
target_compile_options(tads-core PRIVATE -Wno-deprecated-register -Wno-logical-not-parentheses -Wno-pointer-sign -Wno-string-concatenation)
# Prevent warnings from some Glk functions not being used in TADS
target_link_options(tads-core PRIVATE -sASYNCIFY_REMOVE=[])
# Cannot run the ignore indirect optimisation on TADS, but maybe I can later determine which functions need instrumenting
target_link_options(tads-core PRIVATE -sASYNCIFY_IGNORE_INDIRECT=0)