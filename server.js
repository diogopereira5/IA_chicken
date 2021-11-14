const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname + '/src'));

const storage = [];

io.on('connection', (socket) => {

    console.log(socket.id, 'Entrou');
    io.emit('draw', storage);

    socket.on('disconnect', () => {
        storage.forEach((item, index) => {
            if (item.id == socket.id) {
                storage.splice(index, 1)
            }
        })
        console.log(socket.id, 'Saiu');
        io.emit('draw', storage);
    });

    socket.on('create-chicken', (chicken) => {
        console.log(chicken);
        storage.push(chicken);
        io.emit('draw', storage);
    })

    socket.on('update-chickens', (chicken) => {
        storage.forEach((item, index) => {
            if (item.id == chicken.id) {
                storage[index] = chicken;
            }
        })
        io.emit('draw', storage);
    })

});

server.listen(3000);