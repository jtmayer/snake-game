/*
  Snake Game script

  Group 12

  Jonathan Mayer 66268081
  Brian Lam 62101239
  Yu Koizumi 
  Tommy Wong 71659011
*/


var Server;

function log( text )
{
    $log = $('#log');
    //Add text to log
    $log.append(($log.val()?"\n":'')+text);
    //Autoscroll
    $log[0].scrollTop = $log[0].scrollHeight - $log[0].clientHeight;
}

function connect()
{
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
function makePairType(firstElementName, secondElementName)
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

function isPair(x)
{
    var propCount = 0;
    
    for (var prop in x)
    {
	++propCount;
    }

    return propCount == 2;
}

function pairEquality(pair1, pair2)
{
    var elem1, elem2;
    
    for (var prop in pair1)
    {
	elem1 = pair1[prop];
	try
	{
	    elem2 = pair2[prop];
	}

	catch(err)
	{
	    return false;
	}
	
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

function pairToArray(pair)
{
    var resultantArray = new Array(2);
    var currentIndex = 0;
    for (var prop in pair)
    {
	resultantArray[currentIndex] = pair[prop];
	++currentIndex;
    }

    return resultantArray;
}

// delay and force were originally authored by user kana at https://gist.github.com/kana/5344530
// Modifications were made to delay such that expressionAsFunction is only evaluated once, as pointed out by user
// gavin-romig-koch
function delay(expressionAsFunction)
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

function force(promise)
{
    return promise();
}

// Returns a function that is the result of composing of the argument functions.
// Ex. compose(f,g)(argument) -> f(g(argument))
// Originally authored at: http://blakeembrey.com/articles/2014/01/compose-functions-javascript/
function compose()
{
    // Copies arguments from the invisible "arguments" variable.
    var fns = Array.prototype.slice.call(arguments, 0);

    return function ()
    {
	var args = Array.prototype.slice.call(arguments, 0);
	var firstFunctionIndex = fns.length - 1;
	var result = fns[firstFunctionIndex].apply(this, args);
	for (var i = firstFunctionIndex - 1; i >= 0; --i)
	{
	    result = fns[i].call(this, result);
	}
	
	return result;
    };
}

function makeExtremaGenerator(comparisonOperator)
{
    return function()
    {
	var args = Array.prototype.slice.call(arguments, 0);

	for (var i in args)
	{
	    if (comparisonOperator(args[i], args[0]))
	    {
		args[0] = args[i];
	    }
	}

	return args[0];
    }
}

function lt(x, y)
{
    return x < y;
}

function gt(x, y)
{
    return x > y;
}

var min = makeExtremaGenerator(lt);
var max = makeExtremaGenerator(gt);

function map()
{
    var args = Array.prototype.slice.call(arguments, 0);
    var arrayProperties = new Array(args.length-1);
    
    for (var i = 0; i < arrayProperties.length; ++i)
    {
	arrayProperties[i] = args[i+1].length;
    }

    var resultantArray = new Array(min.apply(this, arrayProperties));
    for (var i = 0; i < resultantArray.length; ++i)
    {
	for (var j = 0; j < arrayProperties.length; ++j)
	{
	    arrayProperties[j] = args[j+1][i];
	}

	resultantArray[i] = args[0].apply(this, arrayProperties);
    }

    return resultantArray;
}

function reduce()
{
    var args = Array.prototype.slice.call(arguments, 0);
    var collection = args[1];

    for (var i = 2; i < args.length; ++i)
    {
	collection = args[0](args[i], collection);
    }

    return collection;
}

function makeBooleanReducer(booleanOperator, defaultBooleanValue)
{
    return function()
    {
	var mappedArgs = map.apply(this, Array.prototype.slice.call(arguments, 0));
	var newArgs = new Array(mappedArgs.length+2);

	for (var i in mappedArgs)
	{
	    newArgs[i+2] = mappedArgs[i];
	}

	newArgs[0] = booleanOperator;
	newArgs[1] = defaultBooleanValue;
	return reduce.apply(this, newArgs); 
    }
}

function and()
{
    var args = Array.prototype.slice.call(arguments, 0);
    for (var i in args)
    {
	args[0] = args[0] && args[i];
    }

    return args[0];
}

function or()
{
    var args = Array.prototype.slice.call(arguments, 0);
    for (var i in args)
    {
	args[0] = args[0] || args[i];
    }

    return args[0]
}

var every = makeBooleanReducer(and, true);
var any = makeBooleanReducer(or, false);

function isInBounds(val, min, max)
{
    return val >= min && val <= max;
}

function inc(val)
{
    return ++val;
}

function dec(val)
{
    return --val;
}

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
		// return cords.x >= 0 && cords.y >= 0 && cords.x < boardWidth && cords.y < boardHeight;
		return every(isInBounds,
			     pairToArray(cords),
			     [0, 0],
			     map(dec, [boardWidth, boardHeight]));
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

var isCordsOnBoard = canvasDependencies[2];
var makeEmptyBoard = canvasDependencies[1];
var generateCordsOnBoard = canvasDependencies[3];

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
		 "length" : 1}
    
    return snake;
}

function updateState(state)
{
    var snakeList= state.snakeList;
    var board = state.board;
    for (var i in snakeList)
    {
	snakeList[i].head.next = makeNode(makeCords(snakeList[i].head.val.x + snakeList[i].direction.x,
						    snakeList[i].head.val.y + snakeList[i].direction.y),
					  null);
	snakeList[i].head = snakeList[i].head.next;
	
	if(isFood(board, snakeList[i].head.val))
	{
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

    state.snakeList = snakeList;
    state.board = board;

    return state;
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

    mainLoop({"snakeList" : map(compose(makeSnake, makeCords), [9, 7], [10, 10]),
	      "board" : null});
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

function mainLoop(state)
{
    if (state.board == null)
    {
	console.log(1);
    	state.board = makeBoard();
	clearCanvas();
    }
    
    state = updateState(state);
    var winner = getWinner(state.snakeList);
    if (winner == null)
    {
	console.log(2);
     	drawSnakes(state.snakeList);
        drawFood(state.board);
        Server.send('score', "/score-" + document.getElementById("user1").value + "-" + state.snakeList[0].length);
        Server.send('score', "/score-" + document.getElementById("user2").value + "-" + state.snakeList[1].length);
    	setTimeout(mainLoop, 100, state);
    }

    else
    {
	console.log(3);
        Server.send('score', "/score-" + document.getElementById("user1").value + "-" + state.snakeList[0].length);
        Server.send('score', "/score-" + document.getElementById("user2").value + "-" + state.snakeList[1].length);

	document.getElementById("userSendButton").disabled = false;
    }
}

function setUsernames()
{
    document.getElementById("userSendButton").disabled = true;
    document.getElementById("startgame").disabled = false;
}
