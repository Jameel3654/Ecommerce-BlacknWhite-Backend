import app from './app.js';
import { env } from './config/env.js';
import { sequelize } from './models/index.js';

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (env.DB_SYNC) {
      await sequelize.sync({ alter: env.DB_SYNC_ALTER });
      console.log('Database tables are ready.');
    }

    app.listen(env.PORT, () => {
      console.log(`BLACK & WHITE backend listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
};

startServer();
