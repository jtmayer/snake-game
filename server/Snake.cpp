/*
Created for Milestone 2

Group 12

Jonathan Mayer 66268081
Brian Lam 62101239
Yu Koizumi 000975171
Tommy Wong 71659011
*/

#include "Snake.hpp"

Snake::Snake(Coord starting_pos, Board* board)
{
	Node* n = new Node{nullptr, starting_pos};
	head = n;
	tail = n;
	length = 1;
	direction = RIGHT;
	this->board = board;
}

Snake::~Snake()
{
	Node* current = tail;
	Node* del = current;
	while(current != nullptr)
	{
		del = current;
		current = current->next;
		delete del;
	}
}

void Snake::update()
{
	head->next = new Node{nullptr, head->value + direction};
	head = head->next;
	int x = head->value.x;
	int y = head->value.y;
	if(board->getItem(x, y) == food) // Check for food
  	{
		length++;
		board->setItem(x, y, empty);
		board->addItem(food);
		return;
	}
	Node* temp = tail;
	tail = tail->next;
	oldTail = temp->value;
	delete temp;
}

void Snake::changeDirection(Coord direction)
{
	if(direction != -this->direction || length == 1)
		this->direction = direction;
}

Coord Snake::getHead()
{
	return head->value;
}

Coord Snake::getOldTail()
{
	return oldTail;
}

int Snake::getLength()
{
	return length;
}

std::vector<Coord> Snake::getSnakePosition()
{
	std::vector<Coord> snakeCoords{};
	Node* current = tail;
	while(current != nullptr)
	{
		snakeCoords.push_back(current->value);
		current = current->next;
	}
	return snakeCoords;
}