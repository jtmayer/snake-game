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

// delay and force were originally authored by user kana at https://gist.github.com/kana/5344530
// Modifications were made to delay such that expressionAsFunction is only evaluated once, as pointed out by user
// gavin-romig-koch
var delay = function(expressionAsFunction)
{
    var result;
    var isEvaluated = false;
    
    return function ()
    {
	if (!isEvaluated)
	{
	    isEvaluated = true;
	    result = expressionAsFunction();
	}
	
	return result;
    };
}

var force = function(promise)
{
    return promise();
}
// -==========================================

var drawPixel = function (cords, canvas, color)
{
    var context = canvas.getContext("2d");
    context.fillStyle = color;
    context.fillRect(cords.x, cords.y, 1, 1);
}

var drawSnake = function (snakeList, canvas)
{
    for (var i in snakeList)
    {
	if (snakeList[i].oldTail != null) {
	    drawPixel(snakeList[i].oldTail, canvas, "#FFFFFF");
	    console.log("HI");
	}
    }

    for (var i in snakeList)
    {
	drawPixel(snakeList[i].head.val, canvas, "#000000");
    }
}

// Creates a cords object.
var makeCords = makePairType("x", "y");

// Creates a node object.
var makeNode = makePairType("val", "next");

// Todo: Replace next of tail with a delayed expression.
var makeSnake = function (cords)
{
    var node = makeNode(cords, null);
    var snake = {"oldTail" : null,
		 "tail" : node,
		 "head" : node,
		 "direction" : makeCords(1,0)
		}
    
    return snake;
}

var updateSnake = function(snake)
{
    
    snake.head.next = makeNode(makeCords(snake.head.val.x + snake.direction.x, snake.head.val.y + snake.direction.y), null);
    snake.head = snake.head.next;
    
    //if(!isFood(snake.head))
    //{
	snake.oldTail = snake.tail.val;
	snake.tail = snake.tail.next;
    //}
    
    return snake;
}

var canvas = document.getElementById("a");
var cords = makeCords(5, 5);
drawPixel(cords, canvas, "#000000");

var snake = makeSnake(makeCords(10, 50));
snake = updateSnake(snake);
drawSnake([snake], canvas);

// Write main loop
