var makePairType = function(firstElementName, secondElementName)
{
    return function {
	var data[2];
	Object.defineProperty(this, firstElementName, data[0]);
	Object.defineProperty(this, secondElementName, data[1]);
    }
}
