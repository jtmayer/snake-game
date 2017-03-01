/*
Created for Milestone 2

Group 12

Jonathan Mayer 66268081
Brian Lam 62101239
Yu Koizumi 000975171
Tommy Wong 71659011
*/

#ifndef BOARD_HPP
#define BOARD_HPP

#include <vector>

enum Item {empty, food, powerUp};

class Board
{
public:
  Board(int length, int width);

  void addItem(int item);

  void setItem(int x, int y, int item);
  
  int getItem(int x, int y);

  int getLength();

  int getWidth();

private:
  std::vector<std::vector<int>> board;
  int length;
  int width;
};

#endif
