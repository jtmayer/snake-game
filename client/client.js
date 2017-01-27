var drawSnake = function (snakeList, canvas)
{
    for each (snake in snakeList)
    {
	drawPixel(snake.oldTail, canvas, 0xFF);
    }

    for each (snake in snakeList)
    {
	drawPixel(snake.tail.val, canvas, 0x00);
    }
}

var drawPixel
