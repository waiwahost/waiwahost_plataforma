import pool from './db';

(async () => {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa a PostgreSQL:', rows[0]);
  } catch (error) {
    console.error('Error de conexión a PostgreSQL:', error);
  } finally {
    await pool.end();
  }
})();
