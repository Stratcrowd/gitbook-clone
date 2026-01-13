import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("No DATABASE_URL found");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
});

async function reset() {
    console.log('Resetting database...');
    const client = await pool.connect();
    try {
        await client.query('DROP SCHEMA public CASCADE;');
        await client.query('CREATE SCHEMA public;');
        await client.query('GRANT ALL ON SCHEMA public TO postgres;');
        await client.query('GRANT ALL ON SCHEMA public TO public;');
        console.log('Database reset complete.');
    } catch (e) {
        console.error('Error fetching data:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

reset();
