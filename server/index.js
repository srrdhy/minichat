import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

const app = express();
app.use(cors());
app.get('/', (_, res) => res.send('Minichat server is running'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] }
});

// Memory stores (demo only; not persisted)
const onlineUsers = new Map(); // socket.id -> {username, avatar}
const usernameToSocket = new Map(); // username -> socket.id (last seen)

function dmRoom(a, b){
  const [x, y] = [a, b].sort();
  return `dm:${x}__${y}`;
}

function groupRoom(id){
  return `group:${id}`;
}

io.on('connection', (socket) => {
  socket.on('auth:login', (payload, cb) => {
    // payload: {username, avatar}
    const { username, avatar } = payload || {};
    if(!username || typeof username !== 'string'){
      cb && cb({ ok:false, error:'USERNAME_REQUIRED' });
      return;
    }
    onlineUsers.set(socket.id, { username, avatar: avatar || '' });
    usernameToSocket.set(username, socket.id);
    socket.data.username = username;
    cb && cb({ ok:true, me:{ username, avatar: avatar || '' } });
    io.emit('presence:update', Array.from(onlineUsers.values()).map(u => u.username));
  });

  socket.on('presence:list', (cb) => {
    cb && cb(Array.from(usernameToSocket.keys()));
  });

  socket.on('conv:join:dm', ({ peer }, cb) => {
    const me = socket.data.username;
    if(!me || !peer) { cb && cb({ ok:false }); return; }
    const room = dmRoom(me, peer);
    socket.join(room);
    cb && cb({ ok:true, room });
  });

  socket.on('conv:join:group', ({ groupId }, cb) => {
    if(!groupId){ cb && cb({ ok:false }); return; }
    const room = groupRoom(groupId);
    socket.join(room);
    cb && cb({ ok:true, room });
  });

  socket.on('message:send', ({ room, content }, cb) => {
    const me = socket.data.username;
    if(!me || !room || !content || !content.trim()) { cb && cb({ ok:false }); return; }
    const msg = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,7), room, from: me, content: content.trim(), at: new Date().toISOString() };
    io.to(room).emit('message:new', msg);
    cb && cb({ ok:true, msg });
  });

  socket.on('disconnect', () => {
    const info = onlineUsers.get(socket.id);
    if(info){
      onlineUsers.delete(socket.id);
      // Only clear mapping if it points to this socket
      if(usernameToSocket.get(info.username) === socket.id){
        usernameToSocket.delete(info.username);
      }
      io.emit('presence:update', Array.from(onlineUsers.values()).map(u => u.username));
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('Minichat server listening on ' + PORT);
});
