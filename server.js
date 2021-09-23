const express = require('express');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 3000;

const socketio = require('socket.io');
const app = express();
const server = new http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// start server
server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})

// utilities
const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.random() * (max - min) + min;
};
const get_mole_interval = () => getRandomInt(1, 3);
const get_showed_mole = (previous_mole_index) => {
    let result = Math.floor(Math.random() * 8);
    while (result === previous_mole_index) {
        result = Math.floor(Math.random() * 8);
    };
    return result;
};

let timeout;
const connections = [null, null];

io.on('connection', (socket) => {
    const { name } = socket.handshake.query;

    let player_index = -1;
    for (const i in connections) {
        if (connections[i] === null) {
            connections[i] = {};
            connections[i].name = name;
            connections[i].score = 0;
            player_index = i;
            break;
        }
    }

    socket.emit('player-number', { player_index, player_data: connections });
    console.log(`player ${player_index} has connected`);

    // ignore player 3
    if (player_index === -1) return;

    // tell everyone that one player just connected
    socket.broadcast.emit('player-connection', player_index);

    // handle disconnected
    socket.on('disconnect', () => {
        console.log(`player ${player_index} has disconnected!`);
        connections[player_index] = null;
        socket.broadcast.emit('player-disconnect', player_index);
    });

    // all player ready
    socket.on('all-player-ready', () => {
        socket.broadcast.emit('player-ready', connections);
    });

    // someone presses play button
    socket.on('play', () => {
        connections.forEach((c, idx) => {
            connections[idx].is_ready_again = false;
            connections[idx].score = 0;
        });
        io.emit('start-play');
        timeout = setTimeout(() => {
            io.emit('mole-index', get_showed_mole());
        }, get_mole_interval() * 1000);
    });

    // request for new mole
    socket.on('request-new-mole', (previous_mole_index) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            io.emit('mole-index', get_showed_mole(previous_mole_index));
        }, get_mole_interval() * 1000);
    });

    // update score
    socket.on('someone-scores', ({ player_num, showed_mole_number }) => {
        connections[player_num].score += 1;
        io.emit('score-updated', connections);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            io.emit('mole-index', get_showed_mole(showed_mole_number));
        }, get_mole_interval() * 1000);
    });

    // handle click stop
    socket.on('stop', () => {
        connections[0].score = 0;
        connections[1].score = 0;
        io.emit('stop-clicked', connections);
        clearTimeout(timeout);
    });

    // get final result
    socket.on('get-result', () => {
        io.emit('final-result', connections);
        clearTimeout(timeout);
    });

    // handle ready when play again
    socket.on('play-again', (player_num) => {
        connections[player_num].is_ready_again = true;
        io.emit('ready-again', connections);
    });
});

