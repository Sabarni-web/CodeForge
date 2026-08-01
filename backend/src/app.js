import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import repoRoutes from './routes/repoRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import commitRoutes from './routes/commitRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import userRoutes from './routes/userRoutes.js';
import followRoutes from './routes/followRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import collaboratorRoutes from './routes/repositoryCollaboratorRoutes.js';
import settingsRoutes from './routes/repositorySettingsRoutes.js';
import repositorySearchRoutes from './routes/repositorySearchRoutes.js';
import forkRoutes from './routes/forkRoutes.js';

import errorHandler from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false, // needed for iframe preview
}));

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// HTTP logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'CodeForge API is running 🚀' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/repository', collaboratorRoutes);
app.use('/api/repository', settingsRoutes);
app.use('/api/repositories', repositorySearchRoutes);
app.use('/api/forks', forkRoutes);
app.use('/api/repos/:repoId/files', fileRoutes);
app.use('/api/repos/:repoId/commits', commitRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);

// Download repo as zip
import auth from './middleware/auth.js';
import Repository from './models/Repository.js';
import { streamRepoZip } from './utils/zipBuilder.js';
import { hasAccess } from './services/repositoryPermissionService.js';

app.get('/api/repos/:id/download', auth, async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.id).lean();
    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }
    const canAccess = await hasAccess(repo._id, req.user._id);
    if (!canAccess) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }
    await streamRepoZip(repo._id, repo.name, res);
  } catch (error) {
    next(error);
  }
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
