const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const wallets = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'wallets'`;
    console.log("Wallets columns:", wallets.map(c => c.column_name));
    
    const entitlements = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'entitlements'`;
    console.log("Entitlements columns:", entitlements.map(c => c.column_name));
    
    const users = await prisma.$queryRaw`SELECT id, email, auth_user_id FROM users WHERE email = 'info.vichith@gmail.com'`;
    console.log("Duplicate user check:", users);
    
    const unlinked = await prisma.$queryRaw`SELECT u.email FROM public.users u INNER JOIN auth.users a ON lower(u.email) = lower(a.email) WHERE u.auth_user_id IS NULL`;
    console.log("Unlinked users matching auth:", unlinked);
}
main().catch(console.error).finally(() => prisma.$disconnect());
