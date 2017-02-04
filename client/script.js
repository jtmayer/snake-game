/*
  Snake Game script

  Group 12

  Jonathan Mayer 66268081
  Brian Lam 62101239
  Yu Koizumi 
  Tommy Wong 71659011
*/


var Server;

function log( text ) {
    $log = $('#log');
    //Add text to log
    $log.append(($log.val()?"\n":'')+text);
    //Autoscroll
    $log[0].scrollTop = $log[0].scrollHeight - $log[0].clientHeight;
}

function connect(){
    log('Connecting...');
    Server = new FancyWebSocket('ws://' + document.getElementById('ip').value + ':' + document.getElementById('port').value);

    //Let the user know we're connected
    Server.bind('open', function() {
        document.getElementById("cntBtn").disabled = true;
	log("Connected.");
	document.getElementById("userSendButton").disabled = false;
    });

    //OH NOES! Disconnection occurred.
    Server.bind('close', function( data ) {
        document.getElementById("cntBtn").disabled = false;
	log("Disconnected.");
	document.getElementById("userSendButton").disabled = true;
	document.getElementById("startgame").disabled = true;
    });

    //Log any messages sent from server
    Server.bind('message', function( payload ) {
	log(payload);
    });

    Server.connect();
}

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

// Returns a function that is the result of composing of the argument functions.
// Ex. compose(f,g)(argument) -> f(g(argument))
// Originally authored at: http://blakeembrey.com/articles/2014/01/compose-functions-javascript/
function compose()
{
    // Copies arguments from the invisible "arguments" variable.
    var fns = Array.prototype.slice.call(arguments, 0);

    return function (result)
    {
	for (var i = fns.length - 1; i > -1; i--)
	{
	    result = fns[i].call(this, result);
	}
	
	return result;
    };
}

function map()
{
    var args = Array.prototype.slice.call(arguments, 0);
    var arrayProperties = new Array(arrays.length-1);
    var resultantArray;
    
    for (var i = 0; i < arrayProperties.length; ++i)
    {
	arrayProperties[i] = arrays[i+1].length;
    }

    var resultantArray = new Array(min.apply(this, arrayProperties));
    for (var i = 0; i < resultantArray.length; ++i)
    {
	for (var j in arrays)
	{
	    arrayProperties[j] = arrays[j+1][i];
	}
	
	resultantArray[i] = args[0].apply(this, arrayProperties);
    }

    return resultantArray;
}

// function reduce()
// {
//     var args = Array.prototype.slice.call(arguments, 0);
//     var collection = args[1];

//     for (var i = 2; i < args.length; ++i)
//     {

//     }

//     return collection;
// }

// function makeBooleanReducer(booleanOperator, defaultBooleanValue)
// {
//     return function()
//     {
// 	var args = Array.prototype.slice.call(arguments, 0);
// 	var newArgs = new Array(args.length+2);

// 	for (var i in args)
// 	{
// 	    newArgs[i+2] = args[i];
// 	}

// 	newArgs[0] = booleanOperator;
// 	newArgs[1] = defaultBooleanValue;
// 	return reduce.apply(this, newArgs); 
//     }
// }

// var every = makeBooleanReducer(and, true);
// var any = makeBooleanReducer(or, false);

function generateCanvasDependencies(canvas, scaling)
{
    var context =canvas.getContext("2d");
    var boardWidth = canvas.width / scaling;
    var boardHeight = canvas.height / scaling;
    
    return [
	// drawPixel
	function(cords, color)
	{
	    context.fillStyle = color;
	    context.fillRect(cords.x * scaling,
			     cords.y * scaling,
			     scaling,
			     scaling);
	},

	// makeEmptyBoard
	function()
	{
	    var board = new Array(boardWidth);
	    for (var i = 0; i < boardWidth; ++i) {
		board[i] = new Array(boardHeight);
		
		for (var j = 0; j < boardHeight; ++j)
		{
		    board[i][j] = null;
		}
	    }
	    
	    return board;
	},

	    // isCordsOnBoard
	    function(cords)
	    {
		return cords.x >= 0 && cords.y >= 0 && cords.x < boardWidth && cords.y < boardHeight; 
	    },

	    // generateCordsOnBoard
	    function()
	    {
		return makeCords(Math.floor(Math.random() * boardWidth),
				 Math.floor(Math.random() * boardHeight));
	    },

	    // clearCanvas
	    function()
	    {
		context.fillStyle = "#FFFFFF";
		context.fillRect(0, 0, canvas.width, canvas.height);
	    }];
}

var canvasDependencies = generateCanvasDependencies(document.getElementById("a"), 10);

var drawPixel = canvasDependencies[0];

// var drawPixel = function (cords, canvas, color)
// {
//     var context = canvas.getContext("2d");
//     context.fillStyle = color;
//     context.fillRect(cords.x*10, cords.y*10, 10, 10);
// }

function drawSnakes(snakeList)
{
    for (var i in snakeList)
    {
	if (snakeList[i].oldTail != null) {
	    drawPixel(snakeList[i].oldTail, "#FFFFFF");
	}
    }

    for (var i in snakeList)
    {
	drawPixel(snakeList[i].head.val, "#000000");
    }
}

// Creates a cords object.
var makeCords = makePairType("x", "y");

// Creates a node object.
var makeNode = makePairType("val", "next");

// Todo: Replace next of tail with a delayed expression.
function makeSnake(cords)
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

function updateSnakes(snakeList, board)
{
    for (var i in snakeList)
    {
	snakeList[i].head.next = makeNode(makeCords(snakeList[i].head.val.x + snakeList[i].direction.x, snakeList[i].head.val.y + snakeList[i].direction.y), null);
	snakeList[i].head = snakeList[i].head.next;
	
	if(isFood(board, snakeList[i].head.val)) {
	    board[snakeList[i].head.val.x][snakeList[i].head.val.y] = null;
	    board = addFoodtoBoard(board, generateCordsOnBoard());
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

function isFood(board, cord) {
    try
    {
        return board[cord.x][cord.y] == "food";
    }
    catch(err)
    {
	return false;
    }
}

var makeEmptyBoard = canvasDependencies[1];

var generateCordsOnBoard = canvasDependencies[3];

function makeBoard()
{
    var board = makeEmptyBoard();
    board = addFoodtoBoard(board, generateCordsOnBoard());
// board[20][50] = "food";
return board;
}

function drawFood(board)
{
    for (var x in board)
    {
	for (var y in board[x])
	{
            if (board[x][y] == "food")
	    {
	    	drawPixel(makeCords(x, y), "#FF0000");
	    }
	}
    }
}

function addFoodtoBoard(board, cord)
{
    board[cord.x][cord.y] = "food";
    return board;
}

function removeFoodFromBoard(board, snakeList)
{
    for(var i in snakeList)
    {
	board[snake[i].head.val.x][snake[i].head.val.y] = null;
    }
    
    return board;
}

var isCordsOnBoard = canvasDependencies[2];

function getWinner(snakeList) {
    var headOnCollision = 0;

    for (i in snakeList) {
	if (!isCordsOnBoard(snakeList[i].head.val))
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

// var snakeList = [makeSnake(makeCords(9,10)), makeSnake(makeCords(7,10))];
// var canvas = document.getElementById("a");
// var board = makeBoard(canvas);

var clearCanvas = canvasDependencies[4];

function reset()
{
    // snakeList = [makeSnake(makeCords(9,10)), makeSnake(makeCords(7,10))];
    // canvas = document.getElementById("a");
    // var context = canvas.getContext("2d");
    // context.fillStyle = "#FFFFFF";
    // context.fillRect(0, 0, canvas.width, canvas.height);

    // clearCanvas();

    // board = makeBoard(canvas);

    main([makeSnake(makeCords(9, 10)), makeSnake(makeCords(7, 10))], null);
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

function changeDirection(snake, direction) {
    if (!pairEquality(snake.direction, makeCords(-direction.x, -direction.y)) ||
	snake.length == 1)
    {
	return direction;
    }
    
    return snake.direction;
}

function start()
{
    document.getElementById("startgame").disabled = true;
    // clearCanvas();
    Server.send('start_game', "/start_game-" + "??");
    // mainLoop([makeSnake(makeCords(9, 10)), makeSnake(makeCords(7, 10))], null);
    reset();
}

function mainLoop(snakeList, board)
{
    if (board == null)
    {
    	board = makeBoard();
	clearCanvas();
    }
    
    snakeList = updateSnakes(snakeList, board);
    var score = getWinner(snakeList);
    if (score == null)
    {
     	drawSnakes(snakeList);
        drawFood(board);
        Server.send('score', "/score-" + document.getElementById("user1").value + "-" + snakeList[0].length);
        Server.send('score', "/score-" + document.getElementById("user2").value + "-" + snakeList[1].length);
    	setTimeout(mainLoop, 100, snakeList, board);
    }

    else
    {
        Server.send('score', "/score-" + document.getElementById("user1").value + "-" +snakeList[0].length);
        Server.send('score', "/score-" + document.getElementById("user2").value + "-" +snakeList[1].length);

	document.getElementById("userSendButton").disabled = false;
    }
}

function setUsernames()
{
    document.getElementById("userSendButton").disabled = true;
    document.getElementById("startgame").disabled = false;
}

// mainLoop([makeSnake(makeCords(9, 10)), makeSnake(makeCords(7, 10))], null);

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
