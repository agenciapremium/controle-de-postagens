
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

const schemaSql = `
-- Create Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_info VARCHAR(255),
  status VARCHAR(50) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Scopes Table
CREATE TABLE IF NOT EXISTS scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  material_type VARCHAR(100) NOT NULL,
  quantity_per_week INTEGER NOT NULL,
  posting_days TEXT[], -- Array of days, e.g., ['Monday', 'Wednesday']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  scope_id UUID REFERENCES scopes(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  posted_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50), -- 'EM_DIA', 'ATENCAO', 'ATRASADA' (Can be computed or stored)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_client_id ON posts(client_id);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_date ON posts(scheduled_date);
`;

async function applySchema() {
    try {
        console.log('Applying database schema...');
        await client.connect();
        await client.query(schemaSql);
        console.log('Schema applied successfully!');
        await client.end();
    } catch (err) {
        console.error('Error applying schema:', err);
        process.exit(1);
    }
}

applySchema();
