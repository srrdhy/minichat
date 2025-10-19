(function(){
  // Theme init
  const savedTheme = localStorage.getItem('theme');
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('minichat_me');
    location.reload();
  });
  if(savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)){
    document.documentElement.classList.add('dark');
  }
  const themeBtn = document.getElementById('themeBtn');
  themeBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    window.i18n.setLang(localStorage.getItem('lang') || 'zh');
  });

  const langSelect = document.getElementById('langSelect');
  langSelect.value = localStorage.getItem('lang') || 'zh';
  langSelect.addEventListener('change', () => {
    window.i18n.setLang(langSelect.value);
  });

  window.i18n.setLang(langSelect.value);

  const auth = document.getElementById('auth');
  const app = document.getElementById('app');
  const usernameInput = document.getElementById('username');
  const avatarInput = document.getElementById('avatar');
  const loginBtn = document.getElementById('loginBtn');
  const meAvatar = document.getElementById('meAvatar');
  const meName = document.getElementById('meName');
  const onlineCount = document.getElementById('onlineCount');

  const friendInput = document.getElementById('friendInput');
  const addFriendBtn = document.getElementById('addFriendBtn');
  const friendList = document.getElementById('friendList');
  const groupNameInput = document.getElementById('groupNameInput');
  const newGroupBtn = document.getElementById('newGroupBtn');
  const groupList = document.getElementById('groupList');

  const chatTitle = document.getElementById('chatTitle');
  const msgList = document.getElementById('msgList');
  const msgInput = document.getElementById('msgInput');
  const sendBtn = document.getElementById('sendBtn');

  let socket = null;
  let me = null;
  let activeRoom = null;
  let activeLabel = null; // UI label for title
  const friends = new Set();
  const groups = new Set();

  function renderList(ul, items, type){
    ul.innerHTML = '';
    items.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      li.addEventListener('click', () => {
        selectChat(type, name);
        ul.querySelectorAll('li').forEach(x=>x.classList.remove('active'));
        li.classList.add('active');
      });
      ul.appendChild(li);
    });
  }

  function selectChat(type, name){
    if(!socket) return;
    msgList.innerHTML = '';
    if(type === 'friend'){
      socket.emit('conv:join:dm', { peer: name }, (resp) => {
        if(resp?.ok){
          activeRoom = resp.room;
          activeLabel = name;
          chatTitle.textContent = 'DM @ ' + name;
        }
      });
    }else if(type === 'group'){
      socket.emit('conv:join:group', { groupId: name }, (resp) => {
        if(resp?.ok){
          activeRoom = resp.room;
          activeLabel = name;
          chatTitle.textContent = 'Group # ' + name;
        }
      });
    }
  }

  function pushMsg(msg){
    const div = document.createElement('div');
    div.className = 'msg' + (msg.from === me.username ? ' me' : '');
    div.textContent = msg.from + ': ' + msg.content;
    msgList.appendChild(div);
    msgList.scrollTop = msgList.scrollHeight;
  }

  function connect(){
    socket = io(window.SERVER_URL, { transports: ['websocket'], forceNew: true });
    socket.on('connect', () => {
      socket.emit('auth:login', { username: me.username, avatar: me.avatar }, (resp) => {
        if(!resp?.ok){ alert('Login failed'); return; }
      });
    });
    socket.on('message:new', (msg) => {
      if(msg.room === activeRoom){
        pushMsg(msg);
      }
    });
    socket.on('presence:update', (usernames) => {
      onlineCount.textContent = usernames.length + ' ' + window.i18n.t('online');
    });
  }

  loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if(!username){ alert('Please enter nickname'); return; }
    me = { username, avatar: avatarInput.value.trim() };
    localStorage.setItem('minichat_me', JSON.stringify(me));
    meAvatar.src = me.avatar || 'https://api.dicebear.com/8.x/identicon/svg?seed=' + encodeURIComponent(username);
    meName.textContent = username;
    auth.classList.add('hidden');
    app.classList.remove('hidden');
    connect();
  });

  // Restore session if exists
  const saved = localStorage.getItem('minichat_me');
  if(saved){
    try {
      me = JSON.parse(saved);
      usernameInput.value = me.username || '';
      avatarInput.value = me.avatar || '';
      meAvatar.src = me.avatar || 'https://api.dicebear.com/8.x/identicon/svg?seed=' + encodeURIComponent(me.username);
      meName.textContent = me.username;
      auth.classList.add('hidden');
      app.classList.remove('hidden');
      connect();
    } catch {}
  }

  addFriendBtn.addEventListener('click', () => {
    const u = friendInput.value.trim();
    if(!u || u === (me?.username||'')) return;
    friends.add(u);
    renderList(friendList, Array.from(friends), 'friend');
    friendInput.value='';
  });

  newGroupBtn.addEventListener('click', () => {
    const g = groupNameInput.value.trim();
    if(!g) return;
    groups.add(g);
    renderList(groupList, Array.from(groups), 'group');
    groupNameInput.value='';
  });

  sendBtn.addEventListener('click', () => {
    const txt = msgInput.value.trim();
    if(!txt || !activeRoom) return;
    socket.emit('message:send', { room: activeRoom, content: txt }, (resp) => {
      if(resp?.ok){
        pushMsg(resp.msg);
        msgInput.value='';
      }
    });
  });

  msgInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') sendBtn.click();
  });

  // Set theme button label
  document.getElementById('themeBtn').textContent = document.documentElement.classList.contains('dark') ? window.i18n.t('themeLight') : window.i18n.t('themeDark');
})();
