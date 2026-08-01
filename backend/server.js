import dotenv from 'dotenv';
dotenv.config({ override: true });

import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/database.js';
import { initSocket } from './src/services/socketService.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀 CodeForge server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
};

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

// Triggering nodemon restart to pick up MongoDB Atlas URI
// Restarting to clear EADDRINUSE error
