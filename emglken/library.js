/*

Emglken Emscripten library
==========================

Copyright (c) 2018 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

// These functions need GiDispa and Glk to be passed in the Module options object

var emglken = {

	window_from_ptr__postset: `var Glk=Module['Glk'],GiDispa=Module['GiDispa'];`,

	// Use the struct's first entry, the tag, to find the JS objects
	fileref_from_ptr: function( frefptr )
	{
		return GiDispa.class_obj_from_id( 'fileref', {{{ makeGetValue( 'frefptr', '0', 'i32' ) }}} )
	},

	stream_from_ptr: function( strptr )
	{
		return GiDispa.class_obj_from_id( 'stream', {{{ makeGetValue( 'strptr', '0', 'i32' ) }}} )
	},

	window_from_ptr: function( winptr )
	{
		return GiDispa.class_obj_from_id( 'window', {{{ makeGetValue( 'winptr', '0', 'i32' ) }}} )
	},

	// Functions for filling time and date structs
	glem_date_box_from_struct: function( dateptr )
	{
		for ( var datebox = new Glk.RefStruct(), i = 0; i < 8; i++ )
		{
			datebox.set_field( i, {{{ makeGetValue( 'dateptr', '4 * i', 'i32' ) }}} )
		}
		return datebox
	},

	glem_date_box_to_struct: function( datebox, dateptr )
	{
		for ( var i = 0; i < 8; i++ )
		{
			{{{ makeSetValue( 'dateptr', '4 * i', 'datebox.fields[i]', 'i32' ) }}}
		}
	},

	glem_time_box_from_struct: function( timeptr )
	{
		var timebox = new Glk.RefStruct()
		timebox.set_field( 0, {{{ makeGetValue( 'timeptr', '0', 'i32' ) }}} )
		timebox.set_field( 1, {{{ makeGetValue( 'timeptr', '4', 'i32', undefined, 1 ) }}} )
		timebox.set_field( 2, {{{ makeGetValue( 'timeptr', '8', 'i32' ) }}} )
		return timebox
	},

	glem_time_box_to_struct: function( timebox, timeptr )
	{
		for ( var i = 0; i < 3; i++ )
		{
			{{{ makeSetValue( 'timeptr', '4 * i', 'timebox.fields[i]', 'i32' ) }}}
		}
	},

	// GlkApi's unicode functions are not TypedArray safe, so we must convert to normal arrays
	// See https://github.com/erkyrath/glkote/issues/27
	glem_buffer_helper: function( func, bufaddr, len, numchars, lowerrest )
	{
		var buf = Array.prototype.slice.call( new Uint32Array( buffer, bufaddr, len ) )
		var newlen = Glk[ func ]( buf, numchars, lowerrest )
		HEAPU8.set( new Uint8Array( Uint32Array.from( buf ).slice( 0, len ).buffer ), bufaddr )
		return newlen
	},

	glk_buffer_canon_decompose_uni__deps: [ 'glem_buffer_helper' ],
	glk_buffer_canon_decompose_uni: function( bufaddr, len, numchars )
	{
		return _glem_buffer_helper( 'glk_buffer_canon_decompose_uni', bufaddr, len, numchars )
	},

	glk_buffer_canon_normalize_uni__deps: [ 'glem_buffer_helper' ],
	glk_buffer_canon_normalize_uni: function( bufaddr, len, numchars )
	{
		return _glem_buffer_helper( 'glk_buffer_canon_normalize_uni', bufaddr, len, numchars )
	},

	glk_buffer_to_lower_case_uni__deps: [ 'glem_buffer_helper' ],
	glk_buffer_to_lower_case_uni: function( bufaddr, len, numchars )
	{
		return _glem_buffer_helper( 'glk_buffer_to_lower_case_uni', bufaddr, len, numchars )
	},

	glk_buffer_to_upper_case_uni__deps: [ 'glem_buffer_helper' ],
	glk_buffer_to_upper_case_uni: function( bufaddr, len, numchars )
	{
		return _glem_buffer_helper( 'glk_buffer_to_upper_case_uni', bufaddr, len, numchars )
	},

	glk_buffer_to_title_case_uni__deps: [ 'glem_buffer_helper' ],
	glk_buffer_to_title_case_uni: function( bufaddr, len, numchars, lowerrest )
	{
		return _glem_buffer_helper( 'glk_buffer_to_title_case_uni', bufaddr, len, numchars, lowerrest )
	},

	glk_cancel_char_event: function( window )
	{
		Glk.glk_cancel_char_event( _window_from_ptr( window ) )
	},

	glk_cancel_hyperlink_event: function( window )
	{
		Glk.glk_cancel_hyperlink_event( _window_from_ptr( window ) )
	},

	glk_cancel_line_event: function( winptr, eventptr )
	{
		var glk_event = new Glk.RefStruct()
		Glk.glk_cancel_line_event( _window_from_ptr( winptr ), glk_event )
		if ( eventptr )
		{
			{{{ makeSetValue( 'eventptr', '0', 'glk_event.fields[0]', 'i32' ) }}}
			{{{ makeSetValue( 'eventptr', '4', 'glk_event.fields[1].addr', 'i32' ) }}}
			{{{ makeSetValue( 'eventptr', '8', 'glk_event.fields[2]', 'i32' ) }}}
			{{{ makeSetValue( 'eventptr', '12', 'glk_event.fields[3]', 'i32' ) }}}
		}
	},

	glk_cancel_mouse_event: function( window )
	{
		Glk.glk_cancel_mouse_event( _window_from_ptr( window ) )
	},

	glk_current_simple_time: function( factor )
	{
		return Glk.glk_current_simple_time( factor )
	},

	glk_current_time__deps: [ 'glem_time_box_to_struct' ],
	glk_current_time: function( timeptr )
	{
		var timebox = new Glk.RefStruct()
		Glk.glk_current_time( timebox )
		_glem_time_box_to_struct( timebox, timeptr )
	},

	glk_date_to_simple_time_local__deps: [ 'glem_date_box_from_struct' ],
	glk_date_to_simple_time_local: function( dateptr, factor )
	{
		return Glk.glk_date_to_simple_time_local( _glem_date_box_from_struct( dateptr ), factor )
	},

	glk_date_to_simple_time_utc__deps: [ 'glem_date_box_from_struct' ],
	glk_date_to_simple_time_utc: function( dateptr, factor )
	{
		return Glk.glk_date_to_simple_time_utc( _glem_date_box_from_struct( dateptr ), factor )
	},

	glk_date_to_time_local__deps: [ 'glem_date_box_from_struct', 'glem_time_box_to_struct' ],
	glk_date_to_time_local: function( dateptr, timeptr )
	{
		var timebox = new Glk.RefStruct()
		Glk.glk_date_to_time_local( _glem_date_box_from_struct( dateptr ), timebox )
		_glem_time_box_to_struct( timebox, timeptr )
	},

	glk_date_to_time_utc__deps: [ 'glem_date_box_from_struct', 'glem_time_box_to_struct' ],
	glk_date_to_time_utc: function( dateptr, timeptr )
	{
		var timebox = new Glk.RefStruct()
		Glk.glk_date_to_time_utc( _glem_date_box_from_struct( dateptr ), timebox )
		_glem_time_box_to_struct( timebox, timeptr )
	},

	glem_exit: function()
	{
		Glk.glk_exit()
		Glk.update()
	},

	glem_fatal_error: function( msg )
	{
		Glk.fatal_error( AsciiToString( msg ) )
	},

	glk_fileref_create_by_name: function( usage, name, rock )
	{
		var fref = Glk.glk_fileref_create_by_name( usage, AsciiToString( name ), rock )
		return fref ? fref.addr : 0
	},

	glk_fileref_create_by_prompt: function( usage, fmode, rock )
	{
		return EmterpreterAsync.handle( function( resume )
		{
			Glk.glk_fileref_create_by_prompt( usage, fmode, rock )
			Module.glem_callback = function( fref )
			{
				resume( function()
				{
					return fref ? fref.addr : 0
				})
			}
			Glk.update()
		})
	},

	glk_fileref_create_from_fileref: function( usage, oldfrefptr, rock )
	{
		var fref = Glk.glk_fileref_create_from_fileref( usage, _fileref_from_ptr( oldfrefptr ), rock )
		return fref ? fref.addr : 0
	},

	glk_fileref_create_temp: function( usage, rock )
	{
		var fref = Glk.glk_fileref_create_temp( usage, rock )
		return fref ? fref.addr : 0
	},

	glk_fileref_delete_file: function( fref )
	{
		Glk.glk_fileref_delete_file( _fileref_from_ptr( fref ) )
	},

	glk_fileref_destroy: function( frefptr )
	{
		Glk.glk_fileref_destroy( _fileref_from_ptr( frefptr ) )
	},

	glk_fileref_does_file_exist: function( fref )
	{
		return Glk.glk_fileref_does_file_exist( _fileref_from_ptr( fref ) )
	},

	glk_gestalt_ext: function( sel, val, arraddr, arrlen )
	{
		var arr = new Uint32Array( buffer, arraddr, arrlen )
		return Glk.glk_gestalt_ext( sel, val, arr )
	},

	glk_get_buffer_stream: function( str, bufaddr, len )
	{
		return Glk.glk_get_buffer_stream( _stream_from_ptr( str ), new Uint8Array( buffer, bufaddr, len ) )
	},

	glk_get_buffer_stream_uni: function( str, bufaddr, len )
	{
		return Glk.glk_get_buffer_stream_uni( _stream_from_ptr( str ), new Uint32Array( buffer, bufaddr, len ) )
	},

	glk_get_char_stream: function( str )
	{
		return Glk.glk_get_char_stream( _stream_from_ptr( str ) )
	},

	glk_get_char_stream_uni: function( str )
	{
		return Glk.glk_get_char_stream_uni( _stream_from_ptr( str ) )
	},

	glk_get_line_stream: function( str, bufaddr, len )
	{
		return Glk.glk_get_line_stream( _stream_from_ptr( str ), new Uint8Array( buffer, bufaddr, len ) )
	},

	glk_get_line_stream_uni: function( str, bufaddr, len )
	{
		return Glk.glk_get_line_stream_uni( _stream_from_ptr( str ), new Uint32Array( buffer, bufaddr, len ) )
	},

	glem_get_pending_unregister_arr: function( objptr, buf, maxlen, unicode )
	{
		if ( Module.vm.pending_unregister_arr )
		{
			var data = Module.vm.pending_unregister_arr
			Module.vm.pending_unregister_arr = null
			{{{ makeSetValue( 'objptr', '0', 'data[0]', 'i32' ) }}}
			{{{ makeSetValue( 'buf', '0', 'data[1]', 'i32' ) }}}
			{{{ makeSetValue( 'maxlen', '0', 'data[2]', 'i32' ) }}}
			{{{ makeSetValue( 'unicode', '0', 'data[3]', 'i32' ) }}}
		}
		else
		{
			{{{ makeSetValue( 'objptr', '0', '0', 'i32' ) }}}
		}
	},

	glk_image_draw: function( window, image, val1, val2 )
	{
		return Glk.glk_image_draw( _window_from_ptr( window ), image, val1, val2 )
	},

	glk_image_draw_scaled: function( window, image, val1, val2, width, height )
	{
		return Glk.glk_image_draw_scaled( _window_from_ptr( window ), image, val1, val2, width, height )
	},

	glk_image_get_info: function( image, width, height )
	{
		var widthBox = new Glk.RefBox()
		var heightBox = new Glk.RefBox()
		var res =  Glk.glk_image_get_info( image, widthBox, heightBox )
		if ( width )
		{
			{{{ makeSetValue( 'width', '0', 'widthBox.value', 'i32' ) }}}
		}
		if ( height )
		{
			{{{ makeSetValue( 'height', '0', 'heightBox.value', 'i32' ) }}}
		}
		return res
	},

	glk_put_buffer: function( bufaddr, len )
	{
		Glk.glk_put_buffer( new Uint8Array( buffer, bufaddr, len ) )
	},

	glk_put_buffer_stream: function( str, bufaddr, len )
	{
		Glk.glk_put_buffer_stream( _stream_from_ptr( str ), new Uint8Array( buffer, bufaddr, len ) )
	},

	glk_put_buffer_uni: function( bufaddr, len )
	{
		Glk.glk_put_buffer_uni( new Uint32Array( buffer, bufaddr, len ) )
	},

	glk_put_buffer_stream_uni: function( str, bufaddr, len )
	{
		Glk.glk_put_buffer_stream_uni( _stream_from_ptr( str ), new Uint32Array( buffer, bufaddr, len ) )
	},

	glk_put_char: function( ch )
	{
		Glk.glk_put_char( ch )
	},

	glk_put_char_stream: function( str, ch )
	{
		Glk.glk_put_char_stream( _stream_from_ptr( str ), ch )
	},

	glk_put_char_stream_uni: function( str, ch )
	{
		Glk.glk_put_char_stream_uni( _stream_from_ptr( str ), ch )
	},

	glk_put_char_uni: function( ch )
	{
		Glk.glk_put_char_uni( ch )
	},

	glk_put_string: function( string )
	{
		Glk.glk_put_string( AsciiToString( string ) )
	},

	glk_put_string_stream: function( str, string )
	{
		Glk.glk_put_string_stream( _stream_from_ptr( str ), AsciiToString( string ) )
	},

	glk_put_string_stream_uni: function( str, string )
	{
		Glk.glk_put_string_stream_uni( _stream_from_ptr( str ), UTF32ToString( string ) )
	},

	glk_put_string_uni: function( string )
	{
		Glk.glk_put_string_uni( UTF32ToString( string ) )
	},

	glk_request_char_event: function( window )
	{
		Glk.glk_request_char_event( _window_from_ptr( window ) )
	},

	glk_request_char_event_uni: function( window )
	{
		Glk.glk_request_char_event_uni( _window_from_ptr( window ) )
	},

	glk_request_hyperlink_event: function( window )
	{
		Glk.glk_request_hyperlink_event( _window_from_ptr( window ) )
	},

	glk_request_line_event: function( winptr, bufaddr, maxlen, initlen )
	{
		var win = _window_from_ptr( winptr )
		var buf = new Uint8Array( buffer, bufaddr, maxlen )
		Glk.glk_request_line_event( win, buf, initlen )
		GiDispa.retain_array( buf, { addr: bufaddr, objaddr: win.addr } )
	},

	glk_request_line_event_uni: function( winptr, bufaddr, maxlen, initlen )
	{
		var win = _window_from_ptr( winptr )
		var buf = new Uint32Array( buffer, bufaddr, maxlen )
		Glk.glk_request_line_event_uni( win, buf, initlen )
		GiDispa.retain_array( buf, { addr: bufaddr, objaddr: win.addr, unicode: 1 } )
	},

	glk_request_mouse_event: function( window )
	{
		Glk.glk_request_mouse_event( _window_from_ptr( window ) )
	},

	glk_request_timer_events: function( ms )
	{
		Glk.glk_request_timer_events( ms )
	},

	glem_restore_glkapi: function()
	{
		Glk.restore_allstate( Module.vm.snapshot.glk )
	},

	glem_select: function( eventptr )
	{
		EmterpreterAsync.handle( function( resume )
		{
			var glk_event = new Glk.RefStruct()
			Module.vm.running_glk_select = 1
			Glk.glk_select( glk_event )
			Module.glem_callback = function()
			{
				var win = glk_event.fields[1]
				{{{ makeSetValue( 'eventptr', '0', 'glk_event.fields[0]', 'i32' ) }}}
				{{{ makeSetValue( 'eventptr', '4', '( win ? win.addr : 0 )', 'i32' ) }}}
				{{{ makeSetValue( 'eventptr', '8', 'glk_event.fields[2]', 'i32' ) }}}
				{{{ makeSetValue( 'eventptr', '12', 'glk_event.fields[3]', 'i32' ) }}}
				Module.vm.running_glk_select = 0
				resume()
			}
			Glk.update()
		})
	},

	glk_select_poll: function( eventptr )
	{
		var glk_event = new Glk.RefStruct()
		Glk.glk_select_poll( glk_event )
		var win = glk_event.fields[1]
		{{{ makeSetValue( 'eventptr', '0', 'glk_event.fields[0]', 'i32' ) }}}
		{{{ makeSetValue( 'eventptr', '4', '( win ? win.addr : 0 )', 'i32' ) }}}
		{{{ makeSetValue( 'eventptr', '8', 'glk_event.fields[2]', 'i32' ) }}}
		{{{ makeSetValue( 'eventptr', '12', 'glk_event.fields[3]', 'i32' ) }}}
	},

	glk_set_echo_line_event: function( window, val )
	{
		Glk.glk_set_echo_line_event( _window_from_ptr( window ), val )
	},

	glk_set_hyperlink: function( linkval )
	{
		Glk.glk_set_hyperlink( linkval )
	},

	glk_set_hyperlink_stream: function( str, linkval )
	{
		Glk.glk_set_hyperlink_stream( _stream_from_ptr( str ), linkval )
	},

	garglk_set_reversevideo: function( reverse )
	{
		Glk.garglk_set_reversevideo( reverse )
	},

	garglk_set_reversevideo_stream: function( str, reverse )
	{
		Glk.garglk_set_reversevideo_stream( _stream_from_ptr( str ), reverse )
	},

	glk_set_style: function( style )
	{
		Glk.glk_set_style( style )
	},

	glk_set_style_stream: function( str, style )
	{
		Glk.glk_set_style_stream( _stream_from_ptr( str ), style )
	},

	glk_set_terminators_line_event: function( window, arraddr, count )
	{
		var arr = new Uint32Array( buffer, arraddr, count )
		Glk.glk_set_terminators_line_event( _window_from_ptr( window ), arr )
	},

	glk_set_window: function( winptr )
	{
		Glk.glk_set_window( _window_from_ptr( winptr ) )
	},

	garglk_set_zcolors: function( fg, bg )
	{
		Glk.garglk_set_zcolors( fg, bg )
	},

	garglk_set_zcolors_stream: function( str, fg, bg )
	{
		Glk.garglk_set_zcolors_stream( _stream_from_ptr( str ), fg, bg )
	},

	glk_simple_time_to_date_local__deps: [ 'glem_date_box_to_struct' ],
	glk_simple_time_to_date_local: function( time, factor, dateptr )
	{
		var datebox = new Glk.RefStruct()
		Glk.glk_simple_time_to_date_local( time, factor, datebox )
		_glem_date_box_to_struct( datebox, dateptr )
	},

	glk_simple_time_to_date_utc__deps: [ 'glem_date_box_to_struct' ],
	glk_simple_time_to_date_utc: function( time, factor, dateptr )
	{
		var datebox = new Glk.RefStruct()
		Glk.glk_simple_time_to_date_utc( time, factor, datebox )
		_glem_date_box_to_struct( datebox, dateptr )
	},

	glk_stream_close: function( strptr, resultstruct )
	{
		var str = _stream_from_ptr( strptr )
		if ( str && resultstruct )
		{
			{{{ makeSetValue( 'resultstruct', '0', 'str.readcount', 'i32' ) }}}
			{{{ makeSetValue( 'resultstruct', '4', 'str.writecount', 'i32' ) }}}
		}
		Glk.glk_stream_close( str )
	},

	// Close all file streams
	gli_streams_close_all: function()
	{
		var oldstr, str
		while ( str = Glk.glk_stream_iterate( oldstr ) )
		{
			if ( str.type === 1 )
			{
				Glk.glk_stream_close( str )
			}
			else
			{
				oldstr = str
			}
		}
	},

	glk_stream_get_current: function()
	{
		var str = Glk.glk_stream_get_current()
		return str ? str.addr : 0
	},

	glk_stream_get_position: function( str )
	{
		return Glk.glk_stream_get_position( _stream_from_ptr( str ) )
	},

	glk_stream_open_file: function( frefptr, fmode, rock )
	{
		var fileref = _fileref_from_ptr( frefptr )
		var str = Glk.glk_stream_open_file( fileref, fmode, rock )
		return str ? str.addr : 0
	},

	glk_stream_open_file_uni: function( frefptr, fmode, rock )
	{
		var fileref = _fileref_from_ptr( frefptr )
		var str = Glk.glk_stream_open_file_uni( fileref, fmode, rock )
		return str ? str.addr : 0
	},

	glk_stream_open_memory: function( bufaddr, buflen, fmode, rock )
	{
		var buf = new Uint8Array( buffer, bufaddr, buflen )
		var str = Glk.glk_stream_open_memory( buf, fmode, rock )
		GiDispa.retain_array( buf, { addr: bufaddr, objaddr: str.addr } )
		return str ? str.addr : 0
	},

	glk_stream_open_memory_uni: function( bufaddr, buflen, fmode, rock )
	{
		var buf = new Uint32Array( buffer, bufaddr, buflen )
		var str = Glk.glk_stream_open_memory_uni( buf, fmode, rock )
		GiDispa.retain_array( buf, { addr: bufaddr, objaddr: str.addr, unicode: 1 } )
		return str ? str.addr : 0
	},

	glk_stream_open_resource: function( filenum, rock )
	{
		var str = Glk.glk_stream_open_resource( filenum, rock )
		return str ? str.addr : 0
	},

	glk_stream_open_resource_uni: function( filenum, rock )
	{
		var str = Glk.glk_stream_open_resource_uni( filenum, rock )
		return str ? str.addr : 0
	},

	glk_stream_set_current: function( strptr )
	{
		Glk.glk_stream_set_current( _stream_from_ptr( strptr ) )
	},

	glk_stream_set_position: function( strptr, pos, seekmode )
	{
		Glk.glk_stream_set_position( _stream_from_ptr( strptr ), pos, seekmode )
	},

	glk_style_distinguish: function( win, style1, style2 )
	{
		return Glk.glk_style_distinguish( _window_from_ptr( win ), style1, style2 )
	},

	glk_stylehint_clear: function( wintype, style, hint)
	{
		Glk.glk_stylehint_clear( wintype, style, hint)
	},

	glk_stylehint_set: function( wintype, style, hint, value)
	{
		Glk.glk_stylehint_set( wintype, style, hint, value)
	},

	glk_style_measure: function( win, style, hint, resultptr )
	{
		var resultBox = new Glk.RefBox()
		var retval = Glk.glk_style_measure( _window_from_ptr( win ), style, hint, resultBox )
		if ( resultptr )
		{
			{{{ makeSetValue( 'resultptr', '0', 'resultBox.value', 'i32' ) }}}
		}
		return retval
	},

	glk_time_to_date_local__deps: [ 'glem_date_box_to_struct', 'glem_time_box_from_struct' ],
	glk_time_to_date_local: function( timeptr, dateptr )
	{
		var datebox = new Glk.RefStruct()
		Glk.glk_time_to_date_local( _glem_time_box_from_struct( timeptr ), datebox )
		_glem_date_box_to_struct( datebox, dateptr )
	},

	glk_time_to_date_utc__deps: [ 'glem_date_box_to_struct', 'glem_time_box_from_struct' ],
	glk_time_to_date_utc: function( timeptr, dateptr )
	{
		var datebox = new Glk.RefStruct()
		Glk.glk_time_to_date_utc( _glem_time_box_from_struct( timeptr ), datebox )
		_glem_date_box_to_struct( datebox, dateptr )
	},

	glem_try_autorestore: function( ramStreamPtr, miscStreamPtr )
	{
		var vm = Module.vm
		var Dialog = vm.options.Dialog
		if ( Dialog )
		{
			if ( vm.options.clear_vm_autosave )
			{
				Dialog.autosave_write( vm.signature, null )
			}
			else if ( vm.options.do_vm_autosave )
			{
				try
				{
					var snapshot = Dialog.autosave_read( vm.signature )
					if ( snapshot )
					{
						vm.snapshot = snapshot

						// Create the streams
						var ramstr = Glk.glk_stream_open_memory( new Uint8Array( snapshot.ram ), 2, 0 )
						var miscstr = Glk.glk_stream_open_memory_uni( Uint32Array.from( snapshot.misc ), 2, 0 )
						{{{ makeSetValue( 'ramStreamPtr', '0', 'ramstr.addr', 'i32' ) }}}
						{{{ makeSetValue( 'miscStreamPtr', '0', 'miscstr.addr', 'i32' ) }}}
						return 1
					}
				}
				catch (ex)
				{
					//this.log( 'Autorestore failed, deleting it' )
					Dialog.autosave_write( vm.signature, null )
				}
			}
		}
	},

	glk_window_clear: function( window )
	{
		Glk.glk_window_clear( _window_from_ptr( window ) )
	},

	glk_window_close: function( winptr, resultstruct )
	{
		var win = _stream_from_ptr( winptr )
		if ( win && resultstruct )
		{
			{{{ makeSetValue( 'resultstruct', '0', 'win.str.readcount', 'i32' ) }}}
			{{{ makeSetValue( 'resultstruct', '4', 'win.str.writecount', 'i32' ) }}}
		}
		Glk.glk_window_close( win )
	},

	glk_window_erase_rect: function( window, left, top, width, height )
	{
		Glk.glk_window_erase_rect( _window_from_ptr( window ), left, top, width, height )
	},

	glk_window_fill_rect: function( window, color, left, top, width, height )
	{
		Glk.glk_window_fill_rect( _window_from_ptr( window ), color, left, top, width, height )
	},

	glk_window_flow_break: function( window )
	{
		Glk.glk_window_flow_break( _window_from_ptr( window ) )
	},

	glk_window_get_arrangement: function( winptr, methodptr, sizeptr, keywinptr )
	{
		var methodBox = new Glk.RefBox()
		var sizeBox = new Glk.RefBox()
		var keywinBox = new Glk.RefBox()
		Glk.glk_window_get_arrangement( _window_from_ptr( winptr ), methodBox, sizeBox, keywinBox )
		if ( methodptr )
		{
			{{{ makeSetValue( 'methodptr', '0', 'methodBox.value', 'i32' ) }}}
		}
		if ( sizeptr )
		{
			{{{ makeSetValue( 'sizeptr', '0', 'sizeBox.value', 'i32' ) }}}
		}
		if ( keywinptr )
		{
			{{{ makeSetValue( 'keywinptr', '0', 'keywinBox.value.addr', 'i32' ) }}}
		}
	},

	glk_window_get_echo_stream: function( winptr )
	{
		var str = Glk.glk_window_get_echo_stream( _window_from_ptr( winptr ) )
		return str ? str.addr : 0
	},

	glk_window_get_parent: function( winptr )
	{
		var win = Glk.glk_window_get_parent( _window_from_ptr( winptr ) )
		return win ? win.addr : 0
	},

	glk_window_get_root: function()
	{
		var win = Glk.glk_window_get_root()
		return win ? win.addr : 0
	},

	glk_window_get_sibling: function( winptr )
	{
		var win = Glk.glk_window_get_sibling( _window_from_ptr( winptr ) )
		return win ? win.addr : 0
	},

	glk_window_get_size: function( window, width, height )
	{
		var widthBox = new Glk.RefBox()
		var heightBox = new Glk.RefBox()
		Glk.glk_window_get_size( _window_from_ptr( window ), widthBox, heightBox )
		if ( width )
		{
			{{{ makeSetValue( 'width', '0', 'widthBox.value', 'i32' ) }}}
		}
		if ( height )
		{
			{{{ makeSetValue( 'height', '0', 'heightBox.value', 'i32' ) }}}
		}
	},

	glk_window_get_stream: function( winptr )
	{
		var str = Glk.glk_window_get_stream( _window_from_ptr( winptr ) )
		return str.addr
	},

	glk_window_get_type: function( winptr )
	{
		return Glk.glk_window_get_type( _window_from_ptr( winptr ) )
	},

	glk_window_move_cursor: function( window, xpos, ypos )
	{
		Glk.glk_window_move_cursor( _window_from_ptr( window ), xpos, ypos )
	},

	glk_window_open: function( splitwinptr, method, size, wintype, rock )
	{
		var win = Glk.glk_window_open( _window_from_ptr( splitwinptr ), method, size, wintype, rock )
		return win ? win.addr : 0
	},

	glk_window_set_arrangement: function( window, method, size, keywin )
	{
		Glk.glk_window_set_arrangement( _window_from_ptr( window ), method, size, _window_from_ptr( keywin ) )
	},

	glk_window_set_background_color: function( window, color )
	{
		Glk.glk_window_set_background_color( _window_from_ptr( window ), color )
	},

	glk_window_set_echo_stream: function( window, str )
	{
		Glk.glk_window_set_echo_stream( _window_from_ptr( window ), _stream_from_ptr( str ) )
	},

}

function addDeps( object, deps )
{
	for ( var item in object )
	{
		if ( item.substr( -6 ) != '__deps' )
		{
			if ( !object[item + '__deps'] )
			{
				object[item + '__deps'] = deps
			}
		}
	}
}

addDeps( emglken, [
	'$EmterpreterAsync',
	'fileref_from_ptr',
	'stream_from_ptr',
	'window_from_ptr',
] )
mergeInto( LibraryManager.library, emglken )