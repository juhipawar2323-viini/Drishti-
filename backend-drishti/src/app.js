import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false, // Allows flexible media/camera and audio synthesis
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// HTTP Request logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers with ample limit for image payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static frontend build directory (if exists)
const frontendDistPath = path.resolve(__dirname, '../../frontend-drishti/dist');
const hasFrontendDist = fs.existsSync(frontendDistPath);

if (hasFrontendDist) {
  app.use(express.static(frontendDistPath));
}

// Root API Landing Endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '👁️ Drishti Visual Accessibility API is Running',
    version: '1.0.0',
    frontendUrl: 'http://localhost:5173',
    aiProvider: config.ai.provider,
    aiModel: config.ai.model,
    endpoints: {
      health: 'GET /api/health',
      scans: 'POST /api/scans, GET /api/scans',
      auth: 'POST /api/auth/register, POST /api/auth/login, GET /api/auth/me',
      ai: 'GET /api/ai/status, POST /api/ai/config',
    },
    documentation: 'See README.md in workspace root'
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'Drishti Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aiProvider: config.ai.provider,
    aiModel: config.ai.model,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/ai', aiRoutes);

// Root URL Handler for GET /
app.get('/', (req, res, next) => {
  if (hasFrontendDist) {
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  }

  // If dist not present, show friendly HTML server status dashboard
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Drishti API Server</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #020617; color: #f8fafc; padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; }
          .card { background: #0f172a; border: 1px solid #1e293b; padding: 2rem; border-radius: 1.5rem; max-width: 550px; width: 100%; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5); text-align: center; }
          h1 { color: #818cf8; margin-bottom: 0.5rem; }
          p { color: #94a3b8; font-size: 0.95rem; }
          .btn { display: inline-block; background: #4f46e5; color: white; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: bold; margin-top: 1.5rem; }
          .btn:hover { background: #4338ca; }
          .status { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; background: rgba(34, 197, 94, 0.2); color: #4ade80; font-size: 0.8rem; font-weight: bold; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>👁️ DRISHTI API</h1>
          <p>Backend API server is running smoothly on port 5000.</p>
          <span class="status">● System Healthy</span>
          <br>
          <a class="btn" href="http://localhost:5173" target="_blank">Open Drishti Web Application (Port 5173) →</a>
        </div>
      </body>
    </html>
  `);
});

// Single Page Application Fallback for client routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return notFound(req, res, next);
  }
  if (hasFrontendDist) {
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  }
  next();
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
