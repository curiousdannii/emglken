# Add sources to a target from a specified directory
function(add_sources target dir)
    cmake_parse_arguments(PARSE_ARGV 2 ADD "" "" "SRCS")
    list(TRANSFORM ADD_SRCS PREPEND ${dir})
    target_sources(${target} PRIVATE ${ADD_SRCS})
    target_include_directories(${target} PRIVATE ${dir})
endfunction()

# Add common arguments and dependencies
function(emglken_vm target)
    target_link_libraries(${target} remglk)
    target_link_options(${target} PRIVATE
        # Required options
        -sALLOW_MEMORY_GROWTH=1
        -sALLOW_UNIMPLEMENTED_SYSCALLS
        -sASYNCIFY=1
        #-sASYNCIFY_ADVISE=1
        -sASYNCIFY_IGNORE_INDIRECT=1
        -sASYNCIFY_REMOVE=['gli_get_*','glk_get_*']
        -sENVIRONMENT=web
        -sEXIT_RUNTIME=1
        #-sEXPORT_ES6=1
        -sEXPORTED_FUNCTIONS=['_main','_gidispatch_get_game_id']
        -sEXPORTED_RUNTIME_METHODS=['AsciiToString','FS']
        -sMODULARIZE=1
        -sSTRICT=1
        -sWASM=1
        -Wl,--wrap=getc,--wrap=ungetc
        # Optimisations
        --minify 0
        -O3
        -sTEXTDECODER=2
    )
endfunction()