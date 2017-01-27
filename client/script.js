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

var canvas = document.getElementById("a");
var cords = {
    'x' = 5;
    'y' = 5;
};
drawPixel(cords, canvas, "0x00");