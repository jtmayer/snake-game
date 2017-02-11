#include "Snake.hpp"
#include "Board.hpp"
#include <exception>
#include "websocket.h"

Board board;
std::vector<Snake> snakeList;
server*

void initializeGame(int length, int width, int num_players)
{
	if(num_players > min(length, width))
	{
		throw std::range_error::range_error{"Number of players has exceeded board size!"};
	}
	board = Board{length, width};
	for(int i = 0 ; i < num_players; i++)
	{
		snakeList.push_back(Snake{Coord{i, i}, *board}); //Temporary starting positions
	}
}

void gameLoop()
{
	while(true)
	{
		for(int i = 0; i < snakeList.size(); i++)
		{
			snakeList[i].update();
		}
		for(int i = 0; i < server.getClientIDs().size(); i++)
		{
			server->wsSend(i, ); // Incomplete
		}
	}
}

void gameMessageHandler(int clientID, std::string message)
{
	int pos = message.find("-");
    string type = message.substr(0, pos);
    message = message.substr(pos+1);

    if(type == "/direction")
    {
    	Coord newDirection{};
    	if(message == "left")
    		newDirection = LEFT;
    	else if(message == "right")
    		newDirection = RIGHT;
    	else if(message == "down")
    		newDirection = DOWN;
    	else if(message == "up")
    		newDirection = UP;
    	
    	snakeList[clientID].changeDirection(newDirection);
    }
}