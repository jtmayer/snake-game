#include <random>
#include "Board.hpp"

Board::Board(int length, int width)
{
  board = std::vector<std::vector<int>>(length);
  for(int i = 0; i < length; i++)
  {
    board[i] = std::vector<int>(width, 0);
  }
  this->length = length;
  this->width = width;
}

void Board::addItem(int item)
{
  int x = rand() * length;
  int y = rand() * width;
  board[x][y] = item;
}

void Board::setItem(int x, int y, int item)
{
  board[x][y] = item;
}

int Board::getItem(int x, int y)
{
  return board[x][y];
}

int Board::getLength()
{
  return length;
}

int Board::getWidth()
{
  return width;
}
