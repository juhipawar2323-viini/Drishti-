import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`👁️  DRISHTI BACKEND SERVER ACTIVE`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🤖 AI Provider: ${config.ai.provider} (${config.ai.model})`);
  console.log(`🗄️  Supabase URL: ${config.supabase.url}`);
  console.log(`==================================================\n`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection! 💥 Shutting down...', err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
