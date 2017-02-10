#include "Snake.hpp"
#include "Board.hpp"

struct Node
{
  Node* next;	
  Coord c;
};

struct Coord
{
  Coord(int x, int y)
  {
    this.x = x;
    this.y = y;
  }

  Coord operator+(Coord coord2)
  {
    return Coord(x + coord2.x, y + coord2.y);
  }

  Coord operator+=(Coord coord2)
  {
    x += coord2.x;
    y += coord2.y;
    return this;
  }
  
  int x;
  int y;
};

class Snake
{
public:
  Snake(Coord c, Board* board)
  {
    Node* n = new Node{nullptr, c};
    head = n;
    tail = n;
    length = 1;
    direction = Coord{1, 0};
    this.board = board;
  }

  void update()
  {
    head = head->next = new Node{nullptr, head->value + direction};
    int x = head->value.x;
    int y = head->value.y;
    if(board->getItem(x, y) == food) // Check for food
      {
	length++;
	board->setItem(x, y, empty);
	board-> addItem(food);
	return;
			
      }
    Node* temp = tail;
    tail = tail->next;
    delete temp;
  }

  void changeDirection(){}

private:
  Node* head;
  Node* tail;
  int length;
  Coord direction;
  Board* board;
};
