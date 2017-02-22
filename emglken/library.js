// Emglken Emscripten library

// These functions need GiDispa and Glk variables to be set (either globally or in a closure)

mergeInto( LibraryManager.library,
{

	glk_buffer_canon_decompose_uni: function()
	{
		throw new Error( 'glk_buffer_canon_decompose_uni is not implemented' )
	},

	glk_buffer_canon_normalize_uni: function()
	{
		throw new Error( 'glk_buffer_canon_normalize_uni is not implemented' )
	},

	glk_buffer_to_lower_case_uni: function()
	{
		throw new Error( 'glk_buffer_to_lower_case_uni is not implemented' )
	},

	glk_buffer_to_title_case_uni: function()
	{
		throw new Error( 'glk_buffer_to_title_case_uni is not implemented' )
	},

	glk_buffer_to_upper_case_uni: function()
	{
		throw new Error( 'glk_buffer_to_upper_case_uni is not implemented' )
	},

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

	glk_char_to_lower: function()
	{
		throw new Error( 'glk_char_to_lower is not implemented' )
	},

	glk_char_to_upper: function()
	{
		throw new Error( 'glk_char_to_upper is not implemented' )
	},

	glk_current_simple_time: function()
	{
		throw new Error( 'glk_current_simple_time is not implemented' )
	},

	glk_current_time: function()
	{
		throw new Error( 'glk_current_time is not implemented' )
	},

	glk_date_to_simple_time_local: function()
	{
		throw new Error( 'glk_date_to_simple_time_local is not implemented' )
	},

	glk_date_to_simple_time_utc: function()
	{
		throw new Error( 'glk_date_to_simple_time_utc is not implemented' )
	},

	glk_date_to_time_local: function()
	{
		throw new Error( 'glk_date_to_time_local is not implemented' )
	},

	glk_date_to_time_utc: function()
	{
		throw new Error( 'glk_date_to_time_utc is not implemented' )
	},

	glk_exit: function()
	{
		Glk.glk_exit()
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

	glk_fileref_iterate: function( fileref, rockref )
	{
		var RockBox = new Glk.RefBox()
		var res = Glk.glk_fileref_iterate( fileref, RockBox )
		Module.setValue( rockref, RockBox.value, 'i32' )
		return GiDispa.class_obj_to_id( 'fileref', res )
	},

	glk_gestalt: function()
	{
		throw new Error( 'glk_gestalt is not implemented' )
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

	glk_image_draw: function()
	{
		throw new Error( 'glk_image_draw is not implemented' )
	},

	glk_image_draw_scaled: function()
	{
		throw new Error( 'glk_image_draw_scaled is not implemented' )
	},

	glk_image_get_info: function()
	{
		throw new Error( 'glk_image_get_info is not implemented' )
	},

	glk_put_buffer: function()
	{
		throw new Error( 'glk_put_buffer is not implemented' )
	},

	glk_gestalt_ext: function()
	{
		throw new Error( 'glk_gestalt_ext is not implemented' )
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

	glk_put_char: function()
	{
		throw new Error( 'glk_put_char is not implemented' )
	},

	glk_put_char_stream: function()
	{
		throw new Error( 'glk_put_char_stream is not implemented' )
	},

	glk_put_char_stream_uni: function()
	{
		throw new Error( 'glk_put_char_stream_uni is not implemented' )
	},

	glk_put_char_uni: function()
	{
		throw new Error( 'glk_put_char_uni is not implemented' )
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

	glk_request_char_event: function()
	{
		throw new Error( 'glk_request_char_event is not implemented' )
	},

	glk_request_char_event_uni: function()
	{
		throw new Error( 'glk_request_char_event_uni is not implemented' )
	},

	glk_request_hyperlink_event: function()
	{
		throw new Error( 'glk_request_hyperlink_event is not implemented' )
	},

	glk_request_line_event: function()
	{
		throw new Error( 'glk_request_line_event is not implemented' )
	},

	glk_request_line_event_uni: function()
	{
		throw new Error( 'glk_request_line_event_uni is not implemented' )
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

	glk_schannel_iterate: function()
	{
		throw new Error( 'glk_schannel_iterate is not implemented' )
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

	glk_select: function()
	{
		throw new Error( 'glk_select is not implemented' )
	},

	glk_select_poll: function()
	{
		throw new Error( 'glk_select_poll is not implemented' )
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

	glk_simple_time_to_date_local: function()
	{
		throw new Error( 'glk_simple_time_to_date_local is not implemented' )
	},

	glk_simple_time_to_date_utc: function()
	{
		throw new Error( 'glk_simple_time_to_date_utc is not implemented' )
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

	glk_stream_iterate: function( str, rockref )
	{
		var RockBox = new Glk.RefBox()
		var res = Glk.glk_stream_iterate( str, RockBox )
		Module.setValue( rockref, RockBox.value, 'i32' )
		return GiDispa.class_obj_to_id( 'stream', res )
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

	glk_tick: function()
	{
		throw new Error( 'glk_tick is not implemented' )
	},

	glk_time_to_date_local: function()
	{
		throw new Error( 'glk_time_to_date_local is not implemented' )
	},

	glk_time_to_date_utc: function()
	{
		throw new Error( 'glk_time_to_date_utc is not implemented' )
	},

	glk_window_clear: function()
	{
		throw new Error( 'glk_window_clear is not implemented' )
	},

	glk_window_close: function()
	{
		throw new Error( 'glk_window_close is not implemented' )
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

	glk_window_get_parent: function()
	{
		throw new Error( 'glk_window_get_parent is not implemented' )
	},

	glk_window_get_rock: function()
	{
		throw new Error( 'glk_window_get_rock is not implemented' )
	},

	glk_window_get_root: function()
	{
		throw new Error( 'glk_window_get_root is not implemented' )
	},

	glk_window_get_sibling: function()
	{
		throw new Error( 'glk_window_get_sibling is not implemented' )
	},

	glk_window_get_size: function()
	{
		throw new Error( 'glk_window_get_size is not implemented' )
	},

	glk_window_get_stream: function()
	{
		throw new Error( 'glk_window_get_stream is not implemented' )
	},

	glk_window_get_type: function()
	{
		throw new Error( 'glk_window_get_type is not implemented' )
	},

	glk_window_iterate: function( win, rockref )
	{
		var RockBox = new Glk.RefBox()
		var res = Glk.glk_window_iterate( win, RockBox )
		Module.setValue( rockref, RockBox.value, 'i32' )
		return GiDispa.class_obj_to_id( 'window', res )
	},

	glk_window_move_cursor: function()
	{
		throw new Error( 'glk_window_move_cursor is not implemented' )
	},

	glk_window_open: function( splitwin, method, size, wintype, rock )
	{
		var res = Glk.glk_window_open( GiDispa.class_obj_from_id( 'window', splitwin ), method, size, wintype, rock )
		console.log(GiDispa.class_obj_to_id( 'window', res ))
		return GiDispa.class_obj_to_id( 'window', res )
	},

	glk_window_set_arrangement: function()
	{
		throw new Error( 'glk_window_set_arrangement is not implemented' )
	},

	glk_window_set_background_color: function()
	{
		throw new Error( 'glk_window_set_background_color is not implemented' )
	},

	glk_window_set_echo_stream: function()
	{
		throw new Error( 'glk_window_set_echo_stream is not implemented' )
	},

})