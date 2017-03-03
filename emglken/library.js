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
		return GiDispa.class_obj_to_id( 'fileref', fref )
		return _class_obj_to_id_fileref( fref )
	},

	glk_fileref_create_by_prompt: function()
	{
		throw new Error( 'glk_fileref_create_by_prompt is not implemented' )
	},

	glem_fileref_create_from_fileref: function( usage, oldtag, rock )
	{
		var fref = Glk.glk_fileref_create_from_fileref( usage, GiDispa.class_obj_from_id( 'fileref', oldtag ), rock )
		return GiDispa.class_obj_to_id( 'fileref', fref )
		var fref = Glk.glk_fileref_create_from_fileref( usage, _class_obj_from_id_fileref( oldtag ), rock )
		return _class_obj_to_id_fileref( fref )
	},

	glem_fileref_create_temp: function( usage, rock )
	{
		var fref = Glk.glk_fileref_create_temp( usage, rock )
		return GiDispa.class_obj_to_id( 'fileref', fref )
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

	glk_get_buffer_stream: function()
	{
		throw new Error( 'glk_get_buffer_stream is not implemented' )
	},

	glk_get_buffer_stream_uni: function()
	{
		throw new Error( 'glk_get_buffer_stream_uni is not implemented' )
	},

	glk_get_char_stream: function()
	{
		throw new Error( 'glk_get_char_stream is not implemented' )
	},

	glk_get_char_stream_uni: function()
	{
		throw new Error( 'glk_get_char_stream_uni is not implemented' )
	},

	glk_get_line_stream: function()
	{
		throw new Error( 'glk_get_line_stream is not implemented' )
	},

	glk_get_line_stream_uni: function()
	{
		throw new Error( 'glk_get_line_stream_uni is not implemented' )
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

	glk_put_buffer: function()
	{
		throw new Error( 'glk_put_buffer is not implemented' )
	},

	glk_put_buffer_stream_uni: function()
	{
		throw new Error( 'glk_put_buffer_stream_uni is not implemented' )
	},

	glk_put_buffer_uni: function()
	{
		throw new Error( 'glk_put_buffer_uni is not implemented' )
	},

	glk_put_buffer_stream: function()
	{
		throw new Error( 'glk_put_buffer_stream is not implemented' )
	},

	glem_put_char_stream_uni: function( str, ch )
	{
		Glk.glk_put_char_stream_uni( _class_obj_from_id_stream( str ), ch )
	},

	glk_put_string: function()
	{
		throw new Error( 'glk_put_string is not implemented' )
	},

	glk_put_string_uni: function()
	{
		throw new Error( 'glk_put_string_uni is not implemented' )
	},

	glk_put_string_stream: function()
	{
		throw new Error( 'glk_put_string_stream is not implemented' )
	},

	glk_put_string_stream_uni: function()
	{
		throw new Error( 'glk_put_string_stream_uni is not implemented' )
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

	glk_schannel_create: function()
	{
		throw new Error( 'glk_schannel_create is not implemented' )
	},

	glk_schannel_create_ext: function()
	{
		throw new Error( 'glk_schannel_create_ext is not implemented' )
	},

	glk_schannel_destroy: function()
	{
		throw new Error( 'glk_schannel_destroy is not implemented' )
	},

	glk_schannel_get_rock: function()
	{
		throw new Error( 'glk_schannel_get_rock is not implemented' )
	},

	glk_schannel_pause: function()
	{
		throw new Error( 'glk_schannel_pause is not implemented' )
	},

	glk_schannel_play: function()
	{
		throw new Error( 'glk_schannel_play is not implemented' )
	},

	glk_schannel_play_ext: function()
	{
		throw new Error( 'glk_schannel_play_ext is not implemented' )
	},

	glk_schannel_play_multi: function()
	{
		throw new Error( 'glk_schannel_play_multi is not implemented' )
	},

	glk_schannel_set_volume: function()
	{
		throw new Error( 'glk_schannel_set_volume is not implemented' )
	},

	glk_schannel_set_volume_ext: function()
	{
		throw new Error( 'glk_schannel_set_volume_ext is not implemented' )
	},

	glk_schannel_stop: function()
	{
		throw new Error( 'glk_schannel_stop is not implemented' )
	},

	glk_schannel_unpause: function()
	{
		throw new Error( 'glk_schannel_unpause is not implemented' )
	},

	glem_select__deps: ['$EmterpreterAsync'],
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

	glk_sound_load_hint: function()
	{
		throw new Error( 'glk_sound_load_hint is not implemented' )
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

	glk_style_distinguish: function()
	{
		throw new Error( 'glk_style_distinguish is not implemented' )
	},

	glk_style_measure: function()
	{
		throw new Error( 'glk_style_measure is not implemented' )
	},

	glk_stylehint_clear: function()
	{
		throw new Error( 'glk_stylehint_clear is not implemented' )
	},

	glk_stylehint_set: function()
	{
		throw new Error( 'glk_stylehint_set is not implemented' )
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