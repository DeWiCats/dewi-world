import { FastifyInstance } from 'fastify';
import indexController from './controller/indexController';
import locationController from './controller/locationController';
import messagingController from './controller/messagingController';
import userController from './controller/userController';

export default async function router(fastify: FastifyInstance) {
  fastify.register(userController, { prefix: '/api/v1/user' });
  fastify.register(locationController, { prefix: '/api/v1/locations' });
  fastify.register(messagingController, { prefix: '/api/v1/messaging' });
  fastify.register(indexController, { prefix: '/' });
}
