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
        -sASYNCIFY_STACK_SIZE=8192
        -sEXIT_RUNTIME=1
        # Export _setThrew until https://github.com/emscripten-core/emscripten/issues/22227 is fixed
        -sEXPORTED_FUNCTIONS=_main,_setThrew
        -sFILESYSTEM=0
        -sINCOMING_MODULE_JS_API=[locateFile,wasmBinary]
        -sINVOKE_RUN=0
        -sSTRICT=1
        # Debugging options
        #-g
        #-sASSERTIONS
        #-sASYNCIFY_ADVISE
        #-sINLINING_LIMIT=1
        # Output options
        --minify 0
        --profiling-funcs
        -sENVIRONMENT=node,web
        -sEXPORT_ES6=1
        -sMODULARIZE=1
        # Optimisations
        -sTEXTDECODER=2
    )
    # For debugging "null function or function signature mismatch" errors (but this requires lots of RAM)
    #target_compile_options(${target} PRIVATE -fsanitize=undefined)
    #target_link_options(${target} PRIVATE -fsanitize=undefined)
endfunction()