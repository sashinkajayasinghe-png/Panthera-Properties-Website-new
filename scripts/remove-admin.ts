/**
 * Remove an administrator account.
 *   npm run admin:remove -- someone@example.com
 * Refuses to remove the last remaining administrator.
 */
import { PrismaClient } from "@prisma/client";

const [email] = process.argv.slice(2);
const prisma = new PrismaClient();

async function main() {
  if (!email) throw new Error("Usage: npm run admin:remove -- <email>");
  const target = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!target) throw new Error(`No administrator with email ${email}.`);
  if ((await prisma.adminUser.count()) <= 1) throw new Error("Refusing to remove the last administrator.");
  await prisma.adminUser.delete({ where: { id: target.id } });
  const remaining = await prisma.adminUser.findMany({ select: { email: true } });
  console.log(`✓ Removed ${email}. Remaining administrators: ${remaining.map((a) => a.email).join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
