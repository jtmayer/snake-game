/*
Modified from chatroom demo

Group 12

Jonathan Mayer 66268081
Brian Lam 62101239
Yu Koizumi 
Tommy Wong 71659011
*/

#include <stdlib.h>
#include <iostream>
#include <string>
#include <sstream>
#include <time.h>
#include "websocket.h"

#include <thread>
#include <fstream>
#include <map>
#include <exception>
#include <algorithm>
#include "Snake.hpp"
#include "Board.hpp"

using namespace std;

webSocket server;
map<string, int> userservercores;

Board board{0, 0};
Board* b = nullptr;
std::vector<Snake*> snakeList;
std::vector<Coord> directions;
bool gameOver;
std::map<int, std::string> players;
std::map<std::string, int> highscores;
int ready;
int test = 0;

bool colisionCheck();
int winner();
void gameLoop();
void scoring();
bool wallCheck();
bool inputsReceived();

void initializeGame(int length, int width, int num_players)
{
    if(num_players > std::min(length, width))
    {
        throw; //std::range_error::range_error{"Number of players has exceeded board size!"};
    }
    board = Board{length, width};
    board.setItem(25, 25, food);
    b = &board;
    for(int i = 0 ; i < num_players; i++)
    {
        Coord c{5*(i+1), 5*(i+1)};
        Snake* sp = new Snake{c, b};
        snakeList.push_back(sp); //Temporary starting positions
    }
    directions = std::vector<Coord>(num_players, INVALID);
    gameOver = false;
    ready = 0;
}

void gameLoop()
{
    //while(!gameOver)
    //{
    if(gameOver)
        return;

    std::cout << test << std::endl;
    test++;

    // request all client send input before moving on

    // while not all input received
    std::cout << "input" << endl;
    // while(!inputsReceived())
    // {
    //     // do nothing
    // }
    if (!inputsReceived())
        return;
    std::cout << "not client" << endl; 

    // change directions if any want to be changed
    for(int i = 0; i < directions.size(); i++)
    {
        if(directions[i] != NONE)
            snakeList[i]->changeDirection(directions[i]);
        directions[i] = INVALID;
    }

    // update snakes
    for(int i = 0; i < snakeList.size(); i++)
    {
        snakeList[i]->update();
    }

    // send client updated snake coords
    for(int i = 0; i < server.getClientIDs().size(); i++)
    {
        for(int j = 0; j < server.getClientIDs().size(); j++)
        {
            Snake* s = snakeList[j];
            std::ostringstream os;
            Coord head = s->getHead();
            Coord oldTail = s->getOldTail();
            os << "/snake-" << j << "-" << head.str() << "-" << oldTail.str() << "-" << s->getLength();
            server.wsSend(i, os.str());
        }
    }

    if(colisionCheck() || wallCheck())
    {
        int w = winner();
        for(int i = 0; i < server.getClientIDs().size(); i++)
        {
            std::ostringstream os;
            os << "/winner-" << w;
            server.wsSend(i, os.str());
        }
        gameOver = true;
        scoring();
        ready = 0;
        return;
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
                os << "/food-" << i << ", " << j;
                for(int k = 0; k < server.getClientIDs().size(); k++)
                    server.wsSend(k, os.str());
                foodFound = true;
                break;
            }
        }
        if(foodFound)
            break;
    }

    // check if game is over

    for(int i = 0; i < server.getClientIDs().size(); i++)
    {
        server.wsSend(i, "/input_demand-");// + str(frame));
    }
    //frame++;
    //}
}

int winner()
{
    int length = 0;
    int w = -1;
    for(int i = 0; i < snakeList.size(); i++)
    {
        if(snakeList[i]->getLength() > length)
        {
            length = snakeList[i]->getLength();
            w = i;
        }
    }
    return w;
}

void scoring()
{
    for(int i = 0; i < server.getClientIDs().size(); i++)
    {
        std::string player = players[i];
        if(snakeList[i]->getLength() > highscores[player])
            highscores[player] = snakeList[i]->getLength();
    }
}

bool colisionCheck()
{
    for(int i = 0; i < snakeList.size(); i++)
    {
        std::vector<Coord> snakeCoords = snakeList[i]->getSnakePosition();
        for(int j = 0; j < snakeList.size(); j++)
        {
            if(i != j)
            {
                for(int k = 0; k < snakeCoords.size(); k++)
                {
                    if(snakeCoords[k] == snakeList[j]->getHead())
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
        Coord head = snakeList[i]->getHead();
        if(head.x < 0 || head.y < 0 || head.x >= board.getLength()-1 || head.y >= board.getWidth()-1)
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
    std::cout << message << std::endl;
    int pos = message.find("-");
    string type = message.substr(0, pos);
    message = message.substr(pos+1);

    if(type == "/direction")
    {
        std::cout << message << std::endl;
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
        chrono::nanoseconds delay{100000000};
        this_thread::sleep_for(delay);
        gameLoop();
    }
    else if(type == "/ready")
    {
        ready++;
        if(ready >= 2)
        {
            for(int i = 0; i < server.getClientIDs().size(); i++)
            {
                server.wsSend(i, "/input_demand-");// + str(frame));
            }
            gameLoop();
        }
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
        server.wsSend(clientID, "The server is full!");
        server.wsClose(clientID);
    }
    os << "Welcome! You are Player " << clientID;
    server.wsSend(clientID, os.str());
    for(int i = 0; i < clientID; i++)
        server.wsSend(i, "/welcome-");
}

void gameCloseHandler(int clientID){
    if(clientID < 2)
    {
        for(int i = 0; i < server.getClientIDs().size(); i++)
        {
            std::ostringstream os;
            os << "Oh no! Player " << clientID << " disconnected! Game over!";
            if(i != clientID)
                server.wsSend(i, os.str());
        }
        gameOver = true;
    }
}

// Server

void serverThread(int port)
{
	server.startServer(port);
}

void serverConsoleThread()
{
	chrono::nanoseconds delay{1000000000};
	this_thread::sleep_for(delay);
    cout << "Type quit to end server." << endl;;
	while(true)
	{
		try
		{
			string input;
			cin >> input;
			if(input == "quit")
			{
				server.stopServer();
				break;
			}
			else if(input == "help")
			{
				cout << "Needs to be implemented" << endl;
			}
			else
			{
				cout << "Invalid input" << std::endl;
			}
		}
		catch(...)
		{
			cout << "Exception occured. Perhaps you entered incorrect info?" << endl;
		}
	}
}

int main(int argc, char *argv[]){
    int port;

    cout << "Please set server port: ";
    cin >> port;

    /* set event handler */
    server.setOpenHandler(gameOpenHandler);
    server.setCloseHandler(gameCloseHandler);
    server.setMessageHandler(gameMessageHandler);
    //server.setPeriodicHandler(periodicHandler);

    initializeGame(50, 50, 2);
    thread t1{serverThread, port};
    thread t2{serverConsoleThread};

    t1.join();
    t2.join();

    cout << "Server closed!" << endl;

    std::fstream file;
    file.open("highscores.txt");
    string line{};
    while(getline(file, line))
    {
        int index = line.find_last_of("-");
        string user = line.substr(0, index);
        int score = stoi(line.substr(index+1, 1));
        if(userservercores.count(user)>0)
        {
            if (score > userservercores[user])
                userservercores[user] = score;
        }
        else
            userservercores[user] = score;
    }

    file.close();

    std::map<std::string, int> highscores = getHighscores();
    for(auto it = highscores.begin(); it != highscores.end(); it++)
        userservercores[it->first] = it->second;

    std::ofstream outFile;
    outFile.open("highscores.txt", ios::trunc);
    for(auto it = userservercores.begin(); it != userservercores.end(); it++)
        outFile << it->first << "-" << it->second << "\n";
    outFile.close();

    cout << "Done!" << endl;

    return 1;
}
