// private
const users = {};
const roomNames = getRoomNames();

// public
function add(socket, name, room) {
    users[socket.id] = {name, room};
}

function get(socket) {
    return users[socket.id];
}

function remove(socket) {
    delete users[socket.id];
}

function usernameExistsInRoom(username, room) {
    return getParticipantsNamesByRoom(room)
        .includes(username);
}

function getRoomParticipants(room) {    
    return getParticipantsNamesByRoom(room);
}

function getParticipantsTyping(room) {
    return getParticipantsByRoom(room)
        .reduce((o, u) => {
            o[u.name] = u.isTyping;

            return o;
        }, {});
}

function getRoomsCounters() {
    return Object.assign(initRoomsCounters(), getCurrRoomsCounters());
}

function getRoom(socket) {
    const user = get(socket);

    return user && user.room;
}

function getName(socket) {
    const user = get(socket);

    return user && user.name;
}

function updateTyping(socket, isTyping) {
    const user = get(socket) || {};

    user.isTyping = isTyping;
}

// private
function getParticipantsNamesByRoom(room) {
    return getParticipantsByRoom(room)
        .map(u => u.name);
}

function getParticipantsByRoom(room) {
    return Object.values(users)
        .filter(u => u.room === room);
}

function getCurrRoomsCounters() {
    return Object.values(users)
        .reduce((c, u) => {
            c[u.room] = ++c[u.room] || 1;

            return c;
        }, {});
}

function getRoomNames() {
    return process.env.ROOMS_NAMES.split(',');
}

function initRoomsCounters() {
    return roomNames.reduce((c, room) => {
            c[room] = 0;

            return c;
        }, {});
}

module.exports = {
    add,
    get,
    remove,
    usernameExistsInRoom,
    getName,
    getRoom,
    getRoomParticipants,
    getRoomsCounters,
    updateTyping,
    getParticipantsTyping
};