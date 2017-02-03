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
	
	if(isFood(board, snakeList[i].head.val)) {
	    board[snakeList[i].head.val.x][snakeList[i].head.val.y] = null;
	    board = addFoodtoBoard(board, makeCords(Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height)));
	}
        else
	{
	    snakeList[i].oldTail = snakeList[i].tail.val;
	    snakeList[i].tail = snakeList[i].tail.next;
	}
    }

    return snakeList;
}

var isFood = function(board, cord) {
    try
    {
        return board[cord.x][cord.y] == "food";
    }
    catch(err)
    {
	return false;
    }
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
    board = addFoodtoBoard(board, makeCords(Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height)));
    // board[20][50] = "food";
    return board;
}

var drawFood = function(board, canvas)
{
    for (var x in board) {
	for (var y in board[x]) {
            if (board[x][y] == "food")
	    	drawPixel(makeCords(x, y), canvas, "#FF0000");
	}
    }
}

var addFoodtoBoard = function(board, cord)
{
    board[cord.x][cord.y] = "food";
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

var getWinner = function(snakeList, canvas) {
    for (i in snakeList) {
	if (snakeList[i].head.val.x >= canvas.width || snakeList[i].head.val.y >= canvas.height || snakeList[i].head.val.x < 0 || snakeList[i].head.val.y < 0)
	    return 1 - i;

	for (j in snakeList)
	{
		for (var snakeNode = snakeList[j].tail; snakeNode != null; snakeNode = snakeNode.next)
		{
			if (snakeList[i].head.val.x == snakeNode.val.x && snakeList[i].head.val.y == snakeNode.val.y && !(i == j && snakeNode.val.x == snakeList[j].head.val.x && snakeNode.val.y == snakeList[j].head.val.y))
			{
				return 1 - i;
			}	
		}
	}
    }
}

var snakeList = [makeSnake(makeCords(10,10)), makeSnake(makeCords(4,10))];
var canvas = document.getElementById("a");
var board = makeBoard(canvas);

document.addEventListener("keydown", function(event) {
    switch (event.keyCode) {
	case 38: //up
	    snakeList[0].direction = makeCords(0,-1);
	    break;
	case 40: //down
	    snakeList[0].direction = makeCords(0,1);
	    break;
	case 37:  //left
	    snakeList[0].direction = makeCords(-1,0);
	    break;
	case 39: //right
	    snakeList[0].direction = makeCords(1,0);
	    break;
	case 87: //up2
	    snakeList[1].direction = makeCords(0,-1);
	    break;
	case 83: //down2
	    snakeList[1].direction = makeCords(0,1);
	    break;
	case 65:  //left2
	    snakeList[1].direction = makeCords(-1,0);
	    break;
	case 68: //right2
	    snakeList[1].direction = makeCords(1,0);
	    break;
	default:
    }
})

var mainLoop = function()
{
    // getInput();
    // updateGame();
    snakeList = updateSnakes(snakeList, board);
    var score = getWinner(snakeList, canvas);
    if (score == null) {
        drawSnakes(snakeList, canvas);
        drawFood(board, canvas);
    	setTimeout(mainLoop, 100);
    } 
    else {
	console.log(score);
    }
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
