#ifndef MESSAGE_HPP
#define MESSAGE_HPP

#include <string>

class Message
{
public:
	Message(int clientID ,std::string msg, int timestamp);

	bool operator>(const Message& otherMessage) const;
	bool operator<(const Message& otherMessage) const;
	bool operator==(const Message& otherMessage) const;
	bool operator>=(const Message& otherMessage) const;
	bool operator<=(const Message& otherMessage) const;

	std::string getMessage();
	int getTimestamp();
	int getClientID();

private:
	int clientID;
	std::string msg;
	int timestamp;
};

#endif //MESSAGE_HPP