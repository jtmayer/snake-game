var makePairType = function(firstElementName, secondElementName)
{
    return function (a, b) {
	var o = {};
	
	Object.defineProperty(o, firstElementName, {
	    value: a,
	    writable: true,
	    configurable: true
	});
	
	Object.defineProperty(o, secondElementName, {
	    value: b,
	    writable: true,
	    configurable: true
	});
	return o;
    };
}
