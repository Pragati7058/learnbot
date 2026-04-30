# LearnBot — AI Study Assistant for Engineering Students

A full-stack production-ready AI study assistant built with React + Node.js + MongoDB.

## Features
- AI Chat, Notes, Summary, Flashcards, Diagram, Flowchart, Code Helper, Formula, Quiz
- User auth (register / login / forgot password)
- Per-user chat history stored in MongoDB
- Groq LLaMA 3.3 70B powered
- Dark glassmorphism UI with custom cursor animations

## Tech Stack
| Layer     | Tech                          |
|-----------|-------------------------------|
| Frontend  | React 18, Vite, CSS-in-JS     |
| Backend   | Node.js, Express 4            |
| Database  | MongoDB + Mongoose            |
| AI        | Groq API (LLaMA 3.3 70B)      |
| Auth      | JWT + bcrypt                  |
| Deploy    | Vercel (frontend) + Render (backend) |

## Project Structure
```
learnbot/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Auth, App pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # API helpers, constants
│   │   ├── context/         # Auth + App context
│   │   └── styles/          # Global CSS
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                  # Express backend
│   ├── routes/              # auth, chat, history
│   ├── models/              # User, History mongoose models
│   ├── middleware/          # JWT auth guard
│   ├── config/              # DB connection
│   └── index.js
├── .env.example
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Groq API key (free at console.groq.com)

### 1. Clone & Install
```bash
# Install backend
cd server && npm install

# Install frontend
cd ../client && npm install
```

### 2. Environment Variables
```bash
# server/.env
MONGODB_URI=mongodb://localhost:27017/learnbot
JWT_SECRET=your_super_secret_key_here
PORT=5000
CLIENT_URL=http://localhost:5173

# client/.env
VITE_API_URL=http://localhost:5000
```

### 3. Run Development
```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

### 4. Deploy
**Frontend → Vercel:**
```bash
cd client && npm run build
# Upload dist/ to Vercel, set VITE_API_URL to your backend URL
```

**Backend → Render:**
- Connect GitHub repo
- Set root to `server/`
- Add environment variables
- Deploy

## API Endpoints
| Method | Route                | Description          | Auth |
|--------|----------------------|----------------------|------|
| POST   | /api/auth/register   | Create account       | No   |
| POST   | /api/auth/login      | Sign in              | No   |
| POST   | /api/auth/forgot     | Forgot password      | No   |
| GET    | /api/history         | Get user history     | Yes  |
| POST   | /api/history         | Save history entry   | Yes  |
| DELETE | /api/history/:id     | Delete history item  | Yes  |
| GET    | /api/user/profile    | Get profile          | Yes  |
