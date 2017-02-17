#include "SnakeGame.hpp"

#include "Snake.hpp"
#include "Board.hpp"
#include <exception>
#include "websocket.h"
#include <sstream>
#include <algorithm>
#include <iostream>

Board board{0,0};
std::vector<Snake> snakeList;
webSocket* _s=nullptr;
//int frame;
std::vector<Coord> directions;
bool gameOver;
std::map<int, std::string> players;
std::map<std::string, int> highscores;
int ready;

void initializeGame(int length, int width, int num_players, webSocket* s)
{
	_s = s;
	if(num_players > std::min(length, width))
	{
		throw; //std::range_error::range_error{"Number of players has exceeded board size!"};
	}
	board = Board{length, width};
	for(int i = 0 ; i < num_players; i++)
	{
		Coord c{i, i};
		snakeList.push_back(Snake{c, &board}); //Temporary starting positions
	}
	directions = std::vector<Coord>(num_players, INVALID);
	gameOver = false;
	ready = 0;
	std::cout << "done" << std::endl;
}

void gameLoop()
{
	while(!gameOver)
	{
		for(int i = 0; i < directions.size(); i++)
			directions[i] = INVALID;

		// request all client send input before moving on
		for(int i = 0; i < _s->getClientIDs().size(); i++)
		{
			_s->wsSend(i, "/input_demand-");// + str(frame));
		}

		// while not all input received
		while(!inputsReceived())
		{
			// do nothing
		}

		// change directions if any want to be changed
		for(int i = 0; i < directions.size(); i++)
		{
			if(directions[i] != NONE)
				snakeList[i].changeDirection(directions[i]);
			directions[i] = INVALID;
		}

		// update snakes
		for(int i = 0; i < snakeList.size(); i++)
		{
			snakeList[i].update();
		}

		// send client updated snake coords
		for(int i = 0; i < _s->getClientIDs().size(); i++)
		{
			for(int j = 0; j < _s->getClientIDs().size(); j++)
			{
				Snake s = snakeList[j];
				std::ostringstream os;
				Coord head = s.getHead();
				Coord oldTail = s.getOldTail();
				os << "/snake-" << j << "-" << head.str() << "-" << oldTail.str() << "-" << s.getLength();
				_s->wsSend(i, os.str());
			}
		}

		// send clients item positions
		bool foodFound = false;
		for(int i = 0; i < board.getLength(); i++)
		{
			for(int j = 0; j < board.getWidth(); j++)
			{
				if(board.getItem(i, j) == food)
				{
					std::ostringstream os;
					os << "/food-" << i << "," << j;
					for(int k = 0; k < _s->getClientIDs().size(); k++)
						_s->wsSend(k, os.str());
					foodFound = true;
					break;
				}
			}
			if(foodFound)
				break;
		}

		// check if game is over
		if(colisionCheck() || wallCheck())
		{
			int w = winner();
			for(int i = 0; i < _s->getClientIDs().size(); i++)
			{
				std::ostringstream os;
				os << "/winner-" << w;
				_s->wsSend(i, os.str());
			}
			gameOver = true;
			scoring();
		}

		//frame++;
	}
}

int winner()
{
	int length = 0;
	int w = -1;
	for(int i = 0; i < snakeList.size(); i++)
	{
		if(snakeList[i].getLength() > length)
		{
			length = snakeList[i].getLength();
			w = i;
		}
	}
	return w;
}

void scoring()
{
	for(int i = 0; i < _s->getClientIDs().size(); i++)
	{
		std::string player = players[i];
		if(snakeList[i].getLength() > highscores[player])
			highscores[player] = snakeList[i].getLength();
	}
}

bool colisionCheck()
{
	for(int i = 0; i < snakeList.size(); i++)
	{
		std::vector<Coord> snakeCoords = snakeList[i].getSnakePosition();
		for(int j = 0; j < snakeList.size(); j++)
		{
			if(i != j)
			{
				for(int k = 0; k < snakeCoords.size(); k++)
				{
					if(snakeCoords[k] == snakeList[j].getHead())
						return true;
				}
			}
		}
	}
	return false;
}

bool wallCheck()
{
	for(int i = 0; i < snakeList.size(); i++)
	{
		Coord head = snakeList[i].getHead();
		if(head.x < 0 || head.y < 0 || head.x >= board.getLength() || head.y >= board.getWidth())
			return true;
	}
	return false;
}

bool inputsReceived()
{
	for(int i = 0; i < directions.size(); i++)
	{
		if(directions[i] == INVALID)
			return false;
	}
	return true;
}

std::map<std::string, int> getHighscores()
{
	return highscores;
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
    	ready++;
    	if(ready >= 2)
    		gameLoop();
    }
    else if(type == "/username")
    {
    	players[clientID] = message;
    }
}

void gameOpenHandler(int clientID){
    std::ostringstream os;
    if (clientID >= 2)
    {
        _s->wsSend(clientID, "The _s is full!");
        _s->wsClose(clientID);
    }
    os << "Welcome! You are Player " << clientID;
    _s->wsSend(clientID, os.str());
    for(int i = 0; i < clientID; i++)
    	_s->wsSend(i, "/welcome-");
}

void gameCloseHandler(int clientID){
    if(clientID < 2)
    {
        for(int i = 0; i < _s->getClientIDs().size(); i++)
        {
            std::ostringstream os;
            os << "Oh no! Player " << clientID << " disconnected! Game over!";
            if(i != clientID)
                _s->wsSend(i, os.str());
        }
        gameOver = true;
    }
}

