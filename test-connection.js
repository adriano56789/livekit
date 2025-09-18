const { RoomServiceClient } = require('livekit-server-sdk');

// Configure with your LiveKit server details
const livekit = new RoomServiceClient(
  'wss://your-vps-ip:7880',
  'API_KEY',
  'API_SECRET',
  { retries: 3 }
);

async function testConnection() {
  try {
    // List rooms to test connection
    const rooms = await livekit.listRooms();
    console.log('Successfully connected to LiveKit server!');
    console.log('Active rooms:', rooms);
    
    // Create a test room
    const roomName = `test-room-${Date.now()}`;
    await livekit.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 20,
    });
    console.log(`Created test room: ${roomName}`);
    
    return true;
  } catch (error) {
    console.error('Failed to connect to LiveKit server:', error);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
