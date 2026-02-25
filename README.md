# devTinder – Backend

Backend API for **devTinder**, a developer matchmaking platform where developers can create profiles, connect, send requests, and build meaningful professional connections.

---

## 🚀 Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Validator
- dotenv
- CORS

---

## 📌 Features

- 🔐 User Authentication (Signup / Login)
- 🔑 JWT-based Authorization
- 👤 Profile Creation & Editing
- 📩 Send / Accept / Reject Connection Requests
- ❤️ Interested / Ignore Feature
- 📃 View Connections
- 🛡 Middleware-based Route Protection
- ✅ Input Validation & Error Handling

---

## 🏗 Project Structure (MVC Pattern)
```bash
devTinder-backend/
│
├── src/
│   ├── config/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── utils/
│
├── app.js
├── .env
├── package.json
└── README.md
```

---

## 🔑 API Modules

- Auth Routes
- Profile Routes
- Connection Routes
- Request Routes

---

## ⚙️ Environment Variables

Create a `.env` file:

- PORT=port_no
- MONGO_URI=your_mongodb_connection
- JWT_SECRET=your_secret_key

---

## ▶️ Installation & Setup

```bash
git clone https://github.com/VaibhaviMistri/devTinder-backend.git
cd devTinder-backend
npm install
npm run dev