export interface ExternalUser {
  id_usuario: number;
  nombre: string;
  email: string;
  id_roles: number;
  id_empresa: number | null;
  username: string;
  creado_en: string;
  rol_name: string;
  empresa_nombre: string | null;
  // Puedes agregar más campos si la API externa los provee
}
