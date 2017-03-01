/*
Created for Milestone 2

Group 12

Jonathan Mayer 66268081
Brian Lam 62101239
Yu Koizumi 000975171
Tommy Wong 71659011
*/

#ifndef SNAKE_HPP
#define SNAKE_HPP

#include "Board.hpp"
#include <sstream>
#include <vector>
#include <string>
#include <iostream>

struct Coord
{

	int x;
  	int y;

	Coord operator+(Coord coord2)
	{
		return Coord{x + coord2.x, y + coord2.y};
	}

	bool operator==(Coord coord2)
	{
		return this->x == coord2.x && this->y == coord2.y;
	}

	bool operator!=(Coord coord2)
	{
		return !(*this == coord2);
	}

	Coord operator+=(Coord coord2)
	{
		x += coord2.x;
		y += coord2.y;
		return *this;
	}

	Coord operator-()
	{
		return Coord{-x, -y};
	}

	std::string str()
	{
		std::ostringstream os;
		os << x << ", " << y;
		return os.str();
	}
};

const Coord UP{0, -1};
const Coord DOWN{0, 1};
const Coord LEFT{-1, 0};
const Coord RIGHT{1, 0};
const Coord NONE{0, 0};
const Coord INVALID{-1, -1};

class Snake
{
public:
  Snake(Coord starting_pos, Board* board);

  ~Snake();

  void update();

  void changeDirection(Coord direction);

  Coord getHead();

  Coord getOldTail();

  int getLength();

  std::vector<Coord> getSnakePosition();

private:

	struct Node
	{
	  Node* next;	
	  Coord value;
	};


	Node* head;
	Node* tail;
	Coord oldTail;
	int length;
	Coord direction;
	Board* board;
};

#endif