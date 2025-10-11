cmake_minimum_required(VERSION 3.13)

project(Emglken
    VERSION 0.3.0
    LANGUAGES C CXX)

include(src/common.cmake)

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Debug)
endif()
if (${CMAKE_BUILD_TYPE} STREQUAL Release)
    set(CMAKE_INTERPROCEDURAL_OPTIMIZATION TRUE)
    set(REMGLK_RS_LIB_FOLDER ${CMAKE_CURRENT_SOURCE_DIR}/target/wasm32-unknown-emscripten/release)
else()
    set(REMGLK_RS_LIB_FOLDER ${CMAKE_CURRENT_SOURCE_DIR}/target/wasm32-unknown-emscripten/debug)
endif()

add_executable(glulxe)
add_sources(glulxe "glulxe/"
    SRCS accel.c debugger.c exec.c files.c float.c funcs.c
    gestalt.c glkop.c heap.c main.c operand.c osdepend.c profile.c
    search.c serial.c string.c vm.c unixstrt.c unixautosave.c)
emglken_vm(glulxe)
target_compile_definitions(glulxe PRIVATE OS_UNIX)
target_compile_options(glulxe PRIVATE -Wall -Wmissing-prototypes -Wno-unused)
#target_link_options(glulxe PRIVATE -sASYNCIFY_IGNORE_INDIRECT)
#target_link_options(glulxe PRIVATE -sASYNCIFY_ADD=@${CMAKE_CURRENT_LIST_DIR}/src/add-list-glulxe.txt)
#target_link_options(glulxe PRIVATE -sASYNCIFY_REMOVE=@${CMAKE_CURRENT_LIST_DIR}/src/remove-list-glulxe.txt)

#[[
add_executable(glulxe-profiler-core)
add_sources(glulxe-profiler-core "glulxe/"
    SRCS accel.c debugger.c exec.c files.c float.c funcs.c
    gestalt.c glkop.c heap.c main.c operand.c osdepend.c profile.c
    search.c serial.c string.c vm.c unixstrt.c unixautosave.c)
emglken_vm(glulxe-profiler-core)
target_compile_definitions(glulxe-profiler-core PRIVATE OS_UNIX VM_PROFILING)
target_compile_options(glulxe-profiler-core PRIVATE -Wall -Wmissing-prototypes -Wno-unused)
]]

add_executable(bocfel)
add_sources(bocfel "garglk/terps/bocfel/"
    SRCS blorb.cpp branch.cpp dict.cpp glkautosave.cpp glkstart.cpp iff.cpp
    io.cpp mathop.cpp meta.cpp memory.cpp objects.cpp options.cpp osdep.cpp
    patches.cpp process.cpp random.cpp screen.cpp sound.cpp stack.cpp stash.cpp
    unicode.cpp util.cpp zoom.cpp zterp.cpp)
emglken_vm(bocfel)
set_property(TARGET bocfel PROPERTY CXX_STANDARD 14)
target_compile_definitions(bocfel PRIVATE ZTERP_GLK ZTERP_GLK_BLORB
    ZTERP_GLK_NO_STDIO ZTERP_GLK_UNIX
    "ZTERP_STATIC_PATCH_FILE=\"static-patches.h\"")
target_compile_options(bocfel PRIVATE -Wall)
# Bocfel now uses exceptions, which takes a little bit to set up
target_compile_options(bocfel PRIVATE -fexceptions)
target_link_options(bocfel PRIVATE -sNO_DISABLE_EXCEPTION_CATCHING)

add_executable(git)
add_sources(git "git/"
    SRCS accel.c compiler.c gestalt.c git.c glkop.c heap.c
    memory.c opcodes.c operands.c peephole.c savefile.c saveundo.c
    search.c terp.c git_unix.c)
emglken_vm(git)
target_compile_definitions(git PRIVATE USE_DIRECT_THREADING USE_INLINE)
target_compile_options(git PRIVATE -Wall -Wno-int-conversion -Wno-pointer-sign -Wno-unused-but-set-variable)

add_executable(hugo)
add_sources(hugo "hugo/source/"
    SRCS he.c heexpr.c hemisc.c heobject.c heparse.c heres.c herun.c heset.c stringfn.c)
add_sources(hugo "hugo/heglk/"
    SRCS heglk.c heglkunix.c)
emglken_vm(hugo)
target_compile_definitions(hugo PRIVATE COMPILE_V25 GLK NO_KEYPRESS_CURSOR HUGO_INLINE=static\ inline)
target_compile_options(hugo PRIVATE -Wall -Wno-unused-but-set-variable)

add_executable(scare)
add_sources(scare "garglk/terps/scare/"
    SRCS os_glk.c scdebug.c scevents.c scexpr.c scgamest.c scinterf.c sclibrar.c
    sclocale.c scmemos.c scnpcs.c scobjcts.c scparser.c scprintf.c scprops.c
    scresour.c screstrs.c scrunner.c scserial.c sctaffil.c sctafpar.c sctasks.c
    scutils.c scvars.c)
emglken_vm(scare)
target_compile_options(scare PRIVATE --use-port=zlib)
target_link_options(scare PRIVATE --use-port=zlib)

add_executable(tads)
add_sources(tads "tads/glk/"
    SRCS memicmp.c osbuffer.c osemglken.c osextra.c osglk.c osglkban.c osmisc.c osparse.c
    osportable.cc t23run.cpp t2askf.c t2indlg.c t3askf.cpp t3indlg.cpp vmuni_cs.cpp)
add_sources(tads "tads/tads2/"
    SRCS argize.c bif.c bifgdum.c cmap.c cmd.c dat.c dbgtr.c errmsg.c execmd.c
    fio.c fioxor.c getstr.c ler.c linfdum.c lst.c mch.c mcm.c mcs.c obj.c oem.c
    os0.c oserr.c osifc.c osnoui.c osrestad.c osstzprs.c ostzposix.c out.c output.c
    ply.c qas.c regex.c run.c runstat.c suprun.c trd.c voc.c vocab.c)
add_sources(tads "tads/tads3/"
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
emglken_vm(tads)
set_property(TARGET tads PROPERTY CXX_STANDARD 11)
target_compile_definitions(tads PRIVATE EMGLKEN GLK GLK_TIMERS GLK_UNICODE NO_T2_COPYRIGHT_NOTICE
    OSNOUI_OMIT_OS_FPRINT OSNOUI_OMIT_OS_FPRINTZ RUNTIME TC_TARGET_T3 VMGLOB_STRUCT)
target_compile_options(tads PRIVATE -Wno-deprecated-register -Wno-logical-not-parentheses -Wno-pointer-sign -Wno-string-concatenation)
if (${CMAKE_BUILD_TYPE} STREQUAL Debug)
    # TADS needs to be compiled in at least -O2, or else it will use 4GB+ of RAM and be very slow
    target_compile_options(tads PRIVATE -O2)
    target_link_options(tads PRIVATE -O2)
endif()