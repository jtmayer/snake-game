/*
Modified from chatroom demo

Group 12

Jonathan Mayer 66268081
Brian Lam 62101239
Yu Koizumi 000975171
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
#include <queue>
#include <chrono>
#include <mutex>
#include "Snake.hpp"
#include "Board.hpp"
#include "Message.hpp"

using namespace std;
using namespace chrono;

webSocket server;
map<string, int> userserverscores;
int players_num = 0;

Board board{0, 0};
Board* b = nullptr;
std::vector<Snake*> snakeList;
std::vector<Coord> directions;
bool gameOver;
std::map<int, std::string> players;
std::map<std::string, int> highscores;
int ready;
int frame = 0;
std::mutex mtx;
std::priority_queue<Message> in_pq;
std::priority_queue<Message> out_pq;
std::map<int, long> clientTime;
std::map<int, long> serverTime;
const int DELAY = 50; // in ms, temporary
bool done = false;


bool colisionCheck();
int winner();
void gameLoop();
void scoring();
bool wallCheck();
bool inputsReceived();

int randomDelay()
{
	return random() % 500; // in ms
}

long getTime() //in ms
{
	return duration_cast<milliseconds>(system_clock::now().time_since_epoch()).count();
}

void logToQueue(std::priority_queue<Message>& pq, int clientID, std::string msg, int delay)
{
	Message m{clientID, msg, getTime() + delay};
	pq.push(m);
}

void checkOutQueue()
{
	if(out_pq.empty())
	{
		return;
	}
	Message m = out_pq.top();
	if(m.getTimestamp() < getTime())
	{
		out_pq.pop();
		server.wsSend(m.getClientID(), m.getMessage());
	}
}

void checkInQueue()
{
	if(in_pq.empty())
	{
		return;
	}
	Message m = in_pq.top();
	if(m.getTimestamp() < getTime())
	{
		in_pq.pop();
		std::string message = m.getMessage();
		int clientID = m.getClientID();
	    int pos = message.find("-");
	    string type = message.substr(0, pos);
	    message = message.substr(pos+1);

	    if(type == "/direction")
	    {
            pos = message.find("-");
            std::string direction = message.substr(0, pos);
            std::string s_time = message.substr(pos+1);
            cout << s_time << endl;
            long time = std::stol(s_time);
	        Coord newDirection{};
	        if(direction == "left")
	            newDirection = LEFT;
	        else if(direction == "right")
	            newDirection = RIGHT;
	        else if(direction == "down")
	            newDirection = DOWN;
	        else if(direction == "up")
	            newDirection = UP;
	        else
	            newDirection = NONE;
	        directions[clientID] = newDirection;
            clientTime[clientID] = time;
            serverTime[clientID] = getTime();
	        int delay = randomDelay();
	        gameLoop();
	    }
	    else if(type == "/ready")
	    {
	        ready++;
	        if(ready >= 2)
	        {
                for(int i = 0; i < server.getClientIDs().size(); i++)
	               logToQueue(out_pq, i, "/input_demand-", randomDelay());
	            gameLoop();
	        }
	    }
	    else if(type == "/username")
	    {
	        players[clientID] = message;
	    }
	}
}

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

    std::cout << frame << std::endl;
    frame++;

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
        Snake* s = snakeList[i];
        std::ostringstream os;
        Coord head = s->getHead();
        Coord oldTail = s->getOldTail();
        os << "/snake-" << i << "-" << head.str() << "-" << oldTail.str() << "-" << s->getLength();
        for(int j = 0; j < server.getClientIDs().size(); j++)
        {
            //server.wsSend(i, os.str());
            logToQueue(out_pq, j, os.str(), randomDelay());
        }
    }

    if(colisionCheck() || wallCheck())
    {
        int w = winner();
        std::ostringstream os;
        os << "/winner-" << w;
        for(int i = 0; i < server.getClientIDs().size(); i++)
            logToQueue(out_pq,i , os.str(), randomDelay());
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
                    logToQueue(out_pq, k, os.str(), randomDelay());
                foodFound = true;
                break;
            }
        }
        if(foodFound)
            break;
    }

    // check if game is over

    // for(int i = 0; i < server.getClientIDs().size(); i++)
    // {
    //     server.wsSend(i, "/input_demand-");// + str(frame));
    // }
    for(int i = 0; i < server.getClientIDs().size(); i++)
        logToQueue(out_pq, i, "/ntp-" + to_string(clientTime[i]) + "-" + to_string(getTime() - serverTime[i]), randomDelay());
    
    for(int i = 0; i < server.getClientIDs().size(); i++)
        logToQueue(out_pq, i,"/input_demand-", randomDelay());
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
	logToQueue(in_pq, clientID, message, randomDelay());
}

void gameOpenHandler(int clientID){
    std::ostringstream os;
    if (clientID >= 2)
    {
        server.wsSend(clientID, "The server is full!");
        server.wsClose(clientID);
    }
    players_num++;
    os << "Welcome! You are Player " << clientID;
    server.wsSend(clientID, os.str());
    for(int i = 0; i < clientID; i++)
        server.wsSend(i, "/welcome-");
}

void gameCloseHandler(int clientID){
	players_num--;
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

void gamePeriodicHandler()
{
	checkOutQueue();
	checkInQueue();
}

// Server

void serverThread(int port)
{
	server.startServer(port);
}

void queueThread()
{
	while(!done)
	{
		//mtx.lock();
		checkOutQueue();
		checkInQueue();
		//mtx.unlock();
		this_thread::sleep_for(chrono::milliseconds{randomDelay()});
	}
}

void serverConsoleThread()
{
	this_thread::sleep_for(chrono::milliseconds{1000});
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
				done = true;
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
    server.setPeriodicHandler(gamePeriodicHandler);

    initializeGame(50, 50, 2);
    thread t1{serverThread, port};
    thread t2{serverConsoleThread};
    //thread t3{queueThread};

    t1.join();
    t2.join();
    //t3.join();

    cout << "Server closed!" << endl;

    std::fstream file;
    file.open("highscores.txt");
    string line{};
    while(getline(file, line))
    {
        int index = line.find_last_of("-");
        string user = line.substr(0, index);
        int score = stoi(line.substr(index+1, 1));
        if(userserverscores.count(user)>0)
        {
            if (score > userserverscores[user])
                userserverscores[user] = score;
        }
        else
            userserverscores[user] = score;
    }

    file.close();

    std::map<std::string, int> highscores = getHighscores();
    for(auto it = highscores.begin(); it != highscores.end(); it++)
        userserverscores[it->first] = it->second;

    std::ofstream outFile;
    outFile.open("highscores.txt", ios::trunc);
    for(auto it = userserverscores.begin(); it != userserverscores.end(); it++)
        outFile << it->first << "-" << it->second << "\n";
    outFile.close();

    cout << "Done!" << endl;

    return 1;
}
