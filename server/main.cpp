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

using namespace std;

webSocket server;
map<string, int> current_scores;
map<string, int> user_scores;

/* called when a client connects */
void openHandler(int clientID){
    ostringstream os;
    if (clientID >= 2)
    {
        server.wsSend(clientID, "The server is full!");
        server.wsClose(clientID);
    }
    os << "Welcome! You are Player " << clientID;
    server.wsSend(clientID, os.str());
}

/* called when a client disconnects */
void closeHandler(int clientID){
    if(clientID < 2)
    {
        for(int i = 0; i < server->getClientIDs().size(); i++)
        {
            ostringstream os;
            os << "Oh no! Player " << clientID << " disconnected! Game over!";
            if(i != clientID)
                server->wsSend(i, os.str());
        }
    }
}

/* called when a client sends a message to the server */
void messageHandler(int clientID, string message){
    ostringstream os;
    
    int pos = message.find("-");
    string type = message.substr(0, pos);
    message = message.substr(pos+1);

    if(type == "/score")
    {
    	int index = message.find_last_of("-");
    	string user = message.substr(0, index);
    	int score = stoi(message.substr(index+1));
    	if (score > current_scores[user])
        {
    		current_scores[user] = score;
            os << "Score: " << user << " - " << score;
    	    server.wsSend(clientID, os.str());
        }
        if (score > user_scores[user])
        {
            user_scores[user] = score;
        }
    }
    else if(type == "/start_game")
    {
        for(auto it = current_scores.begin(); it != current_scores.end(); it++)
        {
            current_scores[it->first] = 0;
        }
    }
}

/* called once per select() loop */
void periodicHandler(){
    static time_t next = time(NULL) + 10;
    time_t current = time(NULL);
    if (current >= next){
        ostringstream os;
        string timestring = ctime(&current);
        timestring = timestring.substr(0, timestring.size() - 1);
        os << timestring;

        vector<int> clientIDs = server.getClientIDs();
        for (int i = 0; i < clientIDs.size(); i++)
            server.wsSend(clientIDs[i], os.str());

        next = time(NULL) + 10;
    }
}

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
    server.setOpenHandler(openHandler);
    server.setCloseHandler(closeHandler);
    server.setMessageHandler(messageHandler);
    //server.setPeriodicHandler(periodicHandler);

    thread t1{serverThread, port};
    thread t2{serverConsoleThread};

	time_t now = time(0);
	string date_time = ctime(&now);

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
        if(user_scores.count(user)>0)
        {
            if (score > user_scores[user])
                user_scores[user] = score;
        }
        else
            user_scores[user] = score;
    }

    file.close();

    std::ofstream outFile;
    outFile.open("highscores.txt", ios::trunc);
    for(auto it = user_scores.begin(); it != user_scores.end(); it++)
        outFile << it->first << "-" << it->second << "\n";
    outFile.close();

    cout << "Done!" << endl;

    return 1;
}
