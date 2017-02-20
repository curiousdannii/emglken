// Emglken postfix code for Git

if ( typeof module === 'object' && module.exports )
{
	module.exports = VM;
}
if ( typeof window !== 'undefined' )
{
	window.Git = VM;
}

})()