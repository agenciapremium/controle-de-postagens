
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Specify the path to the .env file explicitly
dotenv.config({ path: path.resolve(__dirname, '.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
    try {
        console.log('Connecting to database...');
        // Safely log the connection string masking the password
        const safeUrl = process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':****@');
        console.log('Database URL:', safeUrl);

        await client.connect();
        const res = await client.query('SELECT NOW()');
        console.log('Connection successful:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
}

testConnection();
