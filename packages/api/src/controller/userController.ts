import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { supabase } from '../lib/supabase';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';

export default async function userController(fastify: FastifyInstance) {
  // GET /api/v1/user
  (fastify.get('/', async function (_request: FastifyRequest, reply: FastifyReply) {
    reply.send({
      balance: '$3,277.32',
      picture: 'http://placehold.it/32x32',
      age: 30,
      name: 'Leonor Cross',
      gender: 'female',
      company: 'GRONK',
      email: 'leonorcross@gronk.com',
    });
  }),
    fastify.delete(
      '/',
      { preHandler: authMiddleware },
      async function (request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user_id!;

        let status = 200;
        const { data, error } = await supabase.auth.admin.deleteUser(userId);
        if (error) {
          status = 500;
        }

        return reply.status(status).send({ data, error });
      }
    ));
}
