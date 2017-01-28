// Loads another JavaScript script.
//$.getScript("metapair.js");

// Todo: Togglable lazy evaluation functionality.
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


// -==========================================

var drawPixel = function (cords, canvas, color)
{
    var context = canvas.getContext("2d");
    context.fillStyle = color;
    context.fillRect(cords.x, cords.y, 20, 20);
}

var drawSnake = function (snakeList, canvas)
{
    for (var i = snakeList.length()-1; i >= 0; ++i)
    {
	drawPixel(snakeList[i].oldTail, canvas, "0xFF");
    }

    for (var i = snakeList.length()-1; i >= 0; ++i)
    {
	drawPixel(snakeList[i].tail.val, canvas, "0x00");
    }
}

// Creates a cords object.
var makeCords = makePairType("x", "y");

// Creates a node object.
var makeNode = makePairType("val", "next");

// Todo: Replace next of tail with a delayed expression.
var makeSnake = function (cords)
{
    return {"oldTail" : null,
	    "tail" : makeNode(cords, null),
	    "head" : tail};
}

var updateSnake = function(snake)
{
    var nextHead = snake.head.next;
    
    if(!isFood(nextHead.val))
    {
	snake.oldTail = snake.tail.val;
	snake.tail = snake.tail.next;
    }

    snake.head = nextHead;
    return snake;
}

var canvas = document.getElementById("a");
var cords = makeCords(5, 5);
drawPixel(cords, canvas, "0x00");
