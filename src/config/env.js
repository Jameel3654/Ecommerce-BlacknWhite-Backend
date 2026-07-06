import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();
dotenv.config({ path: './sendgrid.env' });

// Custom boolean parser that handles "false" string correctly
const customBoolean = z.union([
  z.boolean(),
  z.string().transform((val) => val.toLowerCase() === 'true'),
]);

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(5000),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default('7d'),
  DB_SYNC: customBoolean.optional(),
  DB_SYNC_ALTER: customBoolean.optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_NAME: z.string().default('black_and_white'),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default('admin'),
  DB_DIALECT: z.string().default('mysql'),
  DB_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  ADMIN_EMAILS: z.string().email().optional().default('jameelahmed3654@gmail.com'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  ORDER_NOTIFICATION_EMAIL: z.string().email().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  PAYMENT_PROVIDER: z.string().default('cod'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  TEMP_UPLOAD_DIR: z.string().default('tmp/uploads'),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  DB_SYNC: parsedEnv.DB_SYNC ?? false,
  DB_SYNC_ALTER: parsedEnv.DB_SYNC_ALTER ?? false,
  DB_URL: parsedEnv.DB_URL,
};
