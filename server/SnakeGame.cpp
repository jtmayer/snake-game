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
bool gameOver;
std::map<int, std::string> players;
std::map<std::string, int> highscores;

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
		snakeList.push_back(Snake{Coord{i, i}, &board}); //Temporary starting positions
	}
	directions = std::vector<Coord>(num_players, NULL);
	gameOver = false;
	//frame = 0;
}

void gameLoop()
{
	while(!gameOver)
	{
		for(int i = 0; i < directions.size(); i++)
			directions[i] = NULL;

		// request all client send input before moving on
		for(int i = 0; i < server->getClientIDs().size(); i++)
		{
			server->wsSend(i, "/input_demand-");// + str(frame));
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
			directions[i] = NULL;
		}

		// update snakes
		for(int i = 0; i < snakeList.size(); i++)
		{
			snakeList[i].update();
		}

		// send client updated snake coords
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

		// send clients item positions
		bool foodFound = false;
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
			int winner = winner();
			for(int i = 0; i < server->getClientIDs().size(); i++)
			{
				ostringstream os;
				os < "/winner-" << winner;
				server->wsSend(i, os.str());
			}
			gameOver = true;
			scoring()
		}

		//frame++;
	}
}

int winner()
{
	int length = 0;
	int winner = -1;
	for(int i = 0; i < snakeList.size(); i++)
	{
		if(snakeList[i].getLength() > length)
		{
			length = snakeList[i].getLength();
			winner = i;
		}
	}
	return winner;
}

void scoring()
{
	for(int i = 0; i < server->getClientIDs().size(); i++)
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
	for(int i = 0; i < snakeList[i]; i++)
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
		if(directions[i] == NULL)
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

    }
    else if(type == "/username")
    {

    }
}

void gameOpenHandler(int clientID){
    ostringstream os;
    if (clientID >= 2)
    {
        server.wsSend(clientID, "The server is full!");
        server.wsClose(clientID);
    }
    os << "Welcome! You are Player " << clientID;
    server.wsSend(clientID, os.str());
}

void gameCloseHandler(int clientID){
    if(clientID < 2)
    {
        for(int i = 0; i < server->getClientIDs().size(); i++)
        {
            ostringstream os;
            os << "Oh no! Player " << clientID << " disconnected! Game over!";
            if(i != clientID)
                server->wsSend(i, os.str());
        }
        gameOver = true;
    }
}

