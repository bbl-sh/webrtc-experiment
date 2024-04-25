const wrtc = require('wrtc');
const socket = require('socket.io-client')('http://192.168.156.214:3000');

const pc = new wrtc.RTCPeerConnection({
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
});

socket.on('connect', () => {
  const roomId = 'my-room';
  socket.emit('join', roomId);
});

socket.on('signal', async (data) => {
  try {
    if (data.description) {
      await pc.setRemoteDescription(data.description);
      if (data.description.type === 'offer') {
        await pc.setLocalDescription();
        socket.emit('signal', { room: 'my-room', description: pc.localDescription });
      }
    } else if (data.candidate) {
      await pc.addIceCandidate(data.candidate);
    }
  } catch (error) {
    console.error(error);
  }
});

pc.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit('signal', { room: 'my-room', candidate: event.candidate });
  }
};

pc.ontrack = (event) => {
  // Handle the received media stream here
  const stream = event.streams[0];
  // For example, you could create a new video element and set its source to the received stream
};

console.log('Client is connected to the server');
