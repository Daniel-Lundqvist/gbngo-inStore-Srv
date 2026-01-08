import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDatabase } from './database/init.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import ticketRoutes from './routes/tickets.js';
import gameRoutes from './routes/games.js';
import highscoreRoutes from './routes/highscores.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import ideaResponseRoutes from './routes/ideaResponses.js';
import advertisementRoutes from './routes/advertisements.js';
import adminRoutes from './routes/admin.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import { setupWebSocket } from './websocket/controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Main startup function
async function startServer() {
  try {
    // Initialize database (async)
    await initDatabase();
    console.log('Database initialized');

    // Middleware
    app.use(cors({
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true
    }));
    app.use(express.json());
    app.use(session({
      secret: 'gbngo-quickgames-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));

    // Serve uploaded files
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/tickets', ticketRoutes);
    app.use('/api/games', gameRoutes);
    app.use('/api/highscores', highscoreRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/idea-responses', ideaResponseRoutes);
    app.use('/api/advertisements', advertisementRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/upload', uploadRoutes);

    // WebSocket setup
    setupWebSocket(io);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err.message);
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });

    httpServer.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║     Grab'n GO QuickGames Server               ║
╠═══════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}      ║
║  WebSocket ready for connections              ║
╚═══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
