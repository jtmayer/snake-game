#include "Message.hpp"

Message::Message(std::string msg, int timestamp) : msg{msg}, timestamp{timestamp}
{

}

bool Message::operator>(const Message& otherMessage) const
{
	return timestamp < otherMessage.timestamp
}

bool Message::operator<(const Message& otherMessage) const
{
	return timestamp > otherMessage.timestamp
}

bool Message::operator==(const Message& otherMessage) const
{
	return timestamp == otherMessage.timestamp
}

bool Message::operator>=(const Message& otherMessage) const
{
	return timestamp <= otherMessage.timestamp
}

bool Message::operator<=(const Message& otherMessage) const
{
	return timestamp >= otherMessage.timestamp
}

std::string Message::getMessage()
{
	return msg;
}

int Message::getTimestamp()
{
	return timestamp;
}