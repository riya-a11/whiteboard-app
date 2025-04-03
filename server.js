const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/whiteboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define Whiteboard Schema
const WhiteboardSchema = new mongoose.Schema({
  sessionId: String,
  elements: Array,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Whiteboard = mongoose.model('Whiteboard', WhiteboardSchema);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Track active users
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Handle new user joining
  socket.on('join', ({ sessionId, user }) => {
    socket.join(sessionId);
    activeUsers.set(socket.id, { ...user, sessionId });
    
    // Notify others in the room
    socket.to(sessionId).emit('userJoined', user);
    
    // Load existing whiteboard data
    Whiteboard.findOne({ sessionId }, (err, board) => {
      if (board) {
        socket.emit('loadBoard', board.elements);
      }
    });
  });
  
  // Handle drawing events
  socket.on('draw', (data) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.to(user.sessionId).emit('remoteDraw', data);
      
      // Update in database
      Whiteboard.findOneAndUpdate(
        { sessionId: user.sessionId },
        { $push: { elements: data }, updatedAt: Date.now() },
        { upsert: true, new: true }
      ).exec();
    }
  });
  
  // Handle undo/redo
  socket.on('undo', (sessionId) => {
    socket.to(sessionId).emit('remoteUndo');
  });
  
  socket.on('redo', (sessionId) => {
    socket.to(sessionId).emit('remoteRedo');
  });
  
  // Handle user disconnection
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.to(user.sessionId).emit('userLeft', user);
      activeUsers.delete(socket.id);
    }
  });
});

server.listen(4000, () => console.log('Server running on port 4000'));
