/*
Created for Milestone 3

Group 12

Jonathan Mayer 66268081
Brian Lam 62101239
Yu Koizumi 000975171
Tommy Wong 71659011
*/

#ifndef MESSAGE_HPP
#define MESSAGE_HPP

#include <string>

class Message
{
public:
	Message(int clientID, std::string msg, long timestamp);

	bool operator>(const Message& otherMessage) const;
	bool operator<(const Message& otherMessage) const;
	bool operator==(const Message& otherMessage) const;
	bool operator>=(const Message& otherMessage) const;
	bool operator<=(const Message& otherMessage) const;

	std::string getMessage();
	long getTimestamp();
	int getClientID();

private:
	int clientID;
	std::string msg;
	long timestamp;
};

#endif //MESSAGE_HPP