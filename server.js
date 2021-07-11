require("dotenv").config();
const path = require("path");
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const users = {};

const socketToRoom = {};
const chatData = {};

io.on("connection", (socket) => {
  //connect to socket

  //Join room handler
  socket.on("join room", ({ roomID, globalName }) => {
    let UserID = socket.id;
    //initialize or push new user into room
    if (users[roomID]) {
      const length = users[roomID].length;
      if (length === 4) {
        socket.emit("room full");
        return;
      }
      users[roomID].push({ id: UserID, name: globalName });
    } else {
      users[roomID] = [{ id: UserID, name: globalName }];
    }
    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter((user) => {
      if (user.id !== socket.id) {
        return user;
      }
    });
    //emit all users in room to new joinee
    socket.emit("all users", usersInThisRoom);
  });

  socket.on("sending signal", (payload) => {
    //make new peer connections when user joins
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
      name: payload.globalName,
    });
  });

  socket.on("returning signal", (payload) => {
    //returning signal for new PC
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    //remove user from room array and broadcast user left
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((user) => {
        if (user.id !== socket.id) {
          return user;
        }
      });
      users[roomID] = room;
    }
    socket.broadcast.emit("user left", socket.id);
  });

  socket.on("newChat", (roomID) => {
    //emit all prev chat data to new chat joinee
    if (chatData[roomID]) {
      socket.emit("check", chatData[roomID]);
    }
  });

  socket.on("message", ({ name, message, roomID }) => {
    //emit message received to all including sender
    if (chatData[roomID]) {
      chatData[roomID].push({ name, message });
    } else {
      chatData[roomID] = [{ name, message }];
    }
    io.emit("message", { name, message });
  });
});

if (process.env.PROD) {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build/index.html"));
  });
}

server.listen(process.env.PORT || 8000, () =>
  console.log(`server is running on port`)
);
