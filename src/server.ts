import app from './app';
import config from './app/config';
import mongoose from 'mongoose';

async function server() {
  try {
    if (!config.database_url)
      throw new Error('DATABASE_URL is not configured.');
    await mongoose.connect(config.database_url);
    app.listen(config.port, () =>
      console.log(`Server listening on port ${config.port}`),
    );
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exitCode = 1;
  }
}
server();
