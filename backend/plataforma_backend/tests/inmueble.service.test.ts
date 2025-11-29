import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateInmuebleService } from '../services/inmuebles/createInmuebleService';
import { ROLES } from '../constants/globalConstants';

// Mock the repositories
vi.mock('../repositories/inmueble.repository', () => {
  return {
    InmuebleRepository: vi.fn().mockImplementation(() => ({
      insert: vi.fn().mockResolvedValue({
        data: {
          id_inmueble: 1,
          direccion: 'Test Address',
          ciudad: 'Test City',
          departamento: 'Test Department',
          tipo_inmueble: 'casa',
          area_total: 100,
          area_construida: 80,
          id_empresa: 1,
          estado: 'disponible'
        },
        error: null
      })
    }))
  };
});

vi.mock('../repositories/user.repository', () => {
  return {
    UserRepository: vi.fn().mockImplementation(() => ({
      getById: vi.fn().mockImplementation((id) => {
        if (id === '1') {
          return Promise.resolve({
            data: {
              id_usuario: 1,
              email: 'superadmin@test.com',
              id_roles: ROLES.SUPERADMIN,
              id_empresa: 1
            },
            error: null
          });
        } else if (id === '2') {
          return Promise.resolve({
            data: {
              id_usuario: 2,
              email: 'empresa@test.com',
              id_roles: ROLES.EMPRESA,
              id_empresa: 1
            },
            error: null
          });
        } else if (id === '3') {
          return Promise.resolve({
            data: {
              id_usuario: 3,
              email: 'propietario@test.com',
              id_roles: ROLES.PROPIETARIO,
              id_empresa: 1
            },
            error: null
          });
        }
        return Promise.resolve({ data: null, error: 'User not found' });
      }),
      findByEmail: vi.fn().mockImplementation((email) => {
        if (email === 'propietario@test.com') {
          return Promise.resolve({
            data: {
              id_usuario: 3,
              email: 'propietario@test.com',
              id_roles: ROLES.PROPIETARIO,
              id_empresa: 1,
              id_propietario: 5
            },
            error: null
          });
        }
        return Promise.resolve({ data: null, error: 'User not found' });
      })
    }))
  };
});

describe('CreateInmuebleService Integration Tests', () => {
  let service: CreateInmuebleService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CreateInmuebleService();
  });

  const validInmuebleData = {
    direccion: 'Test Address',
    ciudad: 'Test City',
    departamento: 'Test Department',
    tipo_inmueble: 'casa' as const,
    area_total: 100,
    area_construida: 80,
    id_empresa: 1,
    estado: 'disponible' as const
  };

  it('should allow superadmin to create inmueble for any empresa', async () => {
    const result = await service.execute(1, validInmuebleData);
    
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data.direccion).toBe('Test Address');
  });

  it('should allow empresa user to create inmueble for their own empresa', async () => {
    const result = await service.execute(2, validInmuebleData);
    
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
  });

  it('should not allow empresa user to create inmueble for different empresa', async () => {
    const inmuebleDataDifferentEmpresa = { ...validInmuebleData, id_empresa: 2 };
    const result = await service.execute(2, inmuebleDataDifferentEmpresa);
    
    expect(result.error).toBeDefined();
    expect(result.error.status).toBe(403);
    expect(result.error.message).toBe('Solo puede crear inmuebles en su propia empresa');
  });

  it('should allow propietario to create inmueble and associate with their id_propietario', async () => {
    const result = await service.execute(3, validInmuebleData);
    
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
  });

  it('should validate required fields', async () => {
    const invalidData = { ...validInmuebleData, direccion: '' };
    const result = await service.execute(1, invalidData);
    
    expect(result.error).toBeDefined();
    expect(result.error.status).toBe(400);
    expect(result.error.message).toBe('Dirección, ciudad y departamento son requeridos');
  });

  it('should validate that area_construida is not greater than area_total', async () => {
    const invalidData = { ...validInmuebleData, area_construida: 120, area_total: 100 };
    const result = await service.execute(1, invalidData);
    
    expect(result.error).toBeDefined();
    expect(result.error.status).toBe(400);
    expect(result.error.message).toBe('El área construida no puede ser mayor al área total');
  });
});