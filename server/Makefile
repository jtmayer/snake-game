CC = g++
CFLAGS = -c -std=c++11 -g
LDFLAGS =
SOURCES = main.cpp websocket.cpp sha1.cpp base64.cpp Snake.cpp Board.cpp Message.cpp
OBJECTS = $(SOURCES:.cpp=.o)
EXECUTABLE = snake_server

all: $(SOURCES) $(EXECUTABLE)
	
$(EXECUTABLE): $(OBJECTS) 
	$(CC) $(LDFLAGS) $(OBJECTS) -lpthread -o $@

.cpp.o:
	$(CC) $(CFLAGS) $< -o $@

clean:
	rm -rf *o $(EXECUTABLE)
