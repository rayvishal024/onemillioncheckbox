# 🟦 One Million Checkbox (Real-time + OAuth Secured)

A real-time, distributed checkbox grid powered by **Node.js, Socket.IO, Redis (Valkey), and OAuth 2.0 Authentication**.

Users can view a globally shared checkbox state, but only authenticated users can interact (toggle checkboxes).

---

## ✨ Features

* 🔄 Real-time sync using Socket.IO
* ⚡ Redis Pub/Sub for distributed updates
* 🔐 OAuth 2.0 Authentication (Authorization Code Flow)
* 🚫 Rate limiting (anti-spam protection)
* 🌐 Production deployment (Render + Redis)
* 🎨 Clean modern UI with custom checkbox grid
* 📦 Scalable architecture

---

## 🏗️ Architecture

```
  Frontend (Browser)
      ↓
  Node.js Server (Socket.IO)
      ↓
  Redis (Pub/Sub + State)
      ↓
  OAuth Service (External)
```

---

## 📁 Project Structure

```
.
├── public/
│   ├── index.html
│   └── style.css
├── src/
│   ├── server.js
│   └── auth.middleware.js
├── redis-connection.js
├── .env
├── .env.example
├── package.json
└── docker-compose.yml
```

---

## ⚙️ Tech Stack

* Backend: Node.js, Express
* Realtime: Socket.IO
* Database / Cache: Redis (Valkey compatible)
* Auth: OAuth 2.0 (Custom Service)
* Deployment: Render
* Frontend: Vanilla JS + CSS

---

## 🔐 Authentication Flow

1. User clicks **Login**
2. Redirect to OAuth `/authorize`
3. User logs in
4. Redirect back with `code`
5. Frontend exchanges `code → access_token`
6. Token stored in `localStorage`
7. Token sent via Socket.IO

---

## 🔄 Real-Time Flow

```
Client → toggle checkbox
      ↓
Server → validate (auth + rate limit)
      ↓
Redis → update state
      ↓
Pub/Sub → broadcast event
      ↓
All clients updated instantly
```

---

## 🚫 Access Control

| Action        | Behavior     |
| ------------- | ------------ |
| Not Logged In | View only    |
| Logged In     | Can toggle   |
| Spam Clicking | Rate limited |

---

## 🧪 Environment Variables

Create `.env` file:

```
PORT=3000
REDIS_URL=redis://localhost:6379
```

---

## 🚀 Local Setup

### 1. Clone repository

```
git clone https://github.com/your-username/one-million-checkbox.git
cd one-million-checkbox
```

### 2. Install dependencies

```
npm install
```

### 3. Start Redis (Docker)

```
docker-compose up -d
```

### 4. Run server

```
npm run dev
```

### 5. Open in browser

```
http://localhost:3000
```

---

## 🌐 Deployment (Render)

### 1. Create Redis service on Render

* Copy Internal Redis URL

### 2. Create Web Service

* Build Command:

```
npm install
```

* Start Command:

```
node src/server.js
```

### 3. Add Environment Variable

```
REDIS_URL=redis://your-render-redis-url
```

### 4. Deploy 🎉

---

## ⚠️ Important Notes

* Do NOT use localhost Redis in production
* Always use Render internal Redis URL
* OAuth redirect_uri must match deployed domain exactly
* Socket.IO requires proper CORS setup

---

## 🧠 Key Concepts

* Pub/Sub architecture
* Event-driven systems
* OAuth Authorization Code Flow
* Rate limiting with Redis
* Real-time distributed systems

---

## 🚀 Future Improvements

* 👤 Show active users
* 🎨 Per-user checkbox colors
* 📊 Analytics dashboard
* 🔒 JWT validation on socket layer
* ⚡ Horizontal scaling

---

## 👨‍💻 Author

**Vishal Ray**
GitHub: https://github.com/rayvishal024

---

## 📜 License

MIT License