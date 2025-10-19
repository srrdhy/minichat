(function(){
  const dict = {
    en: {
      loginTitle: "Login / Set nickname",
      enter: "Enter",
      friends: "Friends",
      add: "Add",
      groups: "Groups",
      create: "Create/Join",
      send: "Send",
      online: "online",
      themeDark: "Dark",
      themeLight: "Light",
      empty: "Select a chat to start"
    },
    zh: {
      loginTitle: "登录 / 设置昵称",
      enter: "进入",
      friends: "好友",
      add: "添加",
      groups: "群组",
      create: "创建/加入",
      send: "发送",
      online: "在线",
      themeDark: "深色",
      themeLight: "浅色",
      empty: "选择一个会话开始聊天"
    }
  };
  window.i18n = {
    t(key){
      const lang = localStorage.getItem('lang') || 'zh';
      return (dict[lang] && dict[lang][key]) || key;
    },
    setLang(lang){
      localStorage.setItem('lang', lang);
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        el.textContent = window.i18n.t(k);
      });
      document.getElementById('themeBtn').textContent = document.documentElement.classList.contains('dark') ? window.i18n.t('themeLight') : window.i18n.t('themeDark');
    }
  };
})();
