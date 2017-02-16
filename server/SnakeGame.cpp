#include "Snake.hpp"
#include "Board.hpp"
#include <exception>
#include "websocket.h"
#include <sstream>
#include <algorithm>

Board board;
std::vector<Snake> snakeList;
webSocket* server;
//int frame;
std::vector<Coord> directions;

void initializeGame(int length, int width, int num_players, webSocket* s)
{
	server = s;
	if(num_players > std::min(length, width))
	{
		throw std::range_error::range_error{"Number of players has exceeded board size!"};
	}
	board = Board{length, width};
	for(int i = 0 ; i < num_players; i++)
	{
		snakeList.push_back(Snake{Coord{i, i}, *board}); //Temporary starting positions
	}
	directions = std::vector<Coord>(num_players, NULL);
	//frame = 0;
}

void gameLoop()
{
	while(true)
	{
		for(int i = 0; i < directions.size(); i++)
			directions[i] = NULL;

		for(int i = 0; i < server->getClientIDs().size(); i++)
		{
			server->wsSend(i, "/input_demand-");// + str(frame));
		}

		// while not all input received
		while(!inputsReceived())
		{
			// do nothing
		}

		for(int i = 0; i < directions.size(); i++)
		{
			if(directions[i] != NONE)
				snakeList[i].changeDirection(directions[i]);
			directions[i] = NULL;
		}
		for(int i = 0; i < snakeList.size(); i++)
		{
			snakeList[i].update();
		}
		for(int i = 0; i < server->getClientIDs().size(); i++)
		{
			for(int j = 0; j < server->getClientIDs().size(); j++)
			{
				Snake s = snakeList[j];
				std::ostringstream os;
				Coord head = s.getHead();
				Coord oldTail = s.getOldTail();
				os << "/snake-" << j << "-" << head.str() << "-" << oldTail.str() << "-" << s.getLength();
				server->wsSend(i, os.str());
			}
		}
		for(int i = 0; i < board.getLength(); i++)
		{
			for(int j = 0; j < board.getWidth(); j++)
			{
				if(board.getItem(i, j) == food)
				{
					ostringstream os;
					os << "/food-" << i << "," << j;
					for(int k = 0; k < server->getClientIDs.size(); k++)
						server->wsSend(k, os.str());
				}
			}
		}
		//frame++;
	}
}

bool inputsReceived()
{
	for(int i = 0; i < directions.size(); i++)
	{
		if(directions[i] == NULL)
			return false;
	}
	return true;
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
    	else
    		newDirection = NONE;
    	directions[clientID] = newDirection;
    }
    else if(type == "/ready")
    {

    }
    else if(type == "/username")
    {
    	
    }
}