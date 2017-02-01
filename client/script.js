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

var drawSnakes = function (snakeList, canvas)
{
    for (var i in snakeList)
    {
	if (snakeList[i].oldTail != null) {
	    drawPixel(snakeList[i].oldTail, canvas, "#FFFFFF");
	    // console.log("HI");
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

var updateSnakes = function(snakeList, board)
{
    for (var i in snakeList)
    {
	snakeList[i].head.next = makeNode(makeCords(snakeList[i].head.val.x + snakeList[i].direction.x, snakeList[i].head.val.y + snakeList[i].direction.y), null);
	snakeList[i].head = snakeList[i].head.next;
	
	if(!isFood(board, snakeList[i].head.val))
	{
	    snakeList[i].oldTail = snakeList[i].tail.val;
	    snakeList[i].tail = snakeList[i].tail.next;
	}
    }

    return snakeList;
}

var isFood = function(board, cord) {
    return board[cord.x][cord.y] == "food";
}
var makeBoard = function(canvas)
{
    var board = new Array(canvas.width);
    for (var i = 0; i < canvas.width; ++i) {
	board[i] = new Array(canvas.height);

	for (var j = 0; j < canvas.height; ++j)
	{
	    board[i][j] = null;
	}
    }

    // board[20][50] = "food";
    return board;
}

var removeFoodFromBoard = function(board, snakeList)
{
    for(var i in snakeList)
    {
	board[snake[i].head.val.x][snake[i].head.val.y] = null;
    }
    
    return board;
}

var snakeList = [makeSnake(makeCords(10,50))];
var canvas = document.getElementById("a");
var board = makeBoard(canvas);

var mainLoop = function()
{
    // getInput();
    // updateGame();
    snakeList = updateSnakes(snakeList, board);
    drawSnakes(snakeList, canvas);
    setTimeout(mainLoop, 100);
}

mainLoop();

// var cords = makeCords(5, 5);
// drawPixel(cords, canvas, "#000000");

// var snake = makeSnake(makeCords(10, 50));
// snake = updateSnake(snake);
// drawSnake([snake], canvas);

// Write main loop
// var notQuit = true;
// var snakes ;
// while (notQuit)
// {
//     updateGame();
//     drawGame();
//     setTimeOut(function(){});
// }
