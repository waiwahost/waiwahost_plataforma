export const createBloqueoSchema = {
    body: {
        type: 'object',
        required: ['id_inmueble', 'fecha_inicio', 'fecha_fin', 'tipo_bloqueo'],
        properties: {
            id_inmueble: { type: 'integer' },
            fecha_inicio: { type: 'string', format: 'date' },
            fecha_fin: { type: 'string', format: 'date' },
            tipo_bloqueo: {
                type: 'string',
                enum: ['mantenimiento', 'aseo', 'uso_propietario', 'administrativo', 'otro']
            },
            descripcion: { type: 'string' }
        }
    }
};

export const updateBloqueoSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'integer' }
        }
    },
    body: {
        type: 'object',
        properties: {
            fecha_inicio: { type: 'string', format: 'date' },
            fecha_fin: { type: 'string', format: 'date' },
            tipo_bloqueo: {
                type: 'string',
                enum: ['mantenimiento', 'aseo', 'uso_propietario', 'administrativo', 'otro']
            },
            descripcion: { type: 'string' }
        }
    }
};

export const deleteBloqueoSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'integer' }
        }
    }
};

export const getBloqueosSchema = {
    querystring: {
        type: 'object',
        properties: {
            id_inmueble: { type: 'integer' },
            tipo_bloqueo: { type: 'string' },
            fecha_inicio: { type: 'string', format: 'date' },
            fecha_fin: { type: 'string', format: 'date' }
        }
    }
};
