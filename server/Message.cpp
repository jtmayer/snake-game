/*
Created for Milestone 3

Group 12

Jonathan Mayer 66268081
Brian Lam 62101239
Yu Koizumi 000975171
Tommy Wong 71659011
*/

#include "Message.hpp"

Message::Message(int clientID, std::string msg, long timestamp) 
: clientID{clientID}, msg{msg}, timestamp{timestamp}
{

}

bool Message::operator>(const Message& otherMessage) const
{
	return timestamp < otherMessage.timestamp;
}

bool Message::operator<(const Message& otherMessage) const
{
	return timestamp > otherMessage.timestamp;
}

bool Message::operator==(const Message& otherMessage) const
{
	return timestamp == otherMessage.timestamp;
}

bool Message::operator>=(const Message& otherMessage) const
{
	return timestamp <= otherMessage.timestamp;
}

bool Message::operator<=(const Message& otherMessage) const
{
	return timestamp >= otherMessage.timestamp;
}

std::string Message::getMessage()
{
	return msg;
}

long Message::getTimestamp()
{
	return timestamp;
}

int Message::getClientID()
{
	return clientID;
}