import { FastifyReply, FastifyRequest } from 'fastify';
import { supabase } from '../lib/supabase';

export interface AuthenticatedRequest extends FastifyRequest {
  user_id?: string;
  access_token?: string;
}

export async function authMiddleware(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    console.log("Authentication middleware running")
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        message: 'Authorization header required',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Validate the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Token validation failed:', error);
      return reply.status(401).send({
        success: false,
        message: 'Invalid or expired token. Please log in again.',
      });
    }

    // Store user info for use in route handlers
    request.user_id = user.id;
    request.access_token = token;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return reply.status(401).send({
      success: false,
      message: 'Authentication failed',
    });
  }
}
