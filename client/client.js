var canvas = document.getElementById("a");

var drawSnakes = function (snakeList, canvas)
{
    for each (var snake in snakeList)
    {
	drawPixel(snake.oldTail, canvas, "0xFF");
    }

    for each (var snake in snakeList)
    {
	drawPixel(snake.head.val, canvas, "0x00");
    }
}

var drawPixel = function (coordinates, canvas, color)
{
    var context = canvas.getContext("2d");
    context.fillStyle = color;
    context.fillRect(coordinates.x, coordinates.y, 1, 1);
}
