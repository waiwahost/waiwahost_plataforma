
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inmuebleController } from '../controllers/inmueble.controller';
import { deleteInmuebleService } from '../services/inmuebles/deleteInmuebleService';

// Mock the service
vi.mock('../services/inmuebles/deleteInmuebleService');

// Mock FastifyReply
const reply = () => {
  let res = {
    statusCode: 200,
    payload: undefined as any,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(data: any) {
      this.payload = data;
      return this;
    },
  };
  return res;
};

describe('inmuebleController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('delete', () => {
    it('should return 401 when user is not authenticated', async () => {
      const req: any = {
        userContext: null,
        params: { id: '1' },
      };
      const res = reply();
      
      await inmuebleController.delete(req, res as any);
      
      expect(res.statusCode).toBe(401);
      expect(res.payload.message).toBe('No autenticado');
    });

    it('should return 400 when id is invalid', async () => {
      const req: any = {
        userContext: { id: 1 },
        params: { id: 'invalid' },
      };
      const res = reply();
      
      await inmuebleController.delete(req, res as any);
      
      expect(res.statusCode).toBe(400);
      expect(res.payload.message).toBe('ID de inmueble inválido');
    });

    it('should return 404 when inmueble is not found', async () => {
      vi.mocked(deleteInmuebleService).mockResolvedValue({
        error: { status: 404, message: 'Inmueble no encontrado o ya inactivo' }
      });

      const req: any = {
        userContext: { id: 1 },
        params: { id: '999' },
      };
      const res = reply();
      
      await inmuebleController.delete(req, res as any);
      
      expect(res.statusCode).toBe(404);
      expect(res.payload.message).toBe('Inmueble no encontrado o ya inactivo');
      expect(deleteInmuebleService).toHaveBeenCalledWith(1, 999);
    });

    it('should return 403 when user does not have permission', async () => {
      vi.mocked(deleteInmuebleService).mockResolvedValue({
        error: { status: 403, message: 'No tiene permisos para eliminar inmuebles' }
      });

      const req: any = {
        userContext: { id: 1 },
        params: { id: '1' },
      };
      const res = reply();
      
      await inmuebleController.delete(req, res as any);
      
      expect(res.statusCode).toBe(403);
      expect(res.payload.message).toBe('No tiene permisos para eliminar inmuebles');
      expect(deleteInmuebleService).toHaveBeenCalledWith(1, 1);
    });

    it('should successfully delete inmueble when user has permission', async () => {
      vi.mocked(deleteInmuebleService).mockResolvedValue({
        success: true
      });

      const req: any = {
        userContext: { id: 1 },
        params: { id: '1' },
      };
      const res = reply();
      
      await inmuebleController.delete(req, res as any);
      
      expect(res.statusCode).toBe(200);
      expect(res.payload.data.success).toBe(true);
      expect(res.payload.data.message).toBe('Inmueble eliminado correctamente');
      expect(deleteInmuebleService).toHaveBeenCalledWith(1, 1);
    });
  it('should return 401 for unauthenticated update request', async () => {
    const req: any = { 
      params: { id_inmueble: '1' },

      body: { 
        direccion: 'Calle 123',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        tipo_inmueble: 'Apartamento',
        area: 80,
        estado: 'Disponible'
      },
      user: null // No hay usuario autenticado
    };
    const res = reply();
    await inmuebleController.update(req, res as any);
    expect(res.statusCode).toBe(401);
    expect(res.payload.isError).toBe(true);
    expect(res.payload.message).toBe('Usuario no autenticado o token inválido');
  });

  it('should return 400 for invalid data', async () => {
    const req: any = { 
      params: { id_inmueble: '1' },
      body: { 
        area: -5, // Área negativa (inválida)
      },
      user: {
        role: 'superadmin',
        empresaId: 1,
        propietarioId: null
      }
    };
    const res = reply();
    await inmuebleController.update(req, res as any);
    expect(res.statusCode).toBe(400);
    expect(res.payload.isError).toBe(true);
    expect(res.payload.message).toContain('Errores de validación');
  });

  it('should return 401 for unauthenticated getById request', async () => {
    const req: any = { 
      params: { id_inmueble: '1' },
      user: null // No hay usuario autenticado
    };
    const res = reply();
    await inmuebleController.getById(req, res as any);
    expect(res.statusCode).toBe(401);
    expect(res.payload.isError).toBe(true);
    expect(res.payload.message).toBe('Usuario no autenticado o token inválido');
  });

  it('should return 401 for unauthenticated list request', async () => {
    const req: any = { 
      user: null // No hay usuario autenticado
    };
    const res = reply();
    await inmuebleController.list(req, res as any);
    expect(res.statusCode).toBe(401);
    expect(res.payload.isError).toBe(true);
    expect(res.payload.message).toBe('Usuario no autenticado o token inválido');
  });
});