const fs = require('fs');
const { Client } = require('pg');

async function main() {
    let directUrl = process.env.DIRECT_URL;
    if (!directUrl) {
        console.error("No DIRECT_URL found in environment");
        return;
    }
    
    // Fix pooler URL for migrations: use port 5432 and remove pgbouncer=true
    directUrl = directUrl.replace(':6543', ':5432').replace('?pgbouncer=true', '');
    
    const client = new Client({ connectionString: directUrl });
    await client.connect();
    
    try {
        const migrations = [
            'supabase/migrations/014_backfill_identity_mapping.sql',
            'supabase/migrations/015_resolve_duplicate_identity_row.sql',
            'supabase/migrations/016_split_meters.sql',
            'supabase/migrations/017_reasoning_tokens.sql'
        ];
        for (const file of migrations) {
            console.log(`Running ${file}...`);
            const sql = fs.readFileSync(file, 'utf8');
            await client.query(sql);
            console.log(`Successfully executed ${file}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

// Load env from .env.local manually
const env = fs.readFileSync('.env.local', 'utf8');
const directUrlMatch = env.match(/DIRECT_URL="([^"]+)"/);
if (directUrlMatch) {
    process.env.DIRECT_URL = directUrlMatch[1];
}

main().catch(console.error);
