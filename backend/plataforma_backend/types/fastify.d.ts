import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    userContext?: {
      id: number;
      id_roles: number;
      role: string;
      empresaId: number | null;
    };
  }
}
