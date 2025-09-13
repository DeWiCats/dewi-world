import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { verifyDewiOwner } from '../lib/dewi';
import { supabase } from '../lib/supabase';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import {
  DeleteProfileQueryParams,
  Profile,
  ProfileCreationRequest,
  RegisterUserRequest,
  ResetPasswordQueryParams,
  ResetPasswordRequest,
  UpdateUserRequest,
  VerifyUserRequest,
} from '../types/user';

export default async function userController(fastify: FastifyInstance) {
  // GET /api/v1/user
  fastify.get('/', async function (request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as Partial<Profile & { email: string }>;

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

    // Work around for email registration
    if (query.email) {
      const user = (await supabase.auth.admin.listUsers()).data.users.find(
        user => user.email === query.email
      );
      if (!user) {
        return reply.status(200).send({ data: null });
      }
      if (user.email_confirmed_at) {
        return reply.status(400).send({ data: null, message: 'User alredy exists' });
      }
      supabaseQuery = supabaseQuery.eq('user_id', user?.id);
    }

    const { data, error, status: reqStatus, count } = await supabaseQuery;

    let status = 200;
    if (error) {
      status = reqStatus || 500;
    }

    return reply.status(status).send({ data, count, message: error?.message });
  });

  fastify.post('/', async function (request: FastifyRequest, reply: FastifyReply) {
    const body = JSON.parse(request.body as string) as ProfileCreationRequest;

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

  fastify.put(
    '/',
    { preHandler: authMiddleware },
    async function (request: AuthenticatedRequest, reply: FastifyReply) {
      const userId = request.user_id!;
      const body = JSON.parse(request.body as string) as UpdateUserRequest;

      let updateFields: Partial<Record<'username' | 'avatar', string>> = {};

      if (body.username) {
        updateFields.username = body.username;
      }

      if (body.avatar) {
        updateFields.avatar = body.avatar;
      }

      const { data, error, status } = await supabase
        .from('profile')
        .update(updateFields)
        .eq('user_id', userId)
        .select()
        .single();

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

  fastify.delete('/deleteProfile', async function (request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as DeleteProfileQueryParams;

    const { data, error, status } = await supabase
      .from('profile')
      .delete()
      .eq('user_id', query.user_id)
      .select();

    return reply.status(status).send({ data, message: error?.message });
  });

  fastify.put('/resetPassword', async function (request: FastifyRequest, reply: FastifyReply) {
    const body = JSON.parse(request.body as string) as ResetPasswordRequest;
    if (!body?.password || !body?.access_token) {
      return reply.status(400).send({ message: 'Missing parameters' });
    }

    const { data, error } = await supabase.auth.getUser(body.access_token);

    if (error) {
      return reply.status(error.status || 500).send({ message: error.message });
    }

    if (data?.user) {
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        data.user.id,
        { password: body.password }
      );
      let status = 200;
      if (updateError) {
        status = updateError.status || 500;
      }

      return reply.status(status).send({ data: updateData, message: updateError?.message });
    }
  });

  fastify.get('/resetPassword', async function (_request: FastifyRequest, reply: FastifyReply) {
    const htmlPath = resolve(__dirname, '../../static/resetPassword.html');
    const htmlContent = await readFile(htmlPath);
    reply.header('Content-Type', 'text/html; charset=utf-8').send(htmlContent);
  });

  fastify.get(
    '/sendResetPasswordEmail',
    async function (request: FastifyRequest, reply: FastifyReply) {
      const query = request.query as ResetPasswordQueryParams;
      if (!query.email) {
        return reply.status(403).send({ message: 'Missing email parameter.' });
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(query.email, {
        redirectTo: process.env.PASSWORD_REDIRECT_URL,
      });

      let status = 200;
      if (error) {
        status = error.status || 500;
      }

      return reply.status(status).send({ data, message: error?.message });
    }
  );

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
}
