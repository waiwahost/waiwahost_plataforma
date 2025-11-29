import pool from '../../libs/db';

interface GetHuespedesParams {
    id_roles: number;
    empresaId?: number;
}

export const getHuespedesService = async (params: GetHuespedesParams) => {
    const { id_roles, empresaId } = params;

    try {
        let query = `
      SELECT DISTINCT
        h.id_huesped,
        h.nombre,
        h.apellido,
        h.documento_numero,
        h.email,
        h.telefono
      FROM huespedes h
    `;

        const queryParams: any[] = [];

        // Si no es superadmin (rol 1), filtrar por empresa
        if (id_roles !== 1) {
            if (!empresaId) {
                return { error: { status: 400, message: 'Empresa ID es requerido para este usuario' } };
            }

            query += `
        INNER JOIN huespedes_reservas hr ON h.id_huesped = hr.id_huesped
        INNER JOIN reservas r ON hr.id_reserva = r.id_reserva
        INNER JOIN inmuebles i ON r.id_inmueble = i.id_inmueble
        WHERE i.id_empresa = $1
      `;
            queryParams.push(empresaId);
        }

        const { rows } = await pool.query(query, queryParams);

        return { data: rows };
    } catch (error) {
        console.error('Error en getHuespedesService:', error);
        return { error: { status: 500, message: 'Error al obtener huéspedes', details: error } };
    }
};
