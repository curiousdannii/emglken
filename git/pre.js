// Emglken prefix code for Git

(function(){

// Utility to extend objects
function extend()
{
	var old = arguments[0], i = 1, add, name;
	while ( i < arguments.length )
	{
		add = arguments[i++];
		for ( name in add )
		{
			old[name] = add[name];
		}
	}
	return old;
}

var Module = {};

var default_options = {
	cache_len: 256 * 1024,
	undo_len: 2000 * 1000,
};

var VM = {

	// prepare mimics the first half of gitMain()
	prepare: function( data, options )
	{
		this.options = extend( {}, default_options, options );

		//Module._gitPrepare( null, null, this.options.cache_len, this.options.undo_len );
		Module.ccall( 'gitPrepare',
			null,
			[ 'array', 'number', 'number', 'number' ],
			[ data, data.length, this.options.cache_len, this.options.undo_len ]
		);
	},
	
	init: function()
	{
		Module.ccall( 'callStartProgram',
			null,
			[ 'number' ],
			[ this.options.cache_len ]
		);
	},
	
	resume: function()
	{
		
	},

};