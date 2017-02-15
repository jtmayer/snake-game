#ifndef BOARD_HPP
#define BOARD_HPP

enum Item {empty, food, powerUp};

class Board
{
public:
  Board(int length, int width);

  void addItem(int item);

  void setItem(int x, int y, int item);
  
  int getItem(int x, int y);

private:
  std::vector<std::vector<int>> board;
  int length;
  int width;
};

#endif
