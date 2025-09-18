require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');

const app = express();
app.use(express.json());
app.use(cors());

// Configuração do LiveKit
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'ws://localhost:7880';
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;

if (!API_KEY || !API_SECRET) {
  console.error('Erro: LIVEKIT_API_KEY e LIVEKIT_API_SECRET são obrigatórios');
  process.exit(1);
}

// Inicializa o cliente do LiveKit
const livekit = new RoomServiceClient(
  LIVEKIT_URL,
  API_KEY,
  API_SECRET
);

// Middleware para verificar chave de API
const apiKeyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.API_AUTH_TOKEN}`) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
};

// Rota de status do servidor
app.get('/status', (req, res) => {
  res.json({ status: 'online', service: 'LiveKit API' });
});

// Gerar token para participante
app.post('/token', apiKeyAuth, (req, res) => {
  const { room, identity, name } = req.body;
  
  // Validação de entrada
  if (!room || !identity) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes: room e identity' });
  }

  try {
    const token = new AccessToken(API_KEY, API_SECRET, {
      identity: identity,
      name: name || identity,
    });

    // Permissões do token
    token.addGrant({
      roomJoin: true,
      room: room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
      canPublishSources: ['microphone', 'camera', 'screen_share'],
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
