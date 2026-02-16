
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDbClient } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const client = await getDbClient();
    const { clientId } = req.query;

    if (req.method === 'GET') {
        // If clientId provided, filter by it, otherwise all posts (for global view)
        try {
            let query = 'SELECT * FROM posts ORDER BY date DESC';
            let params: any[] = [];

            if (clientId) {
                query = 'SELECT * FROM posts WHERE client_id = $1 ORDER BY date DESC';
                params = [clientId];
            }

            const result = await client.query(query, params);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching posts' });
        }
    } else if (req.method === 'POST') {
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
    } else if (req.method === 'PUT') {
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
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
