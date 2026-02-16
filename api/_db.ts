
import { Client } from 'pg';

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

let connected = false;

export async function getDbClient() {
    if (!connected) {
        await client.connect();
        connected = true;
    }
    return client;
}
