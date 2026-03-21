const dotenv = require('dotenv');
dotenv.config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function run() {
    try {
        const { rows } = await pool.query('SELECT access_token, ambiente FROM factus_config LIMIT 1');
        if (!rows.length) { console.log('No token'); return; }
        const token = rows[0].access_token;
        const base = rows[0].ambiente === 'sandbox' ? 'https://api-sandbox.factus.com.co' : 'https://api.factus.com.co';

        const number = 'SETP990024984';

        const urlsToTest = [
            `/v1/bills/${number}/download-pdf`,
            `/v1/bills/download-pdf?number=${number}`,
            `/v1/bills/download-pdf/${number}`,
            `/v1/bills/show/${number}`
        ];

        for (const url of urlsToTest) {
            console.log(`\nTesting: ${base}${url}`);
            const res = await fetch(`${base}${url}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Status:', res.status, res.headers.get('content-type'));
            const text = await res.text();
            console.log('Body start:', text.substring(0, 150));
        }
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
