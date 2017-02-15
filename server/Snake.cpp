#include "Snake.hpp"

Coord::Coord(int x, int y)
{
	this.x = x;
	this.y = y;
}

Coord Coord::operator+(Coord coord2)
{
	return Coord(x + coord2.x, y + coord2.y);
}

bool Coord::operator==(Coord coord2)
{
	return this.x == coord2.x && this.y == coord2.y;
}

bool Coord::operator!=(Coord coord2)
{
	return !(this == coord2);
}

Coord Coord::operator+=(Coord coord2)
{
	x += coord2.x;
	y += coord2.y;
	return this;
}

Coord Coord::operator-()
{
	return Coord{-x, -y};
}

std::string Coord::str()
{
	ostringstream os;
	os << x << ", " << y;
	return os.str();
}


Snake::Snake(Coord starting_pos, Board* board)
{
	Node* n = new Node{nullptr, starting_pos};
	head = n;
	tail = n;
	length = 1;
	direction = Coord{1, 0};
	this.board = board;
}

void Snake::update()
{
	head = head->next = new Node{nullptr, head->value + direction};
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
	if(direction != -this.direction || length == 1)
		this.direction = direction;
}

Coord Snake::getHead()
{
	return head->value;
}

Coord Snake::getOldTail()
{
	return oldTail;
}
