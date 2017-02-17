#ifndef SNAKE_HPP
#define SNAKE_HPP

#include "Board.hpp"
#include <sstream>
#include <vector>
#include <string>

struct Coord
{
	// Coord()
	// {
	// 	x = 0;
	// 	y = 0;
	// }
	// Coord(int x, int y)
	// {
	// 	this->x = x;
	// 	this->y = y;
	// }

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
  
  int x;
  int y;
};

struct Node
{
  Node* next;	
  Coord value;
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
  Node* head;
  Node* tail;
  Coord oldTail;
  int length;
  Coord direction;
  Board* board;
};

#endif