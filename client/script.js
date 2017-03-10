/*
  Snake Game script

  Group 12

  Jonathan Mayer 66268081
  Brian Lam 62101239
  Yu Koizumi 000975171
  Tommy Wong 71659011
*/

/*
  Testing
  function timed()
  {
  console.log(frame++);
  setTimeout(timed, 1000);
  }
*/

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
var clearCanvas = canvasDependencies[4];

function makeTupleType()
{
    var fieldName = Array.prototype.slice.call(arguments, 0);
    
    return function () {
	var args = Array.prototype.slice.call(arguments, 0);
	var tuple = {};

	for (var i in args)
	{
	    Object.defineProperty(tuple, fieldName[i], {
		value: args[i],
		writable: true,
		configurable: true,
		enumerable: true
	    });
	}
	
	return tuple;
    };
}

// Creates a cords object.
var makeCords = makeTupleType("x", "y");

// Creates a node object.
var makeNode = makeTupleType("val", "next");

function directionToCord(direction)
{
    if (direction == "left")
    {
	return makeCords(-1, 0);
    }

    else if (direction == "right")
    {
	return makeCords(1, 0);
    }

    else if (direction == "up")
    {
	return makeCords(0, -1);
    }

    else if (direction == "down")
    {
	return makeCords(0, 1);
    }
}

// Client-Server Functions


var Server;
var direction = "none";
var official_direction = "none";
var made_snake = false;
var snakeList = [makeSnake(), makeSnake()];
var official_clientID;



//var snakeList = [makeSnake(makeCords(9,10)), makeSnake(makeCords(7,10))];
document.addEventListener("keydown", eventHandler);

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
	document.getElementById("setUsernameButton").disabled = false;
    });

    //OH NOES! Disconnection occurred.
    Server.bind('close', function( data ) {
        document.getElementById("cntBtn").disabled = false;
	log("Disconnected.");
	document.getElementById("setUsernameButton").disabled = true;
	document.getElementById("readyButton").disabled = true;
    });

    //Log any messages sent from server
    Server.bind('message', function( payload ) {
	//log(payload);
	var index = payload.indexOf("/", 1);
	var type = payload.substring(0, index);
	var message = payload.substring(index+1);
	var milliseconds = new Date().getTime();
	if(type == "/input_demand")
	{
	    official_direction = direction;

	    if (official_direction != "none" && !made_snake)
	    {
		snakeList[official_clientID].direction = directionToCord(official_direction);
	    }
	    
	    //update();
	    //drawSnakes(snakeList);
	    Server.send('input_demand', "/direction/" + official_direction + "/" + milliseconds);
	    direction = "none";
	}
	else if(type == "/snake")
	{
	    index = message.indexOf("/");
	    var player = message.substring(0, index);
	    player = parseInt(player);
	    message = message.substring(index+1);
	    index = message.indexOf("/");
	    var head = message.substring(0, index)
	    message = message.substring(index+1);
	    index = message.indexOf("/");
	    var oldTail = message.substring(0, index);
	    var length = message.substring(index+1);
	    index = head.indexOf(",");
	    var head_x = head.substring(0, index);
	    var head_y = head.substring(index+2);
	    var head_coords = makeCords(head_x, head_y);
	    index = oldTail.indexOf(",");
	    var oldTail_x = oldTail.substring(0, index);
	    var oldTail_y = oldTail.substring(index+2);
	    var oldTail_coords = makeCords(oldTail_x, oldTail_y);

	    if(official_clientID != player)
	    {
		snakeList[player] = makeSnake();//head_coords);
		snakeList[player].head.val = head_coords;
		snakeList[player].oldTail = oldTail_coords;
	    }
	    else
	    {		
		if(!made_snake)
		{
		    snakeList[player] = makeSnake();//head_coords);
		    snakeList[player].head.val = head_coords;
		    snakeList[player].oldTail = oldTail_coords;
		    made_snake = true;
		}
		var no_expand = true;
		if(oldTail_x == snakeList[player].oldTail.x && oldTail_y == snakeList[player].oldTail.y)
		    no_expand = false;
		update(no_expand);
	    }

	    //snakeList[player].head.val = head_coords;
	    drawSnakes(snakeList);
	    log("Player " + player + " - Score: " + length);
	}
	else if(type == "/food")
	{
	    index = message.indexOf(",");
	    var food_x = message.substring(0, index);
	    var food_y = message.substring(index+2);
	    var coords = makeCords(food_x, food_y);
	    drawPixel(coords, "#FFF000")
	}
	else if(type == "/winner")
	{
	    log("The winner is Player " + message);
	    document.getElementById("setUsernameButton").disabled = false;
	    document.getElementById("readyButton").disabled = true;
	}
	else if(type == "/ntp")
	{
	    index = message.indexOf("/");
	    var serverTime = message.substring(index+1);
	    var previousTime = message.substring(0, index);
	    var currentTime = new Date().getTime();
	    previousTime = parseInt(previousTime);
	    serverTime = parseInt(serverTime);
	    log("Latency Estimation: " + ((currentTime - previousTime - serverTime)/2));
	}
	else if(type == "/disconnect")
	{
	    log(message)
	    document.getElementById("setUsernameButton").disabled = false;
	    document.getElementById("readyButton").disabled = true;
	}
	else if(type == "/welcome")
	{
	    index = message.indexOf("/");
	    official_clientID = parseInt(message.substring(0, index));
	    message = message.substring(index+1);
	    log(message);
	}
  else if(type == "/initialize_local")
  {
    index = message.indexOf("/");
    var head = message.substring(0, index)
    var oldTail = message.substring(index+1);
    index = head.indexOf(",");
    var head_x = parseInt(head.substring(0, index));
    var head_y = parseInt(head.substring(index+2));
    var head_coords = makeCords(head_x, head_y);
    index = oldTail.indexOf(",");
    var oldTail_x = parseInt(oldTail.substring(0, index));
    var oldTail_y = parseInt(oldTail.substring(index+2));
    var oldTail_coords = makeCords(oldTail_x, oldTail_y);

    if(!made_snake)
    {
        snakeList[official_clientID] = makeSnake();//head_coords);
        snakeList[official_clientID].head.val = head_coords;
        snakeList[official_clientID].oldTail = oldTail_coords;
        made_snake = true;
    }
    Server.send("done", "/done");
  }
    });

    Server.connect();
}

function setUsername()
{
    document.getElementById("setUsernameButton").disabled = true;
    Server.send('username', "/username/" + document.getElementById("username").value);
    document.getElementById("readyButton").disabled = false;
    clearCanvas();
}

function ready()
{
    document.getElementById("readyButton").disabled = true;
    // clearCanvas();
    Server.send('ready', "/ready/");
    // mainLoop([makeSnake(makeCords(9, 10)), makeSnake(makeCords(7, 10))], null);
    //reset();
}

function update(no_expand)
{
    var snake = snakeList[official_clientID];
    snake.head.next = makeNode(makeCords(snake.head.val.x + snake.direction.x,
					 snake.head.val.y + snake.direction.y), null);
    snake.head = snake.head.next;
    if(no_expand)
    {
	snake.oldTail = snake.tail.val;
	snake.tail = snake.tail.next;
    }
    snakeList[official_clientID] = snake;
}

// Client functions for Canvas

headList = new Array(2)
tailList = new Array(2)

// var snakes = {
// 	"headList" : headList,
// 	"tailList" : tailList
// }

function eventHandler(event)
{	
    switch (event.keyCode) {
    case 38: //up
	direction = "up";
	break;
    case 40: //down
	direction = "down";
	break;
    case 37:  //left
	direction = "left";
	break;
    case 39: //right
	direction = "right";
	break;
    case 87: //up2
	direction = "up";
	break;
    case 83: //down2
	direction = "down";
	break;
    case 65:  //left2
	direction = "left";
	break;
    case 68: //right2
	direction = "right";
	break;
    default:
    }
}

function drawSnakes(snakeList)
{
    for(var i in snakeList)
    {
	drawPixel(snakeList[i].oldTail, "#FFFFFF");
    }

    for(var i in snakeList)
    {
	drawPixel(snakeList[i].head.val, "#000000");
    }

}

var up = makeCords(0, -1);
var down = makeCords(0, 1);
var left = makeCords(-1, 0);
var right = makeCords(1, 0);

// Todo: Replace next of tail with a delayed expression.
function makeSnake()//ords)
{
    var node = makeNode(null, null);//cords, null);
    var snake = {"oldTail" : null,
		 "tail" : node,
		 "head" : node,
		 "direction" : right}
    
    return snake;
}

/*
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
  var newArgs = new Array(mappedArgs.length + 2);

  for (var i = 0; i < mappedArgs.length; ++i)
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





  // var drawPixel = function (cords, canvas, color)
  // {
  //     var context = canvas.getContext("2d");
  //     context.fillStyle = color;
  //     context.fillRect(cords.x*10, cords.y*10, 10, 10);
  // }

  var isCordsOnBoard = canvasDependencies[2];
  var makeEmptyBoard = canvasDependencies[1];
  var generateCordsOnBoard = canvasDependencies[3];
  var clearCanvas = canvasDependencies[4];






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
  {
  return 1 - i;
  }

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

  return null;
  }

  var snakeList = [makeSnake(makeCords(9,10)), makeSnake(makeCords(7,10))];
  var canvas = document.getElementById("a");
  var board = makeBoard(canvas);

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
  "board" : null},
  75);
  }

  function changeDirection(snake, direction) {
  if (!pairEquality(snake.direction, makeCords(-direction.x, -direction.y)) ||
  snake.length == 1)
  {
  snake.direction = direction;
  }
  
  return snake;
  }
  // function handleEvents(eventQueue, state)
  // {
  //     for (event 
  // }


  function mainLoop(state, frameTime)
  {
  var d = new Date();
  var initTime = d.getTime();
  
  function eventHandler(event)
  {
  var direction;
  
  switch (event.keyCode) {
  case 38: //up
  direction = up;
  break;
  case 40: //down
  direction = down;
  break;
  case 37:  //left
  direction = left;
  break;
  case 39: //right
  direction = right;
  break;
  case 87: //up2
  direction = up;
  break;
  case 83: //down2
  direction = down;
  break;
  case 65:  //left2
  direction = left;
  break;
  case 68: //right2
  direction = right;
  break;
  default:
  }

  if (event.keyCode <= 40)
  {
  state.snakeList[0] = changeDirection(state.snakeList[0], direction);
  }

  else
  {
  state.snakeList[1] = changeDirection(state.snakeList[1], direction);
  }
  }
  
  if (state.board == null)
  {
  document.addEventListener("keydown", eventHandler);
  state.board = makeBoard();
  clearCanvas();
  }

  // state = updateState(handleEvents(eventQueue, state));
  state = updateState(state);
  var winner = getWinner(state.snakeList);
  if (winner == null)
  {
  drawSnakes(state.snakeList);
  drawFood(state.board);
  Server.send('score', "/score-" + document.getElementById("username").value + "-" + state.snakeList[0].length);
  setTimeout(mainLoop, frameTime + initTime - d.getTime(), state, frameTime);
  }

  else
  {
  Server.send('score', "/score-" + document.getElementById("user1").value + "-" + state.snakeList[0].length);
  Server.send('score', "/score-" + document.getElementById("user2").value + "-" + state.snakeList[1].length);

  document.getElementById("userSendButton").disabled = false;
  }
  }
*/

