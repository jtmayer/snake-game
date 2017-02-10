#include "Snake.hpp"

struct Node
{
	Node* next;	
	Coord c;
};

struct Coord
{
	int x;
	int y;
};

class Snake
{
public:
	Snake(Coord c)
	{
		Node* n = new Node{nullptr, c};
		head = n;
		tail = n;
		length = 1;
		direction = Coord{1, 0};
	}

	void update(std::vector<std::vector<int>> &board)
	{
		Coord loc = head->value;
		loc.x += direction.x;
		loc.y += direction.y;
		head->next = new Node{nullptr, loc};
		head = head->next;
		x = head->value.x;
		y = head->value.y;
		if(board[x][y] == 1) // Check for food
		{
			length++;
			board[x][y] = 0;
			return;
		}
		Node* temp = tail;
		tail = tail->next;
		delete temp;
	}

private:
	Node* head;
	Node* tail;
	int length
	Coord direction;
};