import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import env from '@fastify/env';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwt from 'fastify-jwt';

import { userRoutes } from './routes/user.routes';
import { empresasRoutes } from './routes/empresas.routes';
import { inmueblesRoutes } from './routes/inmuebles.routes';
import { propietariosRoutes } from './routes/propietarios.routes';
import { reservasRoutes } from './routes/reservas.routes';
import { disponibilidadRoutes } from './routes/disponibilidad.routes';
import { movimientosRoutes } from './routes/movimientos.routes';
import { ingresosRoutes } from './routes/ingresos.routes';
import { egresosRoutes } from './routes/egresos.routes';
import pagosRoutes from './routes/pagos.routes';
import { reportesRoutes } from './routes/reportes.routes';
import totalesReservaRoutes from './routes/totalesReserva.routes';
import { huespedesRoutes } from './routes/huespedes.routes';
import { tarjetaRegistroRoutes } from './routes/tarjetaRegistro.routes';
import { paisesRoutes } from './routes/paises.routes';
import { ciudadesRoutes } from './routes/ciudades.routes';
import { bloqueosRoutes } from './routes/bloqueos.routes';

import { errorHandler } from './middlewares/errorHandler';

const server = fastify({ logger: true });

// Env schema
const envSchema = {
  type: 'object',
  required: ['JWT_SECRET', 'HOST', 'PORT'],
  properties: {
    JWT_SECRET: { type: 'string' },
    HOST: { type: 'string' },
    PORT: { type: 'string' },
  },
};

server.register(env, {
  schema: envSchema,
  dotenv: true,
});

server.register(cors);
server.register(helmet);
server.register(sensible);
server.register(swagger, {
  swagger: {
    info: { title: 'API', version: '1.0.0' },
  },
});
server.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
});

server.register(jwt, { secret: process.env.JWT_SECRET || 'changeme' });

// Modular routes

server.register(disponibilidadRoutes, { prefix: '/disponibilidad' });
server.register(userRoutes, { prefix: '/users' });
server.register(empresasRoutes, { prefix: '/empresas' });
server.register(inmueblesRoutes, { prefix: '/inmuebles' });
server.register(propietariosRoutes, { prefix: '/propietarios' });
server.register(reservasRoutes, { prefix: '/reservas' });
server.register(movimientosRoutes, { prefix: '/movimientos' });
server.register(ingresosRoutes, { prefix: '/ingresos' });
server.register(egresosRoutes, { prefix: '/egresos' });
server.register(pagosRoutes);
server.register(totalesReservaRoutes, { prefix: '/admin/totales-reservas' });
server.register(reportesRoutes, { prefix: '/reportes' });
server.register(huespedesRoutes, { prefix: '/huespedes' });
server.register(tarjetaRegistroRoutes, { prefix: '/tarjeta-registro' });
server.register(paisesRoutes, { prefix: '/paises' });
server.register(ciudadesRoutes, { prefix: '/ciudades' });
server.register(bloqueosRoutes, { prefix: '/bloqueos' });

// Error handler
server.setErrorHandler(errorHandler);

const start = async () => {
  try {
    await server.listen({ port: Number(process.env.PORT) || 3001, host: process.env.HOST || '0.0.0.0' });
    console.log(`API running on http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3001}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
