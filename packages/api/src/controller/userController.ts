import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { verifyDewiOwner } from '../lib/dewi';
import { supabase } from '../lib/supabase';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import {
  Profile,
  ProfileCreationRequest,
  RegisterUserRequest,
  VerifyUserRequest,
} from '../types/user';

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

    return reply.status(status).send({ data, count, message: error?.message });
  });

  fastify.post('/', async function (request: FastifyRequest, reply: FastifyReply) {
    console.log('creating new user');
    const body = JSON.parse(request.body as string) as ProfileCreationRequest;
    console.log('request body', body);

    const insertData = {
      user_id: body.user_id,
      username: body.username,
      avatar: body.avatar,
      dewi_verified: false,
      blue_chip: false,
    };

    console.log('insertData', insertData);

    const { data, error, status } = await supabase
      .from('profile')
      .insert(insertData)
      .select('*')
      .single();

    console.log('result', data, error, status);

    return reply.status(status).send({ data, message: error?.message });
  });

  fastify.get('/verify', async function (request: FastifyRequest, reply: FastifyReply) {
    // Endpoint to verify alredy registered users
    const searchParams = request.query as VerifyUserRequest;
    const dewiAddress = searchParams.dewiAddress;

    const hasDewiCat = await verifyDewiOwner(dewiAddress);

    if (!hasDewiCat) {
      return reply.status(403).send({ message: 'Wallet does not have any DeWiCats' });
    }
    const { data, error, status } = await supabase
      .from('profile')
      .select()
      .eq('verified_address', dewiAddress)
      .single();

    return reply.status(status).send({ data, message: error?.message });
  });

  fastify.post('/register', async function (request: FastifyRequest, reply: FastifyReply) {
    const body = JSON.parse(request.body as string) as RegisterUserRequest;

    // Verify if wallet actually owns a DeWiCat
    const hasDewiCat = await verifyDewiOwner(body.dewiAddress);

    if (!hasDewiCat) {
      return reply.status(403).send({ message: 'Wallet does not have any DeWiCats' });
    }

    // Get user from auth.users table
    const { data, error } = await supabase.auth.admin.listUsers();
    const user = data.users.find(user => user.email === body.email);

    if (!user) return reply.status(404).send({ message: 'User not found: ' + error?.message });

    // Remove existing registration in case user is alredy verified
    const { error: deleteError, status: deleteStatus } = await supabase
      .from('profile')
      .update({ dewi_verified: false, verified_address: null })
      .eq('verified_address', body.dewiAddress);

    if (deleteError) {
      return reply.status(deleteStatus).send({ message: deleteError.message });
    }

    // Update user profile to add verification data
    const {
      data: profileData,
      error: profileError,
      status,
    } = await supabase
      .from('profile')
      .update({ dewi_verified: true, verified_address: body.dewiAddress })
      .eq('user_id', user.id)
      .select()
      .single();

    return reply.status(status).send({ data: profileData, message: profileError?.message });
  });

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
