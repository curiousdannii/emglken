// Emglken Emscripten library

// These functions need GiDispa and Glk variables to be set (either globally or in a closure)

mergeInto( LibraryManager.library,
{

	glk_cancel_char_event: function()
	{
		throw new Error( 'glk_cancel_char_event is not implemented' )
	},

	glk_cancel_hyperlink_event: function()
	{
		throw new Error( 'glk_cancel_hyperlink_event is not implemented' )
	},

	glk_cancel_line_event: function()
	{
		throw new Error( 'glk_cancel_line_event is not implemented' )
	},

	glk_cancel_mouse_event: function()
	{
		throw new Error( 'glk_cancel_mouse_event is not implemented' )
	},

	glk_exit: function()
	{
		Glk.glk_exit()
		Glk.update()
	},

	glk_fileref_create_by_name: function()
	{
		throw new Error( 'glk_fileref_create_by_name is not implemented' )
	},

	glk_fileref_create_by_prompt: function()
	{
		throw new Error( 'glk_fileref_create_by_prompt is not implemented' )
	},

	glk_fileref_create_from_fileref: function()
	{
		throw new Error( 'glk_fileref_create_from_fileref is not implemented' )
	},

	glk_fileref_create_temp: function()
	{
		throw new Error( 'glk_fileref_create_temp is not implemented' )
	},

	glk_fileref_delete_file: function()
	{
		throw new Error( 'glk_fileref_delete_file is not implemented' )
	},

	glk_fileref_destroy: function()
	{
		throw new Error( 'glk_fileref_destroy is not implemented' )
	},

	glk_fileref_does_file_exist: function()
	{
		throw new Error( 'glk_fileref_does_file_exist is not implemented' )
	},

	glk_fileref_get_rock: function()
	{
		throw new Error( 'glk_fileref_get_rock is not implemented' )
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
		return GiDispa.class_obj_from_id( 'window', wintag ).str.disprock
	},

	glem_image_draw: function( wintag, image, val1, val2 )
	{
		return Glk.glk_image_draw( GiDispa.class_obj_from_id( 'window', wintag ), image, val1, val2 )
	},

	glem_image_draw_scaled: function( wintag, image, val1, val2, width, height )
	{
		return Glk.glk_image_draw_scaled( GiDispa.class_obj_from_id( 'window', wintag ), image, val1, val2, width, height )
	},

	glk_image_get_info: function()
	{
		throw new Error( 'glk_image_get_info is not implemented' )
	},

	glem_new_window: function( splitwin, method, size, wintype, rock, pairwintag )
	{
		var win = Glk.glk_window_open( GiDispa.class_obj_from_id( 'window', splitwin ), method, size, wintype, rock )
		var pairwin = Glk.glk_window_get_parent( win )
		Module.setValue( pairwintag, GiDispa.class_obj_to_id( 'window', pairwin ), 'i32' )
		return GiDispa.class_obj_to_id( 'window', win )
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
		Glk.glk_put_char_stream_uni( GiDispa.class_obj_from_id( 'stream', str ), ch )
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
		var win = GiDispa.class_obj_from_id( 'window', wintag )
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
		var win = GiDispa.class_obj_from_id( 'window', wintag )
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
				Module.setValue( data + 4, GiDispa.class_obj_to_id( 'window', glk_event.get_field( 1 ) ), 'i32' )
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

	glk_set_hyperlink: function()
	{
		throw new Error( 'glk_set_hyperlink is not implemented' )
	},

	glk_set_hyperlink_stream: function()
	{
		throw new Error( 'glk_set_hyperlink_stream is not implemented' )
	},

	glk_set_style: function()
	{
		throw new Error( 'glk_set_style is not implemented' )
	},

	glk_set_style_stream: function()
	{
		throw new Error( 'glk_set_style_stream is not implemented' )
	},

	glk_set_terminators_line_event: function()
	{
		throw new Error( 'glk_set_terminators_line_event is not implemented' )
	},

	glk_set_window: function()
	{
		throw new Error( 'glk_set_window is not implemented' )
	},

	glk_sound_load_hint: function()
	{
		throw new Error( 'glk_sound_load_hint is not implemented' )
	},

	glk_stream_close: function()
	{
		throw new Error( 'glk_stream_close is not implemented' )
	},

	glk_stream_get_current: function()
	{
		throw new Error( 'glk_stream_get_current is not implemented' )
	},

	glk_stream_get_position: function()
	{
		throw new Error( 'glk_stream_get_position is not implemented' )
	},

	glk_stream_get_rock: function()
	{
		throw new Error( 'glk_stream_get_rock is not implemented' )
	},

	glk_stream_open_file: function()
	{
		throw new Error( 'glk_stream_open_file is not implemented' )
	},

	glk_stream_open_file_uni: function()
	{
		throw new Error( 'glk_stream_open_file_uni is not implemented' )
	},

	glk_stream_open_memory: function()
	{
		throw new Error( 'glk_stream_open_memory is not implemented' )
	},

	glk_stream_open_memory_uni: function()
	{
		throw new Error( 'glk_stream_open_memory_uni is not implemented' )
	},

	glk_stream_open_resource: function()
	{
		throw new Error( 'glk_stream_open_resource is not implemented' )
	},

	glk_stream_open_resource_uni: function()
	{
		throw new Error( 'glk_stream_open_resource_uni is not implemented' )
	},

	glk_stream_set_current: function()
	{
		throw new Error( 'glk_stream_set_current is not implemented' )
	},

	glk_stream_set_position: function()
	{
		throw new Error( 'glk_stream_set_position is not implemented' )
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
		Glk.glk_window_clear( GiDispa.class_obj_from_id( 'window', wintag ) )
	},

	glem_window_close: function( wintag )
	{
		Glk.glk_window_close( GiDispa.class_obj_from_id( 'window', wintag ) )
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

	glk_window_get_echo_stream: function()
	{
		throw new Error( 'glk_window_get_echo_stream is not implemented' )
	},

	glk_window_get_size: function()
	{
		throw new Error( 'glk_window_get_size is not implemented' )
	},

	glk_window_get_stream: function()
	{
		throw new Error( 'glk_window_get_stream is not implemented' )
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
		Glk.glk_window_set_background_color( GiDispa.class_obj_from_id( 'window', wintag ), color )
	},

})