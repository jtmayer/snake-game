#ifndef SNAKE_HPP
#define SNAKE_HPP

#include "Board.hpp"

struct Node
{
  Node* next;	
  Coord value;
};

struct Coord
{
  Coord(int x, int y);

  Coord operator+(Coord coord2);

  Coord operator+=(Coord coord2);

  Coord operator==(Coord coord2);

  Coord operator!=(Coord coord2);

  Coord operator-();

  std::string str();
  
  int x;
  int y;
};

const Coord UP{0, -1};
const Coord DOWN{0, 1};
const Coord LEFT{-1, 0};
const Coord RIGHT{1, 0};
const Coord NONE{0, 0};

class Snake
{
public:
  Snake(Coord c, Board* board);

  void update();

  void changeDirection(Coord direction);

  Coord getHead();

  Coord getOldTail();

private:
  Node* head;
  Node* tail;
  Coord oldTail;
  int length;
  Coord direction;
  Board* board;
};

#endif