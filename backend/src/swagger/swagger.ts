import swaggerJSDoc from 'swagger-jsdoc';
import { ENV } from '../config/env.config.js';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DealKart Enterprise Microservices Backend API',
      version: '1.0.0',
      description:
        'RESTful API Documentation for DealKart marketplace powered by Express, TypeScript, MySQL, Prisma, Redis, Socket.IO, AWS S3, Razorpay, and Nodemailer.',
      contact: {
        name: 'DealKart Engineering',
        email: 'api-support@dealkart.in',
      },
    },
    servers: [
      {
        url: `http://localhost:${ENV.PORT}/api`,
        description: 'Development API Gateway',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide JWT token generated via /api/auth/login or /api/auth/signup',
        },
      },
    },
  },
  apis: ['./src/services/**/*.router.ts', './src/server.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
