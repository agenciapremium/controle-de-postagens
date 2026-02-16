
import express from 'express';
import cors from 'cors';
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function connectDb() {
    try {
        await client.connect();
        console.log('Connected to Database');
    } catch (err) {
        console.error('Failed to connect to DB', err);
    }
}
connectDb();

// Mimic api/dashboard.ts
app.get('/api/dashboard', async (req, res) => {
    try {
        const criticalQuery = `
      SELECT COUNT(*) as count FROM posts 
      WHERE status = 'pending' AND date < CURRENT_DATE - INTERVAL '3 days'
    `;

        const attentionQuery = `
      SELECT COUNT(*) as count FROM posts 
      WHERE status = 'pending' AND date < CURRENT_DATE AND date >= CURRENT_DATE - INTERVAL '3 days'
    `;

        const onTimeQuery = `
      SELECT COUNT(*) as count FROM posts 
      WHERE status = 'posted' AND date = CURRENT_DATE
    `;

        const [criticalRes, attentionRes, onTimeRes] = await Promise.all([
            client.query(criticalQuery),
            client.query(attentionQuery),
            client.query(onTimeQuery)
        ]);

        res.json({
            critical: parseInt(criticalRes.rows[0].count),
            attention: parseInt(attentionRes.rows[0].count),
            onTime: parseInt(onTimeRes.rows[0].count)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Mimic api/clients.ts
app.get('/api/clients', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM clients ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching clients' });
    }
});

app.post('/api/clients', async (req, res) => {
    const { name, contact_info } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const result = await client.query(
            'INSERT INTO clients (name, contact_info) VALUES ($1, $2) RETURNING *',
            [name, contact_info]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating client' });
    }
});

// Mimic api/scopes.ts
app.get('/api/scopes', async (req, res) => {
    const { clientId } = req.query;
    if (!clientId) return res.status(400).json({ error: 'Client ID required' });

    try {
        const result = await client.query('SELECT * FROM scopes WHERE client_id = $1', [clientId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching scopes' });
    }
});

app.post('/api/scopes', async (req, res) => {
    const { clientId } = req.query;
    const { material_type, quantity_per_week, posting_days } = req.body;

    try {
        const result = await client.query(
            'INSERT INTO scopes (client_id, material_type, quantity_per_week, posting_days) VALUES ($1, $2, $3, $4) RETURNING *',
            [clientId, material_type, quantity_per_week, posting_days]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating scope' });
    }
});

app.delete('/api/scopes', async (req, res) => {
    const { id } = req.query;
    try {
        await client.query('DELETE FROM scopes WHERE id = $1', [id]);
        res.status(200).json({ message: 'Scope deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting scope' });
    }
});

// Mimic api/posts.ts
app.get('/api/posts', async (req, res) => {
    const { clientId } = req.query;
    try {
        let query = 'SELECT * FROM posts ORDER BY date DESC';
        let params = [];
        if (clientId) {
            query = 'SELECT * FROM posts WHERE client_id = $1 ORDER BY date DESC';
            params = [clientId];
        }
        const result = await client.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
});

app.post('/api/posts', async (req, res) => {
    const { client_id, content_type, date, status, notes } = req.body;
    try {
        const result = await client.query(
            'INSERT INTO posts (client_id, content_type, date, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [client_id, content_type, date, status || 'pending', notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating post' });
    }
});

app.put('/api/posts', async (req, res) => {
    const { id, status, link } = req.body;
    try {
        const result = await client.query(
            'UPDATE posts SET status = $1, link = $2 WHERE id = $3 RETURNING *',
            [status, link, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating post' });
    }
});

app.listen(port, () => {
    console.log(`Local API Server running at http://localhost:${port}`);
});
