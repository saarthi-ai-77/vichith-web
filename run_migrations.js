const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const migrations = [
      'supabase/migrations/014_backfill_identity_mapping.sql',
      'supabase/migrations/015_resolve_duplicate_identity_row.sql',
      'supabase/migrations/016_split_meters.sql',
      'supabase/migrations/017_reasoning_tokens.sql'
    ];
    for (const file of migrations) {
      console.log(`Running ${file}...`);
      const sql = fs.readFileSync(file, 'utf8');
      await prisma.$executeRawUnsafe(sql);
      console.log(`Successfully executed ${file}`);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
