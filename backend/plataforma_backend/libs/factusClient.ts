import pool from '../libs/db';
import { FactusConfig, FactusTokenResponse } from '../interfaces/factus.interface';
import { FACTUS_URLS, FACTUS_ENDPOINTS } from '../constants/factusConstants';

/**
 * Cliente HTTP centralizado para consumir la API de Factus.
 * Maneja la autenticación OAuth2 con auto-refresh de token.
 */
class FactusClient {

    /**
     * Obtiene la configuración Factus de una empresa desde la BD.
     */
    private async getConfig(id_empresa: number): Promise<FactusConfig | null> {
        const { rows } = await pool.query(
            `SELECT * FROM factus_config WHERE id_empresa = $1 AND estado = 'activo' LIMIT 1`,
            [id_empresa]
        );
        return rows[0] || null;
    }

    /**
     * Obtiene la URL base según el ambiente configurado para la empresa.
     */
    private getBaseUrl(ambiente: 'sandbox' | 'produccion'): string {
        return FACTUS_URLS[ambiente] || FACTUS_URLS.sandbox;
    }

    /**
     * Solicita un token nuevo vía OAuth2 (password grant).
     */
    private async requestNewToken(config: FactusConfig): Promise<FactusTokenResponse> {
        const baseUrl = this.getBaseUrl(config.ambiente);
        const body = new URLSearchParams({
            grant_type: 'password',
            client_id: config.client_id,
            client_secret: config.client_secret,
            username: config.factus_username,
            password: config.factus_password,
        });

        const res = await fetch(`${baseUrl}${FACTUS_ENDPOINTS.token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
            body: body.toString(),
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Error obteniendo token Factus: ${res.status} - ${errText}`);
        }

        return res.json() as Promise<FactusTokenResponse>;
    }

    /**
     * Refresca el access_token usando el refresh_token.
     */
    private async refreshToken(config: FactusConfig): Promise<FactusTokenResponse> {
        const baseUrl = this.getBaseUrl(config.ambiente);
        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: config.client_id,
            client_secret: config.client_secret,
            refresh_token: config.refresh_token || '',
        });

        const res = await fetch(`${baseUrl}${FACTUS_ENDPOINTS.token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
            body: body.toString(),
        });

        if (!res.ok) {
            // Si falla el refresh, obtener token nuevo
            return this.requestNewToken(config);
        }

        return res.json() as Promise<FactusTokenResponse>;
    }

    /**
     * Persiste el token en la BD para la empresa.
     */
    private async saveToken(id_empresa: number, tokenRes: FactusTokenResponse): Promise<void> {
        const expiresAt = new Date(Date.now() + tokenRes.expires_in * 1000);
        await pool.query(
            `UPDATE factus_config
       SET access_token = $1, refresh_token = $2, token_expires_at = $3, actualizado_en = NOW()
       WHERE id_empresa = $4`,
            [tokenRes.access_token, tokenRes.refresh_token, expiresAt, id_empresa]
        );
    }

    /**
     * Obtiene un access_token válido para la empresa. Auto-refresh si está expirado.
     */
    async getToken(id_empresa: number): Promise<string> {
        const config = await this.getConfig(id_empresa);
        if (!config) throw new Error(`No hay configuración Factus para la empresa ${id_empresa}`);

        const now = new Date();
        const expiresAt = config.token_expires_at ? new Date(config.token_expires_at) : null;
        // Margen de 60s antes del vencimiento
        const isExpired = !expiresAt || expiresAt.getTime() - now.getTime() < 60_000;

        let tokenRes: FactusTokenResponse;

        if (config.access_token && !isExpired) {
            return config.access_token;
        } else if (config.refresh_token) {
            tokenRes = await this.refreshToken(config);
        } else {
            tokenRes = await this.requestNewToken(config);
        }

        await this.saveToken(id_empresa, tokenRes);
        return tokenRes.access_token;
    }

    /**
     * Realiza GET a Factus API autenticado.
     */
    async get(endpoint: string, id_empresa: number): Promise<any> {
        const config = await this.getConfig(id_empresa);
        if (!config) throw new Error(`No hay configuración Factus para la empresa ${id_empresa}`);
        const baseUrl = this.getBaseUrl(config.ambiente);
        const token = await this.getToken(id_empresa);

        const res = await fetch(`${baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Factus GET ${endpoint} falló: ${res.status} - ${errText}`);
        }

        return res.json();
    }

    /**
     * Realiza POST a Factus API autenticado.
     */
    async post(endpoint: string, body: object, id_empresa: number): Promise<any> {
        const config = await this.getConfig(id_empresa);
        if (!config) throw new Error(`No hay configuración Factus para la empresa ${id_empresa}`);
        const baseUrl = this.getBaseUrl(config.ambiente);
        const token = await this.getToken(id_empresa);

        const res = await fetch(`${baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Factus POST ${endpoint} falló: ${res.status} - ${errText}`);
        }

        return res.json();
    }

    /**
     * Descarga un archivo (PDF o XML) desde Factus como Buffer.
     */
    async download(endpoint: string, id_empresa: number): Promise<{ buffer: Buffer; contentType: string }> {
        const config = await this.getConfig(id_empresa);
        if (!config) throw new Error(`No hay configuración Factus para la empresa ${id_empresa}`);
        const baseUrl = this.getBaseUrl(config.ambiente);
        const token = await this.getToken(id_empresa);

        const res = await fetch(`${baseUrl}${endpoint}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
            throw new Error(`Error descargando archivo Factus: ${res.status}`);
        }

        const arrayBuffer = await res.arrayBuffer();
        const contentType = res.headers.get('content-type') || 'application/octet-stream';
        return { buffer: Buffer.from(arrayBuffer), contentType };
    }

    /**
     * Prueba la conexión con Factus para una empresa (útil para validar credenciales).
     */
    async testConnection(id_empresa: number): Promise<{ success: boolean; message: string }> {
        try {
            const token = await this.getToken(id_empresa);
            return { success: true, message: `Conexión exitosa. Token obtenido.` };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    }
}

// Singleton export
export const factusClient = new FactusClient();
