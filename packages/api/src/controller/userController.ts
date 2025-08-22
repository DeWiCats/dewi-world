import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { supabase } from '../lib/supabase';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import { Profile } from '../types/user';

export default async function userController(fastify: FastifyInstance) {
  // GET /api/v1/user
  fastify.get('/', async function (request: FastifyRequest, reply: FastifyReply) {
    console.log('get user');
    const query = request.query as Partial<Profile>;

    // Start building the Supabase query - filter by owner_id first
    let supabaseQuery = supabase.from('profile').select('*');

    // Apply additional filters
    if (query.username) {
      supabaseQuery = supabaseQuery.eq('username', query.username!);
    }

    if (query.user_id) {
      supabaseQuery = supabaseQuery.eq('user_id', query.user_id!);
    }

    if (query.avatar) {
      supabaseQuery = supabaseQuery.eq('avatar', query.avatar!);
    }

    const { data, error, status, count } = await supabaseQuery;
    console.log('get user result', data, error, status, count);

    return reply.status(status).send({ data, count, message: error?.message });
  });

  fastify.post(
    '/',

    async function (request: FastifyRequest, reply: FastifyReply) {
      console.log('create new user');
      console.log('request body', request.body);
      const body = JSON.parse(request.body as string) as Profile;
      console.log('body', body);
      const insertData = {
        user_id: body.user_id,
        username: body.username,
        avatar: body.avatar,
      };
      console.log('insertData', insertData);

      const { data, error, status } = await supabase
        .from('profile')
        .insert(insertData)
        .select('*')
        .single();
      console.log('create new user result', data, error, status);

      return reply.status(status).send({ data, message: error?.message });
    }
  );

  fastify.delete(
    '/',
    { preHandler: authMiddleware },
    async function (request: AuthenticatedRequest, reply: FastifyReply) {
      const userId = request.user_id!;

      let status = 200;
      const { data, error } = await supabase.auth.admin.deleteUser(userId);
      if (error) {
        status = error.status || 500;
      }

      return reply.status(status).send({ data, message: error?.message });
    }
  );
}
