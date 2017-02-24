#ifndef MESSAGE_HPP
#define MESSAGE_HPP

#include <string>

class Message
{
public:
	Message(std::string msg, int timestamp);

	bool operator>(const Message& otherMessage) const;
	bool operator<(const Message& otherMessage) const;
	bool operator==(const Message& otherMessage) const;
	bool operator>=(const Message& otherMessage) const;
	bool operator<=(const Message& otherMessage) const;

	std::string getMessage();
	int getTimestamp();

private:
	std::string msg;
	int timestamp;
};

#endif //MESSAGE_HPP