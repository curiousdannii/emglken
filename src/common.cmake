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
        -Wl,--wrap=getc,--wrap=ungetc
        -O3
        --minify 0
        -sASYNCIFY=1
        -sASYNCIFY_IMPORTS=['emglken_fill_stdin_buffer']
        #-sENVIRONMENT=web
        -sEXIT_RUNTIME=1
        #-sEXPORT_ES6=1
        -sEXTRA_EXPORTED_RUNTIME_METHODS=['FS']
        -sMODULARIZE=1
        -sSTRICT=1
        -sTEXTDECODER=2
        -sWASM=1)
    #emglken_whitelist(${target} ${VM_OPTS_EMTERPRETIFY_WHITELIST})
endfunction()

# Setup an EMTERPRETIFY whitelist file to be dependended on
# From https://github.com/emscripten-core/emscripten/blob/master/cmake/Modules/Platform/Emscripten.cmake
function(emglken_whitelist target jsfile)
    # If the user edits the JS file, we want to relink the emscripten
    # application, but unfortunately it is not possible to make a link step
    # depend directly on a source file. Instead, we must make a dummy no-op
    # build target on that source file, and make the project depend on
    # that target.

    # Sanitate the source .js filename to a good symbol name to use as a dummy
    # filename.
    get_filename_component(jsname "${jsfile}" NAME)
    string(REGEX REPLACE "[/:\\\\.\ ]" "_" dummy_js_target ${jsname})
    set(dummy_lib_name ${target}_${link_js_counter}_${dummy_js_target})
    set(dummy_c_name "${CMAKE_BINARY_DIR}/${dummy_js_target}_tracker.c")

    # Create a new static library target that with a single dummy .c file.
    add_library(${dummy_lib_name} STATIC ${dummy_c_name})
    # Make the dummy .c file depend on the .js file we are linking, so that if
    # the .js file is edited, the dummy .c file, and hence the static library
    # will be rebuild (no-op). This causes the main application to be
    # relinked, which is what we want.  This approach was recommended by
    # http://www.cmake.org/pipermail/cmake/2010-May/037206.html
    add_custom_command(OUTPUT ${dummy_c_name} COMMAND ${CMAKE_COMMAND} -E touch ${dummy_c_name} DEPENDS ${jsfile})
    target_link_libraries(${target} ${dummy_lib_name})

    # Link the js-library to the target
    # When a linked library starts with a "-" cmake will just add it to the
    # linker command line as it is.  The advantage of doing it this way is
    # that the js-library will also be automatically linked to targets that
    # depend on this target.
    get_filename_component(js_file_absolute_path "${jsfile}" ABSOLUTE )
    target_link_options(${target} PRIVATE "SHELL:-s EMTERPRETIFY_WHITELIST=@${js_file_absolute_path}")
endfunction()

# Bundle VM
function(make_bundle target core-target varname runner)
    get_filename_component(runnerdest ${runner} NAME)
    string(PREPEND runnerdest "runner-")
    add_custom_command(OUTPUT ${target}
        DEPENDS ${core-target} ${runner} ${CMAKE_SOURCE_DIR}/emglken/include/create_fake_stream.js ${CMAKE_SOURCE_DIR}/emglken/include/vm.js
        COMMAND cp ${CMAKE_SOURCE_DIR}/${runner} ${CMAKE_CURRENT_BINARY_DIR}/${runnerdest}
        COMMAND cp ${CMAKE_SOURCE_DIR}/emglken/include/create_fake_stream.js ${CMAKE_CURRENT_BINARY_DIR}/create_fake_stream.js
        COMMAND cp ${CMAKE_SOURCE_DIR}/emglken/include/vm.js ${CMAKE_CURRENT_BINARY_DIR}/vm.js
        COMMAND browserify ${CMAKE_CURRENT_BINARY_DIR}/${runnerdest} --bare --igv x --standalone ${varname} > ${CMAKE_CURRENT_BINARY_DIR}/${target}
        COMMAND rm ${CMAKE_CURRENT_BINARY_DIR}/${runnerdest} ${CMAKE_CURRENT_BINARY_DIR}/create_fake_stream.js ${CMAKE_CURRENT_BINARY_DIR}/vm.js)
    add_custom_target(${varname}-${target} ALL DEPENDS ${target})
endfunction()