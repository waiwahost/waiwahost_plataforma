import pool from './libs/db';

async function runMigration() {
  try {
    await pool.query('ALTER TABLE clientes_facturacion ADD COLUMN IF NOT EXISTS nombre_comercial VARCHAR(255);');
    await pool.query('ALTER TABLE clientes_facturacion ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(20);');
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

runMigration();
