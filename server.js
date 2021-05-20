const express = require("express");
const socket = require("socket.io");
const game = require("./game.js");

// App setup
const PORT = process.env.PORT || 3000; //listen on port defined by environmental variable (for heroku)
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://0.0.0.0:${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);

var usersArray = [];
var rooms = [];

io.on("connection", function (socket) {
  if (rooms.length == 0) {
    let newUser = new User(socket.id);
    let newRoom = new Room(generateID());
    rooms.push(newRoom);

    addUserToArrays(rooms[0], newUser);
    newUser.joinRoom(rooms[0].id, socket);

  } else {
    let foundEmptyRoom = false;
    for (let i = 0; i < rooms.length; i++) {
      if (!rooms[i].checkIfFull()) {
        foundEmptyRoom = true;

        let newUser = new User(socket.id);
        newUser.joinRoom(rooms[i].id, socket);

        addUserToArrays(rooms[i], newUser);

        if (rooms[i].checkIfFull()) {
          io.to(rooms[i].id).emit('enemy_connect',rooms[i].users);
        }
        break;
      }
    }
    if (!foundEmptyRoom) {
      let newRoom = new Room(generateID());
      let newUser = new User(socket.id);

      rooms.push(newRoom);
      newUser.joinRoom(newRoom.id, socket);

      addUserToArrays(newRoom, newUser);

      if (newRoom.checkIfFull()) {
        io.to(newRoom.id).emit('enemy_connect', newRoom.users);
      }
    }
  }

  socket.on("disconnect", () => {
    let room;
    let user = usersArray.find(user => user.id == socket.id);
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].id === user.room) {
        room = rooms[i];
        rooms[i].removeUserFromRoom(socket);
      }
    }
    removeUser(socket, room.id);
  })

  socket.on("data", (data) => {
    let fullRoom;
    let room = makeChoice(data);
    socket.to(room).emit('choice', data);
    if (checkIfChose(room)) {
      for(let i = 0; i < rooms.length; i++) {
        if(rooms[i].id == room) {
           fullRoom = rooms[i];
        }
      }
      let winner = game.compare(fullRoom.users[0], fullRoom.users[1]);
      io.to(room).emit("winner", winner);
      resetGame();
    }
  })

  socket.on("chat", (data) => {
    socket.to(data.id).volatile.emit('new_message',data.message);
  })
});

function checkIfChose(room) {
  let fullRoom;

  for(let i = 0; i < rooms.length; i++) {
    if(rooms[i].id == room) {
       fullRoom = rooms[i];
    }
  }
  if (fullRoom.users[0].choice && fullRoom.users[1].choice) {

    return true;
  }
  else return false;
}

function resetGame() {
  usersArray.forEach(user => {
    user['choice'] = undefined;
  });
}

function makeChoice(data) {
  let user = usersArray.find(user => user['id'] == data['id']);
  let room = user.room;
  user['choice'] = data['data'];

  return room;
}

function removeUser(socket, room) {
  for (let i = 0; i < usersArray.length; i++) {
    if (usersArray[i].id == socket.id) {
      usersArray.splice(i, 1);
      io.to(room).emit("enemy_disconnected", "pozdro 600");
      break;
    }
  }
}

function addUserToArrays(room, user) {
  usersArray.push(user);
  room.users.push(user);
}


function generateID() {
  return Math.random().toString(36).substr(2, 9);
}

class User {
  constructor(id, choice) {
    this.id = id;
    this.choice = choice;
    this.room = '';
  }

  joinRoom = (id, socket) => {
    socket.join(id);
    this.room = id;
  }
}

class Room {
  constructor(id, users) {
    this.id = id;
    this.users = [];
    this.full = false;
  }

  checkIfFull = () => {
    if (this.users.length >= 2) {
      return true;
    } else return false;
  }

  removeUserFromRoom = (socket) => {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id === socket.id) {
        this.users.splice(i, 1);
      }
    }
  }
}

