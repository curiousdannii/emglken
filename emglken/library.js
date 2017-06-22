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

	class_obj_from_id_fileref: function( tag )
	{
		return GiDispa.class_obj_from_id( 'fileref', tag )
	},

	class_obj_from_id_stream: function( tag )
	{
		return GiDispa.class_obj_from_id( 'stream', tag )
	},

	class_obj_from_id_window: function( tag )
	{
		return GiDispa.class_obj_from_id( 'window', tag )
	},

	class_obj_to_id_fileref: function( tag )
	{
		return GiDispa.class_obj_to_id( 'fileref', tag )
	},

	class_obj_to_id_stream: function( tag )
	{
		return GiDispa.class_obj_to_id( 'stream', tag )
	},

	class_obj_to_id_window: function( tag )
	{
		return GiDispa.class_obj_to_id( 'window', tag )
	},

	// Use the struct's first entry, the tag, to find the fref object
	fileref_from_ptr: function( structptr )
	{
		return GiDispa.class_obj_from_id( 'fileref', Module.getValue( structptr, 'i32' ) )
	},
	
	window_from_ptr: function( winptr )
	{
		return GiDispa.class_obj_from_id( 'window', Module.getValue( winptr, 'i32' ) )
	},

	glem_cancel_char_event: function( tag )
	{
		Glk.glk_cancel_char_event( _class_obj_from_id_window( tag ) )
	},

	glk_cancel_hyperlink_event: function( window )
	{
		Glk.glk_cancel_hyperlink_event( _window_from_ptr( window ) )
	},

	glem_cancel_line_event: function( tag )
	{
		Glk.glk_cancel_line_event( _class_obj_from_id_window( tag ) )
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
		Glk.fatal_error( Module.Pointer_stringify( msg ) )
	},

	glem_fileref_create_by_name: function( usage, name, rock )
	{
		var fref = Glk.glk_fileref_create_by_name( usage, Module.Pointer_stringify( name ), rock )
		return _class_obj_to_id_fileref( fref )
	},

#if EMTERPRETIFY_ASYNC
	glem_fileref_create_by_prompt__deps: ['$EmterpreterAsync', 'class_obj_to_id_fileref'],
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
				Module.setValue( tagptr, _class_obj_to_id_fileref( fref ), 'i32' )
				resume()
			}
			Glk.update()
		})
	},
#endif

#if ASYNCIFY
	glem_fileref_create_by_prompt__deps: ['emscripten_async_resume', 'class_obj_to_id_fileref'],
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
			Module.setValue( tagptr, _class_obj_to_id_fileref( fref ), 'i32' )
			_emscripten_async_resume()
		}
		Glk.update()
	},
#endif

	glem_fileref_create_from_fileref: function( usage, oldtag, rock )
	{
		var fref = Glk.glk_fileref_create_from_fileref( usage, _class_obj_from_id_fileref( oldtag ), rock )
		return _class_obj_to_id_fileref( fref )
	},

	glem_fileref_create_temp: function( usage, rock )
	{
		var fref = Glk.glk_fileref_create_temp( usage, rock )
		return _class_obj_to_id_fileref( fref )
	},

	glk_fileref_delete_file: function( fref )
	{
		Glk.glk_fileref_delete_file( _fileref_from_ptr( fref ) )
	},

	glem_fileref_destroy: function( tag )
	{
		Glk.glk_fileref_destroy( _class_obj_from_id_fileref( tag ) )
	},

	glk_fileref_does_file_exist: function( fref )
	{
		return Glk.glk_fileref_does_file_exist( _fileref_from_ptr( fref ) )
	},

	glk_gestalt_ext: function( sel, val, arraddr, arrlen )
	{
		var arr = new Uint32Array( Module.HEAPU8.buffer, arraddr, arrlen * 4 )
		return Glk.glk_gestalt_ext( sel, val, arr )
	},

	glem_get_buffer_stream: function( tag, bufaddr, len, unicode )
	{
		var str = _class_obj_from_id_stream( tag )
		if ( unicode )
		{
			var buf = new Uint32Array( Module.HEAPU8.buffer, bufaddr, len * 4 )
			return Glk.glk_get_buffer_stream_uni( str, buf )
		}
		else
		{
			var buf = new Uint8Array( Module.HEAPU8.buffer, bufaddr, len )
			return Glk.glk_get_buffer_stream( str, buf )
		}
	},

	glem_get_char_stream: function( tag, unicode )
	{
		var str = _class_obj_from_id_stream( tag )
		if ( unicode )
		{
			return Glk.glk_get_char_stream_uni( str )
		}
		else
		{
			return Glk.glk_get_char_stream( str )
		}
	},

	glem_get_line_stream: function( tag, bufaddr, len, unicode )
	{
		var str = _class_obj_from_id_stream( tag )
		if ( unicode )
		{
			var buf = new Uint32Array( Module.HEAPU8.buffer, bufaddr, len * 4 )
			return Glk.glk_get_line_stream_uni( str, buf )
		}
		else
		{
			var buf = new Uint8Array( Module.HEAPU8.buffer, bufaddr, len )
			return Glk.glk_get_line_stream( str, buf )
		}
	},

	glem_get_window_stream_tag: function( tag )
	{
		return _class_obj_from_id_window( tag ).str.disprock
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
			Module.setValue( width, widthBox.value, 'i32' )
		}
		if ( height )
		{
			Module.setValue( height, heightBox.value, 'i32' )
		}
		return res
	},

	glem_new_window: function( splitwin, method, size, wintype, rock, pairwintag )
	{
		var win = Glk.glk_window_open( _class_obj_from_id_window( splitwin ), method, size, wintype, rock )
		var pairwin = win ? Glk.glk_window_get_parent( win ) : 0
		Module.setValue( pairwintag, _class_obj_to_id_window( pairwin ), 'i32' )
		return _class_obj_to_id_window( win )
	},

	glem_put_buffer_stream: function( tag, bufaddr, len, unicode )
	{
		var str = _class_obj_from_id_stream( tag )
		if ( unicode )
		{
			var buf = new Uint32Array( Module.HEAPU8.buffer, bufaddr, len * 4 )
			Glk.glk_put_buffer_stream_uni( str, buf )
		}
		else
		{
			var buf = new Uint8Array( Module.HEAPU8.buffer, bufaddr, len )
			Glk.glk_put_buffer_stream( str, buf )
		}
	},

	glem_put_char_stream_uni: function( str, ch )
	{
		Glk.glk_put_char_stream_uni( _class_obj_from_id_stream( str ), ch )
	},

	glem_request_char_event: function( tag, unicode )
	{
		var win = _class_obj_from_id_window( tag )
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
		var win = _class_obj_from_id_window( tag )
		if ( unicode )
		{
			var buf = new Uint32Array( Module.HEAPU8.buffer, bufaddr, maxlen * 4 )
			Glk.glk_request_line_event_uni( win, buf, initlen )
		}
		else
		{
			var buf = new Uint8Array( Module.HEAPU8.buffer, bufaddr, maxlen )
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
	glem_select__deps: ['$EmterpreterAsync', 'class_obj_to_id_window'],
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
				Module.setValue( data + 4, _class_obj_to_id_window( glk_event.get_field( 1 ) ), 'i32' )
				Module.setValue( data + 8, glk_event.get_field( 2 ), 'i32' )
				Module.setValue( data + 12, glk_event.get_field( 3 ), 'i32' )
				resume()
			}
			Glk.update()
		})
	},
#endif

#if ASYNCIFY
	glem_select__deps: ['emscripten_async_resume', 'class_obj_to_id_window'],
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
			Module.setValue( data + 4, _class_obj_to_id_window( glk_event.get_field( 1 ) ), 'i32' )
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

	glem_set_hyperlink_stream: function( tag, linkval )
	{
		Glk.glk_set_hyperlink_stream( _class_obj_from_id_stream( tag ), linkval )
	},

	glem_set_style_stream: function( tag, style )
	{
		Glk.glk_set_style_stream( _class_obj_from_id_stream( tag ), style )
	},

	glk_set_terminators_line_event: function( window, arraddr, count )
	{
		var arr = new Uint32Array( Module.HEAPU8.buffer, arraddr, count * 4 )
		Glk.glk_set_terminators_line_event( _window_from_ptr( window ), arr )
	},

	glem_stream_close: function( tag )
	{
		Glk.glk_stream_close( _class_obj_from_id_stream( tag ), null )
	},

	glem_stream_get_position: function( tag )
	{
		return Glk.glk_stream_get_position( _class_obj_from_id_stream( tag ) )
	},

	glem_stream_open_file: function( freftag, fmode, rock, unicode )
	{
		var fileref = _class_obj_from_id_fileref( freftag )
		var str
		if ( unicode )
		{
			str = Glk.glk_stream_open_file_uni( fileref, fmode, rock )
		}
		else
		{
			str = Glk.glk_stream_open_file( fileref, fmode, rock )
		}
		return _class_obj_to_id_stream( str )
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
		return _class_obj_to_id_stream( str )
	},

	glem_stream_set_current: function( tag )
	{
		Glk.glk_stream_set_current( _class_obj_from_id_stream( tag ) )
	},

	glem_stream_set_position: function( tag, pos, seekmode )
	{
		Glk.glk_stream_set_position( _class_obj_from_id_stream( tag ), pos, seekmode )
	},

	glk_window_clear: function( window )
	{
		Glk.glk_window_clear( _window_from_ptr( window ) )
	},

	glem_window_close: function( tag )
	{
		Glk.glk_window_close( _class_obj_from_id_window( tag ) )
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
		Glk.glk_window_get_arrangement( _class_obj_from_id_window( tag ), methodBox, sizeBox, keywinBox )
		if ( methodptr )
		{
			Module.setValue( methodptr, methodBox.value, 'i32' )
		}
		if ( sizeptr )
		{
			Module.setValue( sizeptr, sizeBox.value, 'i32' )
		}
		if ( keywinptr )
		{
			Module.setValue( keywinptr, _class_obj_to_id_window( keywinBox.value ), 'i32' )
		}
	},

	glk_window_get_size: function( window, width, height )
	{
		var widthBox = new Glk.RefBox()
		var heightBox = new Glk.RefBox()
		Glk.glk_window_get_size( _window_from_ptr( window ), widthBox, heightBox )
		if ( width )
		{
			Module.setValue( width, widthBox.value, 'i32' )
		}
		if ( height )
		{
			Module.setValue( height, heightBox.value, 'i32' )
		}
	},

	glem_window_move_cursor: function( tag, xpos, ypos )
	{
		Glk.glk_window_move_cursor( _class_obj_from_id_window( tag ), xpos, ypos )
	},

	glem_window_set_arrangement: function( tag, method, size, keywintag )
	{
		Glk.glk_window_set_arrangement( _class_obj_from_id_window( tag ), method, size, _class_obj_from_id_window( keywintag ) )
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
	'class_obj_from_id_fileref',
	'class_obj_from_id_stream',
	'class_obj_from_id_window',
	'class_obj_to_id_fileref',
	'class_obj_to_id_stream',
	'class_obj_to_id_window',
	'fileref_from_ptr',
	'window_from_ptr',
] )
mergeInto( LibraryManager.library, emglken )