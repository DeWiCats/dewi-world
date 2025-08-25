import app from './app';

const FASTIFY_PORT = Number(process.env.FASTIFY_PORT) || 3006;
const FASTIFY_HOST = process.env.FASTIFY_HOST || 'localhost';

app.listen({ port: 8080, host: FASTIFY_HOST });

console.log(`🚀  Fastify server running on port http://${FASTIFY_HOST}:${FASTIFY_PORT}`);
console.log(`Route index: /`);
console.log(`Route user: /api/v1/user`);
