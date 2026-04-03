const { activeRooms, roomMessages } = require('./state');

function buildParticipants(roomUsers) {
  return Array.from(roomUsers.values()).map(user => ({
    id: user.id,
    username: user.username,
    hasAudio: user.hasAudio,
    hasVideo: user.hasVideo,
    joinedAt: user.joinedAt,
  }));
}

function handleUserLeaving(io, socket, meetingId) {
  if (!socket.username || !meetingId) {
    return;
  }

  if (activeRooms.has(meetingId)) {
    const roomUsers = activeRooms.get(meetingId);

    if (roomUsers.has(socket.id)) {
      roomUsers.delete(socket.id);

      if (roomUsers.size === 0) {
        activeRooms.delete(meetingId);
        roomMessages.delete(meetingId);
      } else {
        socket.to(meetingId).emit('room-message', {
          type: 'system',
          text: `${socket.username} left the meeting.`,
          timestamp: new Date().toISOString(),
        });

        socket.to(meetingId).emit('user-left', {
          id: socket.id,
          username: socket.username,
        });

        io.to(meetingId).emit('room-users-changed', buildParticipants(roomUsers));
      }
    }
  }

  socket.leave(meetingId);
  socket.meetingId = null;
}

module.exports = {
  buildParticipants,
  handleUserLeaving,
};
