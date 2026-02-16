
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDbClient } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const client = await getDbClient();

    if (req.method === 'GET') {
        try {
            const result = await client.query('SELECT * FROM clients ORDER BY created_at DESC');
            res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching clients' });
        }
    } else if (req.method === 'POST') {
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
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
