/**
 * Points each neighbourhood at its image in public/neighborhoods/<slug>.webp, where one exists.
 *   npm run neighborhoods:sync-images
 */
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hoods = await prisma.neighborhood.findMany({ select: { id: true, slug: true }, orderBy: { sortOrder: "asc" } });
  const missing: string[] = [];
  for (const h of hoods) {
    if (!fs.existsSync(`public/neighborhoods/${h.slug}.webp`)) {
      missing.push(h.slug);
      continue;
    }
    await prisma.neighborhood.update({ where: { id: h.id }, data: { imageUrl: `/neighborhoods/${h.slug}.webp` } });
  }
  console.log(`✓ Updated ${hoods.length - missing.length} of ${hoods.length} neighbourhoods.`);
  if (missing.length) console.log(`• No image file for: ${missing.join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
