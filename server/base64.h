/*
From chatroom demo

Group 12

Jonathan Mayer 66268081
Brian Lam 62101239
Yu Koizumi 000975171
Tommy Wong 71659011
*/

#ifndef BASE64_H
#define BASE64_H

#include <string>

std::string base64_encode(unsigned char const* , unsigned int len);
std::string base64_decode(std::string const& s);

#endif /* BASE64_H */
