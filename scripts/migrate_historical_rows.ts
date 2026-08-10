const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting historical rows migration...');

  // 1. Find all legacy users who have been mapped to a Supabase auth.users.id
  // We exclude users where id == auth_user_id (which means they are already proxy rows or native)
  const mappedUsers = await prisma.users.findMany({
    where: {
      auth_user_id: { not: null },
      // To prevent re-running on already migrated rows, we only pick rows where id != auth_user_id
      // Prisma doesn't support comparing two columns directly in where, so we fetch and filter in JS
    },
  });

  const usersToMigrate = mappedUsers.filter((u: any) => u.id !== u.auth_user_id);

  if (usersToMigrate.length === 0) {
    console.log('No users to migrate.');
    return;
  }

  console.log(`Found ${usersToMigrate.length} users to migrate.`);

  for (const user of usersToMigrate) {
    const legacyId = user.id;
    const authId = user.auth_user_id as string;

    console.log(`Migrating user ${user.email} (Legacy: ${legacyId} -> Auth: ${authId})`);

    await prisma.$transaction(async (tx: any) => {
      // 1. Create the proxy row if it doesn't exist
      const existingProxy = await tx.users.findUnique({ where: { id: authId } });
      if (!existingProxy) {
        await tx.users.create({
          data: {
            id: authId,
            email: user.email,
            email_verified: user.email_verified,
            display_name: user.display_name,
            password_hash: null, // Dummy password hash
            auth_user_id: authId, // Point to itself
          },
        });
        console.log(`  - Created proxy row ${authId}`);
      }

      // 2. Migrate usage_events
      const usageRes = await tx.usage_events.updateMany({
        where: { user_id: legacyId },
        data: { user_id: authId },
      });
      console.log(`  - Migrated ${usageRes.count} usage_events`);

      // 3. Migrate entitlements
      const entRes = await tx.entitlements.updateMany({
        where: { user_id: legacyId },
        data: { user_id: authId },
      });
      console.log(`  - Migrated ${entRes.count} entitlements`);

      // 4. Migrate profiles
      const profRes = await tx.profiles.updateMany({
        where: { user_id: legacyId },
        data: { user_id: authId },
      });
      console.log(`  - Migrated ${profRes.count} profiles`);

      // 5. Migrate auth_codes
      const authCodesRes = await tx.auth_codes.updateMany({
        where: { user_id: legacyId },
        data: { user_id: authId },
      });
      console.log(`  - Migrated ${authCodesRes.count} auth_codes`);

      // 6. Migrate refresh_tokens
      const tokensRes = await tx.refresh_tokens.updateMany({
        where: { user_id: legacyId },
        data: { user_id: authId },
      });
      console.log(`  - Migrated ${tokensRes.count} refresh_tokens`);
    });

    console.log(`Successfully migrated user ${user.email}.`);
  }

  console.log('Migration complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
