#include "Snake.hpp"
#include "Board.hpp"
#include <exception>
#include "websocket.h"
#include <sstream>

Board board;
std::vector<Snake> snakeList;
webSocket* server;
int frame;
std::vector<Coord> directions;

void initializeGame(int length, int width, int num_players, webSocket* s)
{
	server = s;
	if(num_players > min(length, width))
	{
		throw std::range_error::range_error{"Number of players has exceeded board size!"};
	}
	board = Board{length, width};
	for(int i = 0 ; i < num_players; i++)
	{
		snakeList.push_back(Snake{Coord{i, i}, *board}); //Temporary starting positions
	}
	directions = std::vector<Coord>(num_players, NULL);
	frame = 0;
}

void gameLoop()
{
	while(true)
	{
		for(int i = 0; i < directions.size(); i++)
			directions[i] = NULL;

		for(int i = 0; i < server.getClientIDs().size(); i++)
		{
			server.wsSend(i, "/input_demand-" + str(frame));
		}

		// while not all input received
		while(!inputsReceived())
		{

		}

		for(int i = 0; i < snakeList.size(); i++)
		{
			snakeList[i].update();
		}
		for(int i = 0; i < server.getClientIDs().size(); i++)
		{
			Snake s = snakeList[i];
			std::ostringstream os;
			Coord head = s.getHead();
			Coord oldTail = s.getOldTail();
			os << "/head-" << head.str();
			server->wsSend(i, os.str()); // Incomplete
			os << "/oldTail-" << oldTail.str();
			server->wsSend(i, os);
		}
		frame++;
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
}