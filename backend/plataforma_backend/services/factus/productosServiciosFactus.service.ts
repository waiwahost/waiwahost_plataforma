import { ProductosServiciosRepository } from '../../repositories/factus.repository';
import { ProductoServicioCreate, ProductoServicioUpdate } from '../../interfaces/factus.interface';

// ===================================================
// ROLES
// ===================================================
const ROLES = { SUPERADMIN: 1, EMPRESA: 2, ADMINISTRADOR: 3, PROPIETARIO: 4 };

// ===================================================
// SERVICE: LISTAR PRODUCTOS/SERVICIOS
// ===================================================
export class GetProductosServiciosService {
    private repo: ProductosServiciosRepository;
    constructor() { this.repo = new ProductosServiciosRepository(); }

    async execute(userContext: any, filters: { search?: string; tipo?: string; page?: number; limit?: number }) {
        try {
            const id_empresa = userContext.empresaId;
            if (!id_empresa) return { data: null, error: { status: 400, message: 'Empresa no identificada' } };
            const { data, total, error } = await this.repo.getAll(id_empresa, filters);
            if (error) return { data: null, error: { status: 500, message: 'Error al obtener productos/servicios', details: error } };
            return { data: { items: data, total }, error: null };
        } catch (error) {
            return { data: null, error: { status: 500, message: 'Error interno', details: error } };
        }
    }
}

// ===================================================
// SERVICE: OBTENER POR ID
// ===================================================
export class GetProductoServicioByIdService {
    private repo: ProductosServiciosRepository;
    constructor() { this.repo = new ProductosServiciosRepository(); }

    async execute(userContext: any, id: number) {
        try {
            const id_empresa = userContext.empresaId;
            const { data, error } = await this.repo.getById(id, id_empresa);
            if (error) return { data: null, error: { status: 500, message: 'Error al obtener producto/servicio', details: error } };
            if (!data) return { data: null, error: { status: 404, message: 'Producto/servicio no encontrado' } };
            return { data, error: null };
        } catch (error) {
            return { data: null, error: { status: 500, message: 'Error interno', details: error } };
        }
    }
}

// ===================================================
// SERVICE: CREAR
// ===================================================
export class CreateProductoServicioService {
    private repo: ProductosServiciosRepository;
    constructor() { this.repo = new ProductosServiciosRepository(); }

    async execute(userContext: any, payload: ProductoServicioCreate) {
        try {
            const id_empresa = userContext.empresaId;
            if (!id_empresa) return { data: null, error: { status: 400, message: 'Empresa no identificada' } };
            const { data, error } = await this.repo.create({ ...payload, id_empresa });
            if (error) return { data: null, error: { status: 500, message: 'Error al crear producto/servicio', details: error } };
            return { data, error: null };
        } catch (error) {
            return { data: null, error: { status: 500, message: 'Error interno', details: error } };
        }
    }
}

// ===================================================
// SERVICE: ACTUALIZAR
// ===================================================
export class UpdateProductoServicioService {
    private repo: ProductosServiciosRepository;
    constructor() { this.repo = new ProductosServiciosRepository(); }

    async execute(userContext: any, id: number, payload: ProductoServicioUpdate) {
        try {
            const id_empresa = userContext.empresaId;
            const { data, error } = await this.repo.update(id, id_empresa, payload);
            if (error) return { data: null, error: { status: 500, message: 'Error al actualizar', details: error } };
            if (!data) return { data: null, error: { status: 404, message: 'Producto/servicio no encontrado' } };
            return { data, error: null };
        } catch (error) {
            return { data: null, error: { status: 500, message: 'Error interno', details: error } };
        }
    }
}

// ===================================================
// SERVICE: ELIMINAR (SOFT DELETE)
// ===================================================
export class DeleteProductoServicioService {
    private repo: ProductosServiciosRepository;
    constructor() { this.repo = new ProductosServiciosRepository(); }

    async execute(userContext: any, id: number) {
        try {
            const id_empresa = userContext.empresaId;
            const { data, error } = await this.repo.softDelete(id, id_empresa);
            if (error) return { data: null, error: { status: 500, message: 'Error al eliminar', details: error } };
            if (!data) return { data: null, error: { status: 404, message: 'Producto/servicio no encontrado' } };
            return { data: { message: 'Eliminado correctamente' }, error: null };
        } catch (error) {
            return { data: null, error: { status: 500, message: 'Error interno', details: error } };
        }
    }
}

// Singletons
export const getProductosServiciosService = new GetProductosServiciosService();
export const getProductoServicioByIdService = new GetProductoServicioByIdService();
export const createProductoServicioService = new CreateProductoServicioService();
export const updateProductoServicioService = new UpdateProductoServicioService();
export const deleteProductoServicioService = new DeleteProductoServicioService();
