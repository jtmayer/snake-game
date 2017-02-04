/*
Snake Game script

Group 12

Jonathan Mayer 66268081
Brian Lam 62101239
Yu Koizumi 
Tommy Wong 71659011
*/

// Todo: Togglable lazy evaluation functionality.
var makePairType = function(firstElementName, secondElementName)
{
    return function (a, b) {
	var pair = {};
	
	Object.defineProperty(pair, firstElementName, {
	    value: a,
	    writable: true,
	    configurable: true,
	    enumerable: true
	});
	
	Object.defineProperty(pair, secondElementName, {
	    value: b,
	    writable: true,
	    configurable: true,
	    enumerable: true
	});
	return pair;
    };
}

var isPair = function(x)
{
    var propCount = 0;
    
    for (var prop in x)
    {
	++propCount;
    }

    return propCount == 2;
}

var pairEquality = function(pair1, pair2)
{
    var elem1, elem2;
    
    for (var prop in pair1)
    {
	elem1 = pair1[prop];
	elem2 = pair2[prop];
	
	if (isPair(elem1) && isPair(elem2) && !pairEquality(elem1, elem2) ||
	    isPair(elem1) && !isPair(elem2) ||
	    isPair(elem2) && !isPair(elem1) ||
	    !isPair(elem1) && !isPair(elem2) && elem1 != elem2)
	{
	    return false;
	}
    }

    return isPair(pair1) && isPair(pair2);
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
    context.fillRect(cords.x*10, cords.y*10, 10, 10);
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
		 "direction" : makeCords(1,0),
		 "length" : 1
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
	    board = addFoodtoBoard(board, makeCords(Math.floor(Math.random() * canvas.width/10), Math.floor(Math.random() * canvas.height/10)));
	    snakeList[i].length++;
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
    var board = new Array(canvas.width/10);
    for (var i = 0; i < canvas.width/10; ++i) {
	board[i] = new Array(canvas.height/10);

	for (var j = 0; j < canvas.height/10; ++j)
	{
	    board[i][j] = null;
	}
    }
    board = addFoodtoBoard(board, makeCords(Math.floor(Math.random() * canvas.width/10), Math.floor(Math.random() * canvas.height/10)));
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
    var headOnCollision = 0;

    for (i in snakeList) {
	if (snakeList[i].head.val.x >= canvas.width/10 || snakeList[i].head.val.y >= canvas.height/10 || snakeList[i].head.val.x < 0 || snakeList[i].head.val.y < 0)
	    return 1 - i;

	for (j in snakeList)
	{
		for (var snakeNode = snakeList[j].tail; snakeNode != null; snakeNode = snakeNode.next)
		{
		    if (pairEquality(snakeList[i].head.val, snakeNode.val) &&
			!(i == j && pairEquality(snakeNode, snakeList[j].head)))
			{
				return 1 - i;
			}	
		}

	    if (pairEquality(snakeList[i].head.val, snakeList[j].oldTail))
	    {
		
		return 1 - i;		
	    }
	}
    }
}

var snakeList = [makeSnake(makeCords(9,10)), makeSnake(makeCords(7,10))];
var canvas = document.getElementById("a");
var board = makeBoard(canvas);

var reset = function()
{
	snakeList = [makeSnake(makeCords(9,10)), makeSnake(makeCords(7,10))];
	canvas = document.getElementById("a");
	var context = canvas.getContext("2d");
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);

	board = makeBoard(canvas);
}

document.addEventListener("keydown", function(event) {
    switch (event.keyCode) {
	case 38: //up
	    snakeList[0].direction = changeDirection(snakeList[0].direction, makeCords(0,-1));
	    break;
	case 40: //down
	    snakeList[0].direction = changeDirection(snakeList[0].direction, makeCords(0,1));
	    break;
	case 37:  //left
	    snakeList[0].direction = changeDirection(snakeList[0].direction, makeCords(-1,0));
	    break;
	case 39: //right
	    snakeList[0].direction = changeDirection(snakeList[0].direction, makeCords(1,0));
	    break;
	case 87: //up2
	    snakeList[1].direction = changeDirection(snakeList[1].direction, makeCords(0,-1));
	    break;
	case 83: //down2
	    snakeList[1].direction = changeDirection(snakeList[1].direction, makeCords(0,1));
	    break;
	case 65:  //left2
	    snakeList[1].direction = changeDirection(snakeList[1].direction, makeCords(-1,0));
	    break;
	case 68: //right2
	    snakeList[1].direction = changeDirection(snakeList[1].direction, makeCords(1,0));
	    break;
	default:
    }
})

var changeDirection = function(snakeDirection, direction) {
	if (!pairEquality(snakeDirection, makeCords(-direction.x, -direction.y)))
	    return direction;
	return snakeDirection;
}
/*
var mainLoop = function()
{
    // if (board == null)
    // {
    // 	board = makeBoard(canvas);
    // }
    
    // getInput();
    // updateGame();
    snakeList = updateSnakes(snakeList, board);
    var score = getWinner(snakeList, canvas);
    if (score == null) {
        drawSnakes(snakeList, canvas);
        drawFood(board, canvas);
    	setTimeout(mainLoop, 50// , snakeList, canvas, board
		  );
    } 
    else {
	console.log(score);
    }

}


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
*/
