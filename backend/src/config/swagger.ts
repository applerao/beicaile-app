import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '被裁了吗 API',
      version: '1.0.0',
      description: '被裁了吗 App 后端 API 文档',
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
        description: '开发服务器',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
