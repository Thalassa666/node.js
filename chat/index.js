const users = {};
const history = {};

const getSocketId = (userId) => {
  for (const user in users) {
    if (users.hasOwnProperty(user)) {
      if (users[user].userId === userId) {
        return users[user].socketId;
      }
    }
  }
};

module.exports = (io) => {
  io.sockets.on('connection', (socket) => {
    const socketId = socket.id;

    socket.on('users:connect', ({ userId, username }) => {
      console.log(`username:${username} c id:${userId} подключился в чат`);
      users[socketId] = {
        username,
        socketId,
        userId,
        activeRoom: null
      };
      socket.emit('users:list', Object.values(users));
      socket.broadcast.emit('users:add', users[socketId]);
    });

    socket.on('message:add', ({ senderId, recipientId, roomId, text }) => {
      if (!history[roomId]) {
        history[roomId] = [];
      }
      if (users[roomId]) {
        Object.values(users).forEach((user) => {
          if (user.activeRoom && user.activeRoom === roomId) {
            io.to(user.socketId).emit('message:add', {
              senderId,
              recipientId,
              text
            });
          }
        });
        history[roomId].push({ senderId, text });
      }
    });

    socket.on('message:history', ({ recipientId, userId }) => {
      const currUserSocketId = getSocketId(recipientId);
      users[socketId].activeRoom = getSocketId(recipientId);
      if (currUserSocketId && history[currUserSocketId]) {
        socket.emit('message:history', history[currUserSocketId]);
      }
    });

    socket.on('disconnect', () => {
      if (users[socketId]) {
        socket.broadcast.emit('users:leave', socketId);
        delete users[socketId];
        delete history[socketId];
      }
    });
  });
};
