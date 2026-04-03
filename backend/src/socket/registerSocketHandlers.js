const { NODE_ENV } = require('../config/env');
const { activeRooms, userActivity, roomMessages } = require('./state');
const { buildParticipants, handleUserLeaving } = require('./roomLifecycle');

function registerSocketHandlers(io) {
  io.on('connection', socket => {
    const clientIp = socket.handshake.headers['x-forwarded-for']
      || socket.handshake.address.replace(/^.*:/, '');

    console.log(`User connected: ${socket.id} from ${clientIp}`);

    socket.lastActivity = Date.now();
    userActivity.set(socket.id, {
      lastActivity: Date.now(),
      ip: clientIp,
    });

    socket.on('join-room', async payload => {
      try {
        let { meetingId, username } = payload || {};

        if (!meetingId || typeof meetingId !== 'string') {
          socket.emit('error', { message: 'Invalid meeting ID' });
          return;
        }

        if (!username || typeof username !== 'string') {
          username = `Guest-${Math.floor(Math.random() * 1000)}`;
        }

        if (socket.meetingId && socket.meetingId !== meetingId) {
          handleUserLeaving(io, socket, socket.meetingId);
        }

        await socket.join(meetingId);
        socket.username = username;
        socket.meetingId = meetingId;

        if (!activeRooms.has(meetingId)) {
          activeRooms.set(meetingId, new Map());
        }

        activeRooms.get(meetingId).set(socket.id, {
          id: socket.id,
          username,
          hasAudio: true,
          hasVideo: true,
          joinedAt: Date.now(),
          clientAddress: clientIp,
          userAgent: socket.handshake.headers['user-agent'] || 'Unknown',
          lastActivity: Date.now(),
        });

        const roomUsers = activeRooms.get(meetingId);
        const participants = buildParticipants(roomUsers);

        socket.to(meetingId).emit('room-message', {
          type: 'system',
          text: `${username} joined the meeting.`,
          timestamp: new Date().toISOString(),
          userId: 'system',
        });

        socket.emit('room-users', participants);

        if (roomMessages.has(meetingId)) {
          const history = roomMessages.get(meetingId).slice(-50);
          if (history.length > 0) {
            socket.emit('room-message-history', {
              messages: history,
              roomId: meetingId,
            });
          }
        }

        io.to(meetingId).emit('room-users-changed', participants);

        socket.to(meetingId).emit('user-joined', {
          id: socket.id,
          username,
          hasAudio: true,
          hasVideo: true,
          timestamp: Date.now(),
        });

        socket.emit('joined-room', {
          success: true,
          meetingId,
          participantCount: participants.length,
          yourId: socket.id,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', {
          message: 'Failed to join meeting room',
          details: NODE_ENV === 'development' ? error.message : 'Server error',
        });
      }
    });

    socket.on('room-message', payload => {
      try {
        const { meetingId, text, messageId } = payload || {};
        socket.lastActivity = Date.now();

        if (userActivity.has(socket.id)) {
          userActivity.get(socket.id).lastActivity = Date.now();
        }

        if (!socket.username || !socket.meetingId) {
          socket.emit('error', { message: 'You are not in a meeting room', code: 'NOT_IN_ROOM' });
          return;
        }

        if (socket.meetingId !== meetingId) {
          socket.emit('error', { message: 'Message cannot be sent to a different room', code: 'WRONG_ROOM' });
          return;
        }

        if (!text || typeof text !== 'string') {
          socket.emit('error', { message: 'Invalid message format', code: 'INVALID_MESSAGE' });
          return;
        }

        const maxLength = 2000;
        const truncatedText = text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
        const actualMessageId = messageId || `${socket.id}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

        const messageObj = {
          id: socket.id,
          messageId: actualMessageId,
          user: socket.username,
          text: truncatedText,
          timestamp: new Date().toISOString(),
          delivered: true,
        };

        const roomMembers = io.sockets.adapter.rooms.get(meetingId);
        const recipientCount = roomMembers ? Math.max(roomMembers.size - 1, 0) : 0;
        const deliveryCount = 0;

        if (recipientCount > 0) {
          socket.to(meetingId).emit('room-message', messageObj);
        }

        socket.emit('room-message-confirm', {
          ...messageObj,
          recipientCount,
          deliveryCount,
        });

        setTimeout(() => {
          socket.emit(`room-message-confirm-${actualMessageId}`, {
            ...messageObj,
            recipientCount,
            deliveryCount,
          });
        }, 100);

        if (!roomMessages.has(meetingId)) {
          roomMessages.set(meetingId, []);
        }

        const history = roomMessages.get(meetingId);
        if (history.length >= 100) {
          history.shift();
        }
        history.push(messageObj);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', {
          message: 'Failed to send message',
          code: 'MESSAGE_ERROR',
          details: NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    });

    socket.on('user-typing', payload => {
      try {
        const { meetingId, username } = payload || {};
        socket.lastActivity = Date.now();

        if (!meetingId || !username) return;
        if (socket.meetingId !== meetingId) return;

        socket.to(meetingId).emit('user-typing', { username });
      } catch (error) {
        console.error('Error handling typing indicator:', error);
      }
    });

    socket.on('user-stopped-typing', payload => {
      try {
        const { meetingId, username } = payload || {};

        if (!meetingId || !username) return;
        if (socket.meetingId !== meetingId) return;

        socket.to(meetingId).emit('user-stopped-typing', { username });
      } catch (error) {
        console.error('Error handling stopped typing indicator:', error);
      }
    });

    socket.on('message-read', payload => {
      try {
        const { messageId, meetingId } = payload || {};

        if (!messageId || !meetingId) return;
        if (socket.meetingId !== meetingId) return;

        const senderIdMatch = messageId.match(/^([^-]+)-/);
        if (!senderIdMatch) return;

        const senderSocket = io.sockets.sockets.get(senderIdMatch[1]);
        if (senderSocket) {
          senderSocket.emit('message-read-receipt', {
            messageId,
            readBy: socket.username || socket.id,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error handling message read receipt:', error);
      }
    });

    socket.on('offer', payload => {
      try {
        const { targetId, offer, offererId, offererUsername } = payload || {};
        socket.lastActivity = Date.now();

        const actualOffererId = offererId || socket.id;
        const actualUsername = offererUsername || socket.username || 'Unknown User';

        if (!targetId || !offer) {
          socket.emit('error', { message: 'Invalid offer parameters' });
          return;
        }

        const targetSocket = io.sockets.sockets.get(targetId);
        if (!targetSocket) {
          socket.emit('peer-unavailable', { peerId: targetId, reason: 'Target peer is not connected' });
          return;
        }

        if (socket.meetingId && targetSocket.meetingId !== socket.meetingId) {
          socket.emit('peer-unavailable', { peerId: targetId, reason: 'Target peer is not in the same room' });
          return;
        }

        socket.to(targetId).emit('offer', {
          offer,
          offererId: actualOffererId,
          offererUsername: actualUsername,
          timestamp: Date.now(),
        });

        socket.emit('signaling-success', {
          type: 'offer',
          targetId,
          timestamp: Date.now(),
          targetUsername: targetSocket.username || 'Unknown User',
        });
      } catch (error) {
        console.error('Error handling offer:', error);
        socket.emit('error', {
          message: 'Failed to send offer',
          details: NODE_ENV === 'development' ? error.message : 'Server error processing offer',
        });
      }
    });

    socket.on('answer', payload => {
      try {
        const { targetId, answer, answererId, answererUsername } = payload || {};
        socket.lastActivity = Date.now();

        const actualAnswererId = answererId || socket.id;
        const actualUsername = answererUsername || socket.username || 'Unknown User';

        if (!targetId || !answer) {
          socket.emit('error', { message: 'Invalid answer parameters' });
          return;
        }

        const targetSocket = io.sockets.sockets.get(targetId);
        if (!targetSocket) {
          socket.emit('peer-unavailable', { peerId: targetId, reason: 'Target peer is not connected' });
          return;
        }

        socket.to(targetId).emit('answer', {
          answer,
          answererId: actualAnswererId,
          answererUsername: actualUsername,
          timestamp: Date.now(),
        });

        socket.emit('signaling-success', {
          type: 'answer',
          targetId,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Error handling answer:', error);
        socket.emit('error', {
          message: 'Failed to send answer',
          details: NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    });

    socket.on('ice-candidate', payload => {
      try {
        const { targetId, candidate, senderId } = payload || {};

        if (!targetId || !candidate) return;

        const actualSenderId = senderId || socket.id;
        const targetSocket = io.sockets.sockets.get(targetId);

        if (!targetSocket) {
          if (!socket.notifiedMissingPeer || !socket.notifiedMissingPeer[targetId]) {
            if (!socket.notifiedMissingPeer) socket.notifiedMissingPeer = {};
            socket.notifiedMissingPeer[targetId] = true;
            socket.emit('peer-unavailable', {
              peerId: targetId,
              reason: 'Target peer disconnected during ICE negotiation',
            });
          }
          return;
        }

        if (socket.meetingId && targetSocket.meetingId !== socket.meetingId) {
          if (!socket.notifiedWrongRoom || !socket.notifiedWrongRoom[targetId]) {
            if (!socket.notifiedWrongRoom) socket.notifiedWrongRoom = {};
            socket.notifiedWrongRoom[targetId] = true;
            socket.emit('peer-unavailable', {
              peerId: targetId,
              reason: 'Target peer is in a different meeting room',
            });
          }
          return;
        }

        socket.to(targetId).emit('ice-candidate', {
          candidate,
          senderId: actualSenderId,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    });

    socket.on('connection-status', payload => {
      try {
        const { peerId, status, details } = payload || {};
        console.log(`Connection status from ${socket.id} to ${peerId}: ${status}`);

        if (status === 'failed' || status === 'disconnected') {
          console.warn(`WebRTC connection problem between ${socket.id} and ${peerId}: ${status}`, details);
          const peerSocket = io.sockets.sockets.get(peerId);
          if (peerSocket) {
            peerSocket.emit('peer-connection-status', {
              peerId: socket.id,
              status,
              timestamp: Date.now(),
            });
          }
        }
      } catch (error) {
        console.error('Error handling connection status update:', error);
      }
    });

    socket.on('reconnect-peer', payload => {
      try {
        const { targetId } = payload || {};

        if (!targetId) {
          socket.emit('error', { message: 'Invalid reconnection parameters' });
          return;
        }

        const targetSocket = io.sockets.sockets.get(targetId);
        if (!targetSocket) {
          socket.emit('peer-unavailable', { peerId: targetId, reason: 'Target peer is not connected' });
          return;
        }

        socket.to(targetId).emit('peer-reconnect-requested', {
          peerId: socket.id,
          username: socket.username,
          timestamp: Date.now(),
        });

        socket.emit('reconnect-peer-requested', {
          peerId: targetId,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Error handling reconnect request:', error);
        socket.emit('error', { message: 'Failed to request reconnection' });
      }
    });

    socket.on('media-status-changed', payload => {
      try {
        const { meetingId, hasAudio, hasVideo } = payload || {};
        socket.lastActivity = Date.now();

        if (!socket.meetingId || !activeRooms.has(meetingId)) return;

        const user = activeRooms.get(meetingId).get(socket.id);
        if (user) {
          user.hasAudio = hasAudio;
          user.hasVideo = hasVideo;
          io.to(meetingId).emit('user-media-status-changed', {
            userId: socket.id,
            hasAudio,
            hasVideo,
          });
        }
      } catch (error) {
        console.error('Error updating media status:', error);
        socket.emit('error', { message: 'Failed to update media status' });
      }
    });

    socket.on('screen-share-started', payload => {
      try {
        const { roomId, userId } = payload || {};
        socket.lastActivity = Date.now();

        const effectiveRoomId = roomId && activeRooms.has(roomId) ? roomId : socket.meetingId;
        if (!effectiveRoomId || !activeRooms.has(effectiveRoomId)) {
          socket.emit('error', { message: 'Invalid room ID for screen sharing' });
          return;
        }

        socket.to(effectiveRoomId).emit('user-screen-share', {
          userId: userId || socket.id,
          username: socket.username || 'Unknown User',
          isSharing: true,
        });

        socket.emit('screen-share-confirmation', {
          status: 'started',
          roomId: effectiveRoomId,
          timestamp: Date.now(),
        });

        io.to(effectiveRoomId).emit('room-message', {
          type: 'system',
          text: `${socket.username || 'Unknown User'} started sharing their screen.`,
          timestamp: new Date().toISOString(),
          messageId: `system-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        });

        const user = activeRooms.get(effectiveRoomId).get(socket.id);
        if (user) user.isScreenSharing = true;
      } catch (error) {
        console.error('Error handling screen share start:', error);
        socket.emit('error', { message: 'Failed to update screen sharing status', details: error.message });
      }
    });

    socket.on('screen-share-stopped', payload => {
      try {
        const { roomId, userId } = payload || {};
        socket.lastActivity = Date.now();

        let effectiveRoomId = roomId && activeRooms.has(roomId) ? roomId : socket.meetingId;
        if (!effectiveRoomId || !activeRooms.has(effectiveRoomId)) {
          if (socket.meetingId && activeRooms.has(socket.meetingId)) {
            effectiveRoomId = socket.meetingId;
          } else {
            return;
          }
        }

        socket.to(effectiveRoomId).emit('user-screen-share', {
          userId: userId || socket.id,
          username: socket.username || 'Unknown User',
          isSharing: false,
        });

        socket.to(effectiveRoomId).emit('screen-share-stopped', {
          userId: userId || socket.id,
          username: socket.username || 'Unknown User',
          roomId: effectiveRoomId,
        });

        socket.emit('screen-share-confirmation', {
          status: 'stopped',
          roomId: effectiveRoomId,
          timestamp: Date.now(),
        });

        io.to(effectiveRoomId).emit('room-message', {
          type: 'system',
          text: `${socket.username || 'Unknown User'} stopped sharing their screen.`,
          timestamp: new Date().toISOString(),
          messageId: `system-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        });

        const user = activeRooms.get(effectiveRoomId).get(socket.id);
        if (user) user.isScreenSharing = false;
      } catch (error) {
        console.error('Error handling screen share stop:', error);
        socket.emit('error', { message: 'Failed to update screen sharing status', details: error.message });
      }
    });

    socket.on('get-room-status', (meetingId, callback) => {
      try {
        socket.lastActivity = Date.now();

        if (!meetingId) {
          if (callback) callback({ success: false, error: 'Invalid meeting ID' });
          return;
        }

        const roomExists = activeRooms.has(meetingId);
        const participantCount = roomExists ? activeRooms.get(meetingId).size : 0;

        const response = {
          success: true,
          exists: roomExists,
          participantCount,
          active: participantCount > 0,
        };

        if (callback) {
          callback(response);
        } else {
          socket.emit('room-status', { meetingId, ...response });
        }
      } catch (error) {
        console.error('Error getting room status:', error);
        if (callback) callback({ success: false, error: 'Server error' });
      }
    });

    socket.on('leave-room', meetingId => {
      try {
        handleUserLeaving(io, socket, meetingId);
      } catch (error) {
        console.error('Error handling leave-room:', error);
      }
    });

    socket.on('heartbeat', () => {
      socket.lastActivity = Date.now();
      if (userActivity.has(socket.id)) {
        userActivity.get(socket.id).lastActivity = Date.now();
      }
      socket.emit('heartbeat-ack');
    });

    socket.on('disconnect', reason => {
      try {
        console.log(`User disconnected: ${socket.id} - Reason: ${reason}`);

        if (socket.meetingId) {
          handleUserLeaving(io, socket, socket.meetingId);
        }

        userActivity.delete(socket.id);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
}

function startInactiveUserCleanup(io) {
  setInterval(() => {
    const now = Date.now();
    const inactivityThreshold = 30 * 60 * 1000;

    for (const [socketId, data] of userActivity.entries()) {
      if (now - data.lastActivity > inactivityThreshold) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          if (socket.meetingId) {
            handleUserLeaving(io, socket, socket.meetingId);
          }
          socket.disconnect(true);
        }
        userActivity.delete(socketId);
      }
    }

    console.log(`Active rooms: ${activeRooms.size}`);
    for (const [roomId, users] of activeRooms.entries()) {
      console.log(`- Room ${roomId}: ${users.size} users`);
    }
  }, 15 * 60 * 1000);
}

module.exports = {
  registerSocketHandlers,
  startInactiveUserCleanup,
};
