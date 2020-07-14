const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeaves, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Set static folder
app.use(express.static(path.join(__dirname,'public')));

//Runs when a client connects
io.on('connection', socket => {
    //
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        //Welcome curent user
        socket.emit('message', formatMessage('Chat Bot', 'Welcome to Chat Rooms'));

        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage('Chat Bot', `${user.username} has joined the chat`));

        //Send Info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Listen for chatMessages
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeaves(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage('Chat Bot', `${user.username} has left the chat`));
            //Send Info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

//Start server
const port =  process.env.PORT || 3000;
server.listen(port, () => console.log(`Server running on port ${port}`));