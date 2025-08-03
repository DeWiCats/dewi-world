import cors from '@fastify/cors';
import fastify from 'fastify';
import router from './router';

const server = fastify({
  // Logger only for production
  logger: !!(process.env.NODE_ENV !== 'development'),
});

// Middleware: Router
server.register(router);

// CORS Headers
server.register(cors, {
  // Allow all origins for now
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  exposedHeaders: "Access-Control-Allow-Origin",
  credentials: true,
});

export default server;
