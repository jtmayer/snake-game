#include <random>

std::vector<std::vector<int>> *board;

void addItem(std::vector<std::vector<int>> &board, int item)
{

}

class Board
{
public:
	Board(int length, int width)
	{
		board = std::vector<std::vector<int>>(length);
		for(int i = 0; i < length; it++)
		{
			board[i] = std::vector<int>(width, 0);
		}
		this.length = length;
		this.width = width;
	}

	void addItem(int item)
	{
		int x = rand() * length;
		int y = rand() * width;
		board[x][y] = item;
	}

private:
	std::vector<std::vector<int>> board;
	int legnth;
	int width;
};