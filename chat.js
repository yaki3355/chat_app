const users = require('./users');

module.exports = io => {
    io.on('connection', socket => {
        socket.on('joinRoom', (username, room, cb) => {
            joinRoom(io, socket, username, room, cb);
        });

        socket.on('getRoomsCounters', cb => {
            cb({counters: users.getRoomsCounters(), 
                maxParticipantsEachRoom: process.env.MAX_PARTICIPANTS_EACH_ROOM});
        });

        socket.on('exists', cb => {
            cb(users.get(socket) != null);
        });

        socket.on('getRoomParticipants', cb => {
            cb(users.getRoomParticipants(users.getRoom(socket)));
        });

        socket.on('leaveRoom', () => {
            leaveRoom(io, socket);
        });

        socket.on('message', (content, cb) => {
            sendMessageFromOtherUser(socket, content);
            cb();
        });

        socket.on('typing', isTyping => {
            users.updateTyping(socket, isTyping);
            sendTyping(socket);
        });

        socket.on('getParticipantsTyping', cb => {
            cb(users.getParticipantsTyping(users.getRoom(socket)));
        });
        
        socket.on('disconnect', () => {
            leaveRoom(io, socket);
        });
    });
};

function leaveRoom(io, socket) {
    const user = users.get(socket);

    if (!user) return;

    const room = user.room;

    users.remove(socket);
    socket.leave(room);
    sendRoomParticipants(io, room);
    sendMessageFromAdmin(io, room, `${user.name} has left the chat`);
    sendRoomsCounters(socket);
}

function sendRoomsCounters(socket) {
    socket.broadcast.emit('roomsCounters', {counters: users.getRoomsCounters()});
}

function sendRoomParticipants(io, room) {
    io.to(room).emit('roomParticipants', users.getRoomParticipants(room));
}

function sendTyping(socket) {
    const user = users.get(socket);
    socket.broadcast.to(user.room).emit('typing', users.getParticipantsTyping(user.room));
}

function sendMessageFromAdmin(io, room, content) {
    io.to(room).emit('message', {
        isIncomingMsg: true,
        by: process.env.ADMIN,
        content
    });
}

function sendMessageFromOtherUser(socket, content) {
    const user = users.get(socket);

    socket.broadcast.to(user.room).emit('message', {
        isIncomingMsg: true,
        by: user.name,
        content
    });
}

function joinRoom(io, socket, username, room, cb) {
    if (users.usernameExistsInRoom(username, room))
        return cb('Username in this room already exists');

    users.add(socket, username, room);
    socket.join(room);
    sendRoomsCounters(socket);
    sendRoomParticipants(io, room);
    sendMessageFromAdmin(io, room, `${username} has joined the chat`);
    cb();
}