/**
 * Create or reset an administrator account.
 *   npm run admin:create -- you@example.com "a-strong-password" "Your Name"
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [email, password, name = "Administrator"] = process.argv.slice(2);
const prisma = new PrismaClient();

async function main() {
  if (!email || !password) throw new Error('Usage: npm run admin:create -- <email> "<password>" ["Name"]');
  if (password.length < 10) throw new Error("Password must be at least 10 characters.");
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, name },
    create: { email: email.toLowerCase(), passwordHash, name },
  });
  console.log(`✓ Administrator ${email} is ready.`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
