const express = require('express');
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');

const app = express();
app.use(express.json());

// Initialize LiveKit client
const livekit = new RoomServiceClient(
  'wss://your-vps-ip:7880',
  'API_KEY',
  'API_SECRET'
);

// Generate token for a participant
app.post('/token', (req, res) => {
  const { room, identity, name } = req.body;
  
  // Validate input
  if (!room || !identity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const token = new AccessToken('API_KEY', 'API_SECRET', {
      identity: identity,
      name: name || identity,
    });

    token.addGrant({
      roomJoin: true,
      room: room,
      canPublish: true,
      canSubscribe: true,
    });

    const tokenString = token.toJwt();
    res.json({
      token: tokenString,
      wsUrl: 'wss://your-vps-ip:7880',
    });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Create a new room
app.post('/rooms', async (req, res) => {
  const { name, emptyTimeout = 10 * 60, maxParticipants = 20 } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  try {
    const room = await livekit.createRoom({
      name,
      emptyTimeout,
      maxParticipants,
    });
    res.json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// List all rooms
app.get('/rooms', async (req, res) => {
  try {
    const rooms = await livekit.listRooms();
    res.json(rooms);
  } catch (error) {
    console.error('Error listing rooms:', error);
    res.status(500).json({ error: 'Failed to list rooms' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
