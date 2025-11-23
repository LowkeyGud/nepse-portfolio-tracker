# NEPSE Portfolio Tracker

A real-time NEPSE (Nepal Stock Exchange) portfolio tracking application with live market data, user authentication, and cloud database persistence.

## ✨ Features

- 📊 **Real-time Market Data** - Live stock prices from Merolagani
- 💼 **Portfolio Management** - Track your NEPSE investments
- 📝 **Notes** - Add personal notes to each stock
- 🔐 **User Authentication** - Secure sign-in with Clerk
- ☁️ **Cloud Sync** - Portfolio synced across devices via MongoDB
- 🎨 **Premium UI** - Modern glassmorphism design with animations
- 🔔 **Circuit Breakers** - Visual indicators for +/-10% moves
- 📈 **Live Calculations** - Real-time P&L tracking

## 🚀 Tech Stack

### Frontend
- **React** (Vite)
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Clerk** - Authentication

### Backend
- **Node.js** + **Express**
- **MongoDB** (Mongoose) - Database
- **Cheerio** - Web scraping
- **Axios** - HTTP client

## 🏃 Running Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Clerk account

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd share
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   MONGODB_URI=your_mongodb_uri
   VITE_API_URL=http://localhost:3001
   ```

4. **Start the backend server**
   ```bash
   npm run server
   ```

5. **Start the frontend** (in a new terminal)
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🎯 Usage

1. **Sign In** - Click the "Sign In" button to authenticate
2. **Add Stocks** - Click "Add Stock" to add holdings to your portfolio
3. **Track Performance** - View real-time value and daily changes
4. **Add Notes** - Click "Add Note" on any stock card to add personal notes
5. **Manage Holdings** - Edit quantities or remove stocks as needed

## 🔒 Security

- User authentication via Clerk
- Secure MongoDB connection
- Environment variables for sensitive data
- CORS protection on API

## 📄 License

MIT

## 🙏 Acknowledgments

- Market data from Merolagani
- Icons by Lucide
- UI inspiration from modern fintech apps
