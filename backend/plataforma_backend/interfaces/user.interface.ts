export interface User {
  id_usuario?: number;
  nombre: string;
  email: string;
  password_hash: string;
  id_roles: number;
  id_empresa?: number | null;
  creado_en?: Date;
}
