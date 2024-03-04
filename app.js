const express = require('express');
const http = require('http');
const path = require('path');
const Server = require('socket.io');
const nanoid = require('nanoid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    console.log("connection");
    res.send(path.join(__dirname, './public'));
});

let rooms = {};
let sockets = {};

function generateNewRoom() {
    let trial = nanoid.substring(0,6);
    while (rooms.hasKey(trial)) {
        trial = nanoid.substring(0,6);
    }
    return trial;
}

io.on('connect', (socket) => {
    console.log('user connected');
    sockets[socket.id] = null;
    io.on('create-room', () => {
        const room = generateNewRoom();
        const player_symbol_chance = Math.random();
        rooms[room] = {
            'x': player_symbol_chance > 0.5 ? socket.id : null,
            'o': player_symbol_chance <= 0.5 ? socket.id : null,
            'spectators': [],
            'grid': [[' ', ' ', ' '], 
                    [' ', ' ', ' '], 
                    [' ', ' ', ' ']], 
            'current_turn': Math.random() > 0.5 ? 'x' : 'o',
            'code': room
        };
        sockets[socket.id] = room;
        socket.join(room);
        io.emit('game-update', rooms[room]);
    });

    io.on('join-room', (room) => {
        if (rooms.hasKey(room)) {
            if (!rooms.p2) {
                rooms.p2 = socket.id;
            } else {
                rooms.spectators.push(socket.id);
            }
            sockets[socket.id] = room;
        } else {
            io.to(socket.id).emit('error', 'Invalid join code.');
        }
    });

    io.on('turn', (cellX, cellY) => {
        const game = rooms[sockets[socket.id]];
        if (game && game[game.current_turn] == socket.id) {
            if ((0 <= cellX && 0 <= cellY && cellX <= 3 && cellY <= 3) && game.grid[cellY][cellX] == ' ') {
                game.grid[cellY][cellX] = game.current_turn;
                io.emit('grid', game.grid);
            }
        }
    });

    io.on('disconnect', () => {
        if (sockets[socket.id]) {
            if (rooms[sockets[socket.id]]) {
                delete rooms[sockets[socket.id]];
            }
            delete sockets[socket.id];
        }
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on port 3000');
});