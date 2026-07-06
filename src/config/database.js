import { Sequelize } from 'sequelize';
import { env } from './env.js';

const baseOptions = {
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
  },
};

const connectionOptions = {
  ...baseOptions,
  dialect: env.DB_DIALECT,
  ...(env.DB_DIALECT === 'postgres' && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }),
};

export const sequelize = env.DB_URL
  ? new Sequelize(env.DB_URL, connectionOptions)
  : new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
      host: env.DB_HOST,
      port: env.DB_PORT,
      ...connectionOptions,
    });
