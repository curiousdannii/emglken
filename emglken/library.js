/*

Emglken Emscripten library
==========================

Copyright (c) 2017 Dannii Willis
MIT licenced
https://github.com/curiousdannii/emglken

*/

// These functions need GiDispa and Glk to be passed in the Module options object

var emglken = {

	window_from_ptr__postset: `var Glk=Module['Glk'],GiDispa=Module['GiDispa'];`,

	// Find JS objects from their id tags
	fileref_from_id: function( tag )
	{
		return GiDispa.class_obj_from_id( 'fileref', tag )
	},

	stream_from_id: function( tag )
	{
		return GiDispa.class_obj_from_id( 'stream', tag )
	},

	window_from_id: function( tag )
	{
		return GiDispa.class_obj_from_id( 'window', tag )
	},

	// Use the struct's first entry, the tag, to find the JS objects
	fileref_from_ptr: function( structptr )
	{
		return _fileref_from_id( getValue( structptr, 'i32' ) )
	},

	stream_from_ptr: function( streamptr )
	{
		return _stream_from_id( getValue( streamptr, 'i32' ) )
	},

	window_from_ptr: function( winptr )
	{
		return _window_from_id( getValue( winptr, 'i32' ) )
	},

	// Given a JS object, return its id tag
	fileref_to_id: function( tag )
	{
		return GiDispa.class_obj_to_id( 'fileref', tag )
	},

	stream_to_id: function( tag )
	{
		return GiDispa.class_obj_to_id( 'stream', tag )
	},

	window_to_id: function( tag )
	{
		return GiDispa.class_obj_to_id( 'window', tag )
	},

	glem_cancel_char_event: function( tag )
	{
		Glk.glk_cancel_char_event( _window_from_id( tag ) )
	},

	glk_cancel_hyperlink_event: function( window )
	{
		Glk.glk_cancel_hyperlink_event( _window_from_ptr( window ) )
	},

	glem_cancel_line_event: function( tag )
	{
		Glk.glk_cancel_line_event( _window_from_id( tag ) )
	},

	glk_cancel_mouse_event: function( window )
	{
		Glk.glk_cancel_mouse_event( _window_from_ptr( window ) )
	},

	glem_exit: function()
	{
		Glk.glk_exit()
		Glk.update()
	},

	glem_fatal_error: function( msg )
	{
		Glk.fatal_error( Pointer_stringify( msg ) )
	},

	glem_fileref_create_by_name: function( usage, name, rock )
	{
		var fref = Glk.glk_fileref_create_by_name( usage, AsciiToString( name ), rock )
		return _fileref_to_id( fref )
	},

#if EMTERPRETIFY_ASYNC
	glem_fileref_create_by_prompt__deps: ['$EmterpreterAsync', 'fileref_to_id'],
	glem_fileref_create_by_prompt: function( usage, fmode, rock, tagptr )
	{
		EmterpreterAsync.handle( function( resume )
		{
			Glk.glk_fileref_create_by_prompt( usage, fmode, rock )
			Module.glem_callback = function( fref )
			{
				if ( ABORT )
				{
					return
				}
				Module.setValue( tagptr, _fileref_to_id( fref ), 'i32' )
				resume()
			}
			Glk.update()
		})
	},
#endif

#if ASYNCIFY
	glem_fileref_create_by_prompt__deps: ['emscripten_async_resume', 'fileref_to_id'],
	glem_fileref_create_by_prompt: function( usage, fmode, rock, tagptr )
	{
		Glk.glk_fileref_create_by_prompt( usage, fmode, rock )
		//Module['asm'].setAsync()
		asm.setAsync()
		Module.glem_callback = function( fref )
		{
			if ( ABORT )
			{
				return
			}
			Module.setValue( tagptr, _fileref_to_id( fref ), 'i32' )
			_emscripten_async_resume()
		}
		Glk.update()
	},
#endif

	glem_fileref_create_from_fileref: function( usage, oldtag, rock )
	{
		var fref = Glk.glk_fileref_create_from_fileref( usage, _fileref_from_id( oldtag ), rock )
		return _fileref_to_id( fref )
	},

	glem_fileref_create_temp: function( usage, rock )
	{
		var fref = Glk.glk_fileref_create_temp( usage, rock )
		return _fileref_to_id( fref )
	},

	glk_fileref_delete_file: function( fref )
	{
		Glk.glk_fileref_delete_file( _fileref_from_ptr( fref ) )
	},

	glem_fileref_destroy: function( tag )
	{
		Glk.glk_fileref_destroy( _fileref_from_id( tag ) )
	},

	glk_fileref_does_file_exist: function( fref )
	{
		return Glk.glk_fileref_does_file_exist( _fileref_from_ptr( fref ) )
	},

	glk_gestalt_ext: function( sel, val, arraddr, arrlen )
	{
		var arr = new Uint32Array( HEAPU8.buffer, arraddr, arrlen )
		return Glk.glk_gestalt_ext( sel, val, arr )
	},

	glk_get_buffer_stream: function( str, bufaddr, len )
	{
		return Glk.glk_get_buffer_stream( _stream_from_ptr( str ), new Uint8Array( HEAPU8.buffer, bufaddr, len ) )
	},

	glk_get_buffer_stream_uni: function( str, bufaddr, len )
	{
		return Glk.glk_get_buffer_stream_uni( _stream_from_ptr( str ), new Uint32Array( HEAPU8.buffer, bufaddr, len ) )
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
		return Glk.glk_get_line_stream( _stream_from_ptr( str ), new Uint8Array( HEAPU8.buffer, bufaddr, len ) )
	},

	glk_get_line_stream_uni: function( str, bufaddr, len )
	{
		return Glk.glk_get_line_stream_uni( _stream_from_ptr( str ), new Uint32Array( HEAPU8.buffer, bufaddr, len ) )
	},

	glem_get_window_stream_tag: function( tag )
	{
		return _window_from_id( tag ).str.disprock
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
			setValue( width, widthBox.value, 'i32' )
		}
		if ( height )
		{
			setValue( height, heightBox.value, 'i32' )
		}
		return res
	},

	glem_new_window: function( splitwin, method, size, wintype, rock, pairwintag )
	{
		var win = Glk.glk_window_open( _window_from_id( splitwin ), method, size, wintype, rock )
		var pairwin = win ? Glk.glk_window_get_parent( win ) : 0
		setValue( pairwintag, _window_to_id( pairwin ), 'i32' )
		return _window_to_id( win )
	},

	glk_put_buffer: function( bufaddr, len )
	{
		Glk.glk_put_buffer( new Uint8Array( HEAPU8.buffer, bufaddr, len ) )
	},

	glk_put_buffer_stream: function( str, bufaddr, len )
	{
		Glk.glk_put_buffer( _stream_from_ptr( str ), new Uint8Array( HEAPU8.buffer, bufaddr, len ) )
	},

	glk_put_buffer_uni: function( bufaddr, len )
	{
		Glk.glk_put_buffer_uni( new Uint32Array( HEAPU8.buffer, bufaddr, len ) )
	},

	glk_put_buffer_stream_uni: function( str, bufaddr, len )
	{
		Glk.glk_put_buffer_uni( _stream_from_ptr( str ), new Uint32Array( HEAPU8.buffer, bufaddr, len ) )
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

	glem_request_char_event: function( tag, unicode )
	{
		var win = _window_from_id( tag )
		if ( unicode )
		{
			Glk.glk_request_char_event_uni( win )
		}
		else
		{
			Glk.glk_request_char_event( win )
		}
	},

	glk_request_hyperlink_event: function( window )
	{
		Glk.glk_request_hyperlink_event( _window_from_ptr( window ) )
	},

	glem_request_line_event: function( tag, bufaddr, maxlen, initlen, unicode )
	{
		var win = _window_from_id( tag )
		if ( unicode )
		{
			var buf = new Uint32Array( HEAPU8.buffer, bufaddr, maxlen )
			Glk.glk_request_line_event_uni( win, buf, initlen )
		}
		else
		{
			var buf = new Uint8Array( HEAPU8.buffer, bufaddr, maxlen )
			Glk.glk_request_line_event( win, buf, initlen )
		}
	},

	glk_request_mouse_event: function( window )
	{
		Glk.glk_request_mouse_event( _window_from_ptr( window ) )
	},

	glk_request_timer_events: function( ms )
	{
		Glk.glk_request_timer_events( ms )
	},

#if EMTERPRETIFY_ASYNC
	glem_select__deps: ['$EmterpreterAsync', 'window_to_id'],
	glem_select: function( data )
	{
		EmterpreterAsync.handle( function( resume )
		{
			var glk_event = new Glk.RefStruct()
			Glk.glk_select( glk_event )
			Module.glem_callback = function()
			{
				if ( ABORT )
				{
					return
				}
				Module.setValue( data, glk_event.get_field( 0 ), 'i32' )
				Module.setValue( data + 4, _window_to_id( glk_event.get_field( 1 ) ), 'i32' )
				Module.setValue( data + 8, glk_event.get_field( 2 ), 'i32' )
				Module.setValue( data + 12, glk_event.get_field( 3 ), 'i32' )
				resume()
			}
			Glk.update()
		})
	},
#endif

#if ASYNCIFY
	glem_select__deps: ['emscripten_async_resume', 'window_to_id'],
	glem_select: function( data )
	{
		var glk_event = new Glk.RefStruct()
		Glk.glk_select( glk_event )
		//Module['asm'].setAsync()
		asm.setAsync()
		Module.glem_callback = function()
		{
			if ( ABORT )
			{
				return
			}
			Module.setValue( data, glk_event.get_field( 0 ), 'i32' )
			Module.setValue( data + 4, _window_to_id( glk_event.get_field( 1 ) ), 'i32' )
			Module.setValue( data + 8, glk_event.get_field( 2 ), 'i32' )
			Module.setValue( data + 12, glk_event.get_field( 3 ), 'i32' )
			_emscripten_async_resume()
		}
		Glk.update()
	},
#endif

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
		var arr = new Uint32Array( HEAPU8.buffer, arraddr, count )
		Glk.glk_set_terminators_line_event( _window_from_ptr( window ), arr )
	},

	glem_stream_close: function( tag, resultstruct )
	{
		var results = new Glk.RefStruct()
		Glk.glk_stream_close( _stream_from_id( tag ), results )
		if ( resultstruct )
		{
			setValue( resultstruct, results.get_field( 0 ), 'i32' )
			setValue( resultstruct + 4, results.get_field( 1 ), 'i32' )
		}
	},

	glk_stream_get_position: function( str )
	{
		return Glk.glk_stream_get_position( _stream_from_ptr( str ) )
	},

	glem_stream_open_file: function( freftag, fmode, rock, unicode )
	{
		var fileref = _fileref_from_id( freftag )
		var str
		if ( unicode )
		{
			str = Glk.glk_stream_open_file_uni( fileref, fmode, rock )
		}
		else
		{
			str = Glk.glk_stream_open_file( fileref, fmode, rock )
		}
		return _stream_to_id( str )
	},

	glem_stream_open_memory: function( bufaddr, buflen, fmode, rock, unicode )
	{
		var buf
		var str
		if ( unicode )
		{
			buf = new Uint32Array( HEAPU8.buffer, bufaddr, buflen )
			str = Glk.glk_stream_open_memory_uni( buf, fmode, rock )
		}
		else
		{
			buf = new Uint8Array( HEAPU8.buffer, bufaddr, buflen )
			str = Glk.glk_stream_open_memory( buf, fmode, rock )
		}
		return _stream_to_id( str )
	},

	glem_stream_open_resource: function( filenum, rock, unicode )
	{
		var str
		if ( unicode )
		{
			str = Glk.glk_stream_open_resource_uni( filenum, rock )
		}
		else
		{
			str = Glk.glk_stream_open_resource( filenum, rock )
		}
		return _stream_to_id( str )
	},

	glem_stream_set_current: function( tag )
	{
		Glk.glk_stream_set_current( _stream_from_id( tag ) )
	},

	glk_stream_set_position: function( str, pos, seekmode )
	{
		Glk.glk_stream_set_position( _stream_from_ptr( str ), pos, seekmode )
	},

	glk_window_clear: function( window )
	{
		Glk.glk_window_clear( _window_from_ptr( window ) )
	},

	glem_window_close: function( tag )
	{
		Glk.glk_window_close( _window_from_id( tag ) )
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

	glem_window_get_arrangement: function( tag, methodptr, sizeptr, keywinptr )
	{
		var methodBox = new Glk.RefBox()
		var sizeBox = new Glk.RefBox()
		var keywinBox = new Glk.RefBox()
		Glk.glk_window_get_arrangement( _window_from_id( tag ), methodBox, sizeBox, keywinBox )
		if ( methodptr )
		{
			setValue( methodptr, methodBox.value, 'i32' )
		}
		if ( sizeptr )
		{
			setValue( sizeptr, sizeBox.value, 'i32' )
		}
		if ( keywinptr )
		{
			setValue( keywinptr, _window_to_id( keywinBox.value ), 'i32' )
		}
	},

	glk_window_get_size: function( window, width, height )
	{
		var widthBox = new Glk.RefBox()
		var heightBox = new Glk.RefBox()
		Glk.glk_window_get_size( _window_from_ptr( window ), widthBox, heightBox )
		if ( width )
		{
			setValue( width, widthBox.value, 'i32' )
		}
		if ( height )
		{
			setValue( height, heightBox.value, 'i32' )
		}
	},

	glem_window_move_cursor: function( tag, xpos, ypos )
	{
		Glk.glk_window_move_cursor( _window_from_id( tag ), xpos, ypos )
	},

	glem_window_set_arrangement: function( tag, method, size, keywintag )
	{
		Glk.glk_window_set_arrangement( _window_from_id( tag ), method, size, _window_from_id( keywintag ) )
	},

	glk_window_set_background_color: function( window, color )
	{
		Glk.glk_window_set_background_color( _window_from_ptr( window ), color )
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
	'fileref_from_id',
	'stream_from_id',
	'window_from_id',
	'fileref_from_ptr',
	'stream_from_ptr',
	'window_from_ptr',
	'fileref_to_id',
	'stream_to_id',
	'window_to_id',
] )
mergeInto( LibraryManager.library, emglken )