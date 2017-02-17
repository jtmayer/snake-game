#ifndef SNAKEGAME_HPP
#define SNAKEGAME_HPP

#include "Snake.hpp"
#include "Board.hpp"
#include <exception>
#include "websocket.h"
#include <sstream>
#include <algorithm>

// Board board{0, 0};
// std::vector<Snake> snakeList;
// webSocket* server;
// //int frame;
// int ready;
// std::vector<Coord> directions;
// bool gameOver;
// std::map<int, std::string> players;
// std::map<std::string, int> highscores;

void initializeGame(int length, int width, int num_players, webSocket* s);

void gameLoop();

int winner();

void scoring();

bool colisionCheck();

bool wallCheck();

bool inputsReceived();

std::map<std::string, int> getHighscores();

void gameMessageHandler(int clientID, std::string message);

void gameOpenHandler(int clientID);

void gameCloseHandler(int clientID);

#endif // SNAKEGAME_HPP