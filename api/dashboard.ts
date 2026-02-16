
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDbClient } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const client = await getDbClient();

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        // Status Logic:
        // ATRASADA (> 3 days late): status='pending' AND date < (today - 3 days)
        // ATENCAO (1-3 days late): status='pending' AND date < today AND date >= (today - 3 days)
        // EM DIA (Posted today): status='posted' AND date = today

        // Note: Postgres date arithmetic

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

        res.status(200).json({
            critical: parseInt(criticalRes.rows[0].count),
            attention: parseInt(attentionRes.rows[0].count),
            onTime: parseInt(onTimeRes.rows[0].count)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching dashboard stats' });
    }
}
