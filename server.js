require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const users = {};
const usernames = {};

const socketToRoom = {};

io.on('connection', socket => {
    socket.on("join room", ({roomID, globalName}) => {
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
            usernames[roomID].push(globalName);
        } else {
            users[roomID] = [socket.id];
            usernames[roomID] = [globalName];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        const usernamesInThisRoom = usernames[roomID].filter(name => name !== globalName);

        socket.emit("all users", usersInThisRoom);
        socket.emit("all usernames", usernamesInThisRoom);
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID, name: payload.globalName });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
    });

    socket.on('message', ({ name, message }) => {
		io.emit('message', { name, message })
	});

});

server.listen(process.env.PORT || 8000, () => console.log('server is running on port 8000'));


