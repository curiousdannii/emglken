// Emglken Emscripten library

// These functions need GiDispa and Glk variables to be set (either globally or in a closure)

var emglken = {

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

	git_powf: function( base, exp )
	{
		if ( base === 1 || ( base === -1 && ( exp === Infinity || exp === -Infinity ) ) )
		{
			return 1
		}
		return Math.pow( base, exp )
	},

	glem_cancel_char_event: function( wintag )
	{
		Glk.glk_cancel_char_event( _class_obj_from_id_window( wintag ) )
	},

	glem_cancel_hyperlink_event: function( wintag )
	{
		Glk.glk_cancel_hyperlink_event( _class_obj_from_id_window( wintag ) )
	},

	glem_cancel_line_event: function( wintag )
	{
		Glk.glk_cancel_line_event( _class_obj_from_id_window( wintag ) )
	},

	glem_cancel_mouse_event: function( wintag )
	{
		Glk.glk_cancel_mouse_event( _class_obj_from_id_window( wintag ) )
	},

	glem_exit: function()
	{
		Glk.glk_exit()
		Glk.update()
	},

	glem_fileref_create_by_name: function( usage, name, rock )
	{
		var fref = Glk.glk_fileref_create_by_name( usage, Module.intArrayToString( name ), rock )
		return _class_obj_to_id_fileref( fref )
	},

	glk_fileref_create_by_prompt: function()
	{
		throw new Error( 'glk_fileref_create_by_prompt is not implemented' )
	},

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

	glem_fileref_delete_file: function( tag )
	{
		Glk.glk_fileref_delete_file( _class_obj_from_id_fileref( tag ) )
	},

	glem_fileref_destroy: function( tag )
	{
		Glk.glk_fileref_destroy( _class_obj_from_id_fileref( tag ) )
	},

	glem_fileref_does_file_exist: function( tag )
	{
		return Glk.glk_fileref_does_file_exist( _class_obj_from_id_fileref( tag ) )
	},

	glk_gestalt_ext: function()
	{
		throw new Error( 'glk_gestalt_ext is not implemented' )
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

	glem_get_window_stream_tag: function( wintag )
	{
		return _class_obj_from_id_window( wintag ).str.disprock
	},

	glem_image_draw: function( wintag, image, val1, val2 )
	{
		return Glk.glk_image_draw( _class_obj_from_id_window( wintag ), image, val1, val2 )
	},

	glem_image_draw_scaled: function( wintag, image, val1, val2, width, height )
	{
		return Glk.glk_image_draw_scaled( _class_obj_from_id_window( wintag ), image, val1, val2, width, height )
	},

	glk_image_get_info: function()
	{
		throw new Error( 'glk_image_get_info is not implemented' )
	},

	glem_new_window: function( splitwin, method, size, wintype, rock, pairwintag )
	{
		var win = Glk.glk_window_open( _class_obj_from_id_window( splitwin ), method, size, wintype, rock )
		var pairwin = Glk.glk_window_get_parent( win )
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

	glem_request_char_event: function( wintag, unicode )
	{
		var win = _class_obj_from_id_window( wintag )
		if ( unicode )
		{
			Glk.glk_request_char_event_uni( win )
		}
		else
		{
			Glk.glk_request_char_event( win )
		}
	},

	glk_request_hyperlink_event: function()
	{
		throw new Error( 'glk_request_hyperlink_event is not implemented' )
	},

	glem_request_line_event: function( wintag, bufaddr, maxlen, initlen, unicode )
	{
		var win = _class_obj_from_id_window( wintag )
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

	glk_request_mouse_event: function()
	{
		throw new Error( 'glk_request_mouse_event is not implemented' )
	},

	glk_request_timer_events: function()
	{
		throw new Error( 'glk_request_timer_events is not implemented' )
	},

	glem_select__deps: ['$EmterpreterAsync', 'class_obj_to_id_window'],
	glem_select: function( data )
	{
		EmterpreterAsync.handle( function( resume )
		{
			var glk_event = new Glk.RefStruct()
			Glk.glk_select( glk_event )
			Module.glem_select_callback = function()
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

	glk_set_echo_line_event: function()
	{
		throw new Error( 'glk_set_echo_line_event is not implemented' )
	},

	glem_set_hyperlink_stream: function( tag, linkval )
	{
		Glk.glk_set_hyperlink_stream( _class_obj_from_id_stream( tag ), linkval )
	},

	glem_set_style_stream: function( tag, style )
	{
		Glk.glk_set_style_stream( _class_obj_from_id_stream( tag ), style )
	},

	glk_set_terminators_line_event: function()
	{
		throw new Error( 'glk_set_terminators_line_event is not implemented' )
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

	glem_window_clear: function( wintag )
	{
		Glk.glk_window_clear( _class_obj_from_id_window( wintag ) )
	},

	glem_window_close: function( wintag )
	{
		Glk.glk_window_close( _class_obj_from_id_window( wintag ) )
	},

	glk_window_erase_rect: function()
	{
		throw new Error( 'glk_window_erase_rect is not implemented' )
	},

	glk_window_fill_rect: function()
	{
		throw new Error( 'glk_window_fill_rect is not implemented' )
	},

	glk_window_flow_break: function()
	{
		throw new Error( 'glk_window_flow_break is not implemented' )
	},

	glk_window_get_arrangement: function()
	{
		throw new Error( 'glk_window_get_arrangement is not implemented' )
	},

	glk_window_get_size: function()
	{
		throw new Error( 'glk_window_get_size is not implemented' )
	},

	glk_window_move_cursor: function()
	{
		throw new Error( 'glk_window_move_cursor is not implemented' )
	},

	glk_window_set_arrangement: function()
	{
		throw new Error( 'glk_window_set_arrangement is not implemented' )
	},

	glem_window_set_background_color: function( wintag, color )
	{
		Glk.glk_window_set_background_color( _class_obj_from_id_window( wintag ), color )
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
				object[item + '__deps'] = deps;
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
] )
mergeInto( LibraryManager.library, emglken )