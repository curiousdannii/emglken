# Add sources to a target from a specified directory
function(add_sources target dir)
    cmake_parse_arguments(PARSE_ARGV 2 ADD "" "" "SRCS")
    list(TRANSFORM ADD_SRCS PREPEND ${dir})
    target_sources(${target} PRIVATE ${ADD_SRCS})
    target_include_directories(${target} PRIVATE ${dir})
endfunction()

# Add common arguments and dependencies
function(emglken_vm target)
    set_target_properties(${target} PROPERTIES LINKER_LANGUAGE CXX)
    target_include_directories(${target} PRIVATE remglk/remglk_capi/src/glk)
    target_link_libraries(${target} ${REMGLK_RS_LIB_FOLDER}/libremglk_capi.a)
    em_link_js_library(${target} "remglk/remglk_capi/src/systems/library_emglken.js")
    em_link_pre_js(${target} "src/preamble.js")
    target_link_options(${target} PRIVATE
        # Required options
        -sALLOW_MEMORY_GROWTH=1
        -sALLOW_UNIMPLEMENTED_SYSCALLS
        -sASYNCIFY=1
        #-sASYNCIFY_IGNORE_INDIRECT=1
        #-sASYNCIFY_REMOVE=['gli_get_*','glk_get_*']
        -sASYNCIFY_STACK_SIZE=8192
        -sEXIT_RUNTIME=1
        #-sEXPORTED_FUNCTIONS=['_main','_gidispatch_get_game_id']
        #-sEXPORTED_RUNTIME_METHODS=['AsciiToString','FS']
        -sFILESYSTEM=0
        -sINCOMING_MODULE_JS_API=[arguments,locateFile,wasmBinary]
        -sINVOKE_RUN=0
        -sSTRICT=1
        #-Wl,--wrap=getc,--wrap=ungetc
        # Debugging options
        #-g
        #-sASSERTIONS
        #-sASYNCIFY_ADVISE
        #-sINLINING_LIMIT=1
        # Output options
        --minify 0
        # TODO: This might be a lot bigger with Rust, consider disabling in Release
        --profiling-funcs
        -sENVIRONMENT=web
        -sEXPORT_ES6=1
        -sMODULARIZE=1
        # Optimisations
        -sTEXTDECODER=2
    )
    if (${CMAKE_BUILD_TYPE} STREQUAL Release)
        target_link_options(${target} PRIVATE -O3)
    endif()
    # For debugging "null function or function signature mismatch" errors (but this requires lots of RAM)
    #target_compile_options(${target} PRIVATE -fsanitize=undefined)
    #target_link_options(${target} PRIVATE -fsanitize=undefined)
endfunction()