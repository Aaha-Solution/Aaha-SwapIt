import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:2002@localhost:3306/dealkart_db',

  JWT_SECRET: process.env.JWT_SECRET || 'dealkart_jwt_access_secret_key_2026_super_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'dealkart_jwt_refresh_secret_key_2026_super_secure',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',

  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,

  AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'mock_access_key',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'mock_secret_key',
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || 'dealkart-uploads',

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey123456',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key_987654',

  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'DealKart <notifications@dealkart.in>',

  FCM_SERVER_KEY: process.env.FCM_SERVER_KEY || 'mock_fcm_server_key',

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  SENTRY_DSN: process.env.SENTRY_DSN || '',
};
