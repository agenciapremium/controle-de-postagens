
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDbClient } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const client = await getDbClient();
    const { clientId } = req.query;

    if (!clientId) {
        return res.status(400).json({ error: 'Client ID is required' });
    }

    if (req.method === 'GET') {
        try {
            const result = await client.query('SELECT * FROM scopes WHERE client_id = $1', [clientId]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching scopes' });
        }
    } else if (req.method === 'POST') {
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
    } else if (req.method === 'DELETE') {
        const { id } = req.query; // Scope ID
        try {
            await client.query('DELETE FROM scopes WHERE id = $1', [id]);
            res.status(200).json({ message: 'Scope deleted' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error deleting scope' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
