# MiniChat (super simple web chat)

This is a minimal demo you can upload to GitHub and deploy quickly.

## Structure
- `server/`: Node + Express + Socket.IO relay (no database; demo only).
- `web/`: Static website (plain HTML/JS/CSS). Connects to the server via Socket.IO.

## Local run
1) Server
```bash
cd server
npm i
npm run start
```
It listens on http://localhost:4000

2) Web
Open `web/index.html` in a local static server (e.g., VSCode Live Server) or any static host.

## Deploy (free-tier friendly)
- **Server**: Deploy `server` folder to Render / Railway / Fly.io.
  - For Render:
    - Create a new "Web Service" from your GitHub repo, pick `/server`, set start command `node index.js` and port `4000` (Render sets `PORT` automatically).
  - For Railway:
    - Create a Node project from the `server` folder; default command `node index.js`.
- **Web**: Use GitHub Pages / Netlify / Vercel to host the `web` folder as static.
  - After your server is live, edit `web/config.js` and set `window.SERVER_URL` to your server URL (`https://your-app.onrender.com`). Commit & redeploy.

## Features in this ultra-minimal demo
- Set nickname + optional avatar URL (stored in your browser).
- Dark/Light toggle + Chinese/English toggle.
- Add "friends" (client-side) and click to open a **private DM** room.
- Create/join **groups** by using the same group name.
- Real-time text messages via Socket.IO.
- Presence counter (online users).

> NOTE: This demo has **no database** and no real account system. It is for quick testing and sharing a URL. For production, add persistence and proper auth.
