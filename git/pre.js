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

var GiDispa
var Glk

var default_options = {
	cache_len: 256 * 1024,
	undo_len: 2000 * 1000,
}

// Give this Emscripten module the Quixe API
var Module = {

	// Store the data and options
	prepare: function( data, options )
	{
		// If we are not given a glk option then we cannot continue
		if ( !options.Glk )
		{
			throw new Error( 'A reference to Glk is required' )
		}
		GiDispa = options.GiDispa
		Glk = options.Glk
		this.data = data
		this.options = extend( {}, default_options, options )
	},

	// Call gitMain()
	init: function()
	{
		Module.ccall( 'gitMain',
			null,
			[ 'array', 'number', 'number', 'number' ],
			[ this.data, this.data.length, this.options.cache_len, this.options.undo_len ]
		)
		delete this.data
		Glk.update()
	},

	resume: function()
	{
		
	},

	print: function( msg )
	{
		console.log( msg )
	},

	printErr: function( msg )
	{
		console.error( msg )
	},

}