require('dotenv').config();
const { RoomServiceClient } = require('livekit-server-sdk');

// Configuração do LiveKit
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'ws://localhost:7880';
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;

if (!API_KEY || !API_SECRET) {
  console.error('Erro: LIVEKIT_API_KEY e LIVEKIT_API_SECRET são obrigatórios no .env');
  process.exit(1);
}

// Configura o cliente do LiveKit
const livekit = new RoomServiceClient(
  LIVEKIT_URL.replace('ws', 'http'), // O RoomServiceClient usa HTTP, não WebSocket
  API_KEY,
  API_SECRET,
  { retries: 3 }
);

async function testConnection() {
  try {
    console.log('Conectando ao servidor LiveKit em:', LIVEKIT_URL);
    
    // Lista as salas para testar a conexão
    const rooms = await livekit.listRooms();
    console.log('✅ Conexão com o LiveKit estabelecida com sucesso!');
    console.log(`📊 Salas ativas: ${rooms.length}`);
    
    // Cria uma sala de teste
    const roomName = `test-room-${Date.now()}`;
    // Cria uma sala de teste
    console.log(`\n🔄 Criando sala de teste: ${roomName}`);
    await livekit.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60, // 10 minutos
      maxParticipants: 20,
    });
    console.log(`✅ Sala de teste criada com sucesso: ${roomName}`);
    
    // Lista as salas novamente para confirmar
    const updatedRooms = await livekit.listRooms();
    console.log(`\n📋 Total de salas após criação: ${updatedRooms.length}`);
    
    return true;
  } catch (error) {
    console.error('\n❌ Erro ao conectar ao LiveKit:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Detalhes da resposta:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    console.error('Failed to connect to LiveKit server:', error);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
