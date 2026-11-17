/**
 * Seeds neighbourhoods, an admin account (from SEED_ADMIN_* env vars) and clearly
 * labelled SAMPLE listings for testing. Sample listings are fictional and flagged
 * `isSample`, so the site labels them and admins can remove them in one click.
 *
 *   npm run db:seed            (set SEED_SAMPLES=false to skip sample listings)
 */
import { PrismaClient, type PropertyType, type ListingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";

const prisma = new PrismaClient();
const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2000&q=80`;

const NEIGHBORHOODS = [
  ["colombo-01", "Colombo 01", "Fort", "The historic commercial heart, where colonial landmarks meet the new skyline along the harbour.", 6.9344, 79.8428, "1486406146926-c627a92ad1ab"],
  ["colombo-02", "Colombo 02", "Slave Island & Union Place", "Beira Lake, new mixed-use towers and some of the city's most ambitious residential developments.", 6.922, 79.853, "1574362848149-11496d93a7c7"],
  ["colombo-03", "Colombo 03", "Kollupitiya", "Galle Road and Galle Face — ocean-facing apartments, embassies, dining and the city's social core.", 6.9105, 79.851, "1534237710431-e2fc698436d0"],
  ["colombo-04", "Colombo 04", "Bambalapitiya", "A lively, central neighbourhood of apartments and family homes between the sea and Duplication Road.", 6.893, 79.856, "1545324418-cc1a3fa10c00"],
  ["colombo-05", "Colombo 05", "Havelock Town & Narahenpita", "Quiet residential lanes, Havelock Park and established schools — long favoured by families.", 6.885, 79.868, "1600607688969-a5bfcd646154"],
  ["colombo-06", "Colombo 06", "Wellawatte & Pamankada", "A densely connected coastal district with sea-view apartments and convenient city access.", 6.874, 79.86, "1507525428034-b723cf961d3e"],
  ["colombo-07", "Colombo 07", "Cinnamon Gardens", "Wide, tree-lined avenues, embassies and grand residences around Viharamahadevi Park.", 6.91, 79.865, "1564013799919-ab600027ffc6"],
  ["colombo-08", "Colombo 08", "Borella", "A central, well-connected residential district close to hospitals, schools and Kanatte.", 6.915, 79.878, "1527030280862-64139fba04ca"],
  ["colombo-09", "Colombo 09", "Dematagoda", "An inner-city district with practical access to the Fort, rail links and Baseline Road.", 6.933, 79.877, "1600047509807-ba8f99d2cdde"],
  ["colombo-10", "Colombo 10", "Maradana", "A historic transport hub with mixed residential and commercial opportunities.", 6.929, 79.865, "1600585154526-990dced4db0d"],
  ["colombo-11", "Colombo 11", "Pettah", "Colombo's bustling trading quarter — of interest primarily for commercial investment.", 6.937, 79.851, "1494526585095-c41746248156"],
  ["colombo-12", "Colombo 12", "Hulftsdorp", "Home to the courts complex, with character buildings and commercial potential.", 6.942, 79.858, "1600566753190-17f0baa2a6c3"],
  ["colombo-13", "Colombo 13", "Kotahena", "A historic northern neighbourhood of churches, temples and close-knit streets.", 6.948, 79.86, "1523217582562-09d0def993a6"],
  ["colombo-14", "Colombo 14", "Grandpass", "A northern district along the Kelani River with emerging residential projects.", 6.95, 79.873, "1580587771525-78b9dba3b914"],
  ["colombo-15", "Colombo 15", "Mattakkuliya & Modara", "The city's northern coastal edge, close to the port and the Kelani estuary.", 6.963, 79.87, "1512917774080-9991f1c4c750"],
  ["rajagiriya", "Rajagiriya", "Sri Jayawardenepura Kotte", "Fast-growing and well connected, with modern apartments close to the administrative capital.", 6.909, 79.896, "1600596542815-ffad4c1539a9"],
  ["battaramulla", "Battaramulla", "Sri Jayawardenepura Kotte", "Green, spacious and near Parliament — popular for family homes and new developments.", 6.899, 79.918, "1613977257363-707ba9348227"],
  ["nawala", "Nawala", "Sri Jayawardenepura Kotte", "Leafy residential roads by the canal, with a calm, suburban rhythm close to the city.", 6.893, 79.888, "1605276374104-dee2a0ed3cd6"],
  ["dehiwala", "Dehiwala", "Dehiwala-Mount Lavinia", "A coastal residential suburb with sea-view apartments and the national zoological gardens.", 6.851, 79.865, "1499793983690-e29da59ef1c2"],
  ["mount-lavinia", "Mount Lavinia", "Dehiwala-Mount Lavinia", "Golden beaches, sea breezes and relaxed coastal living south of the city.", 6.839, 79.863, "1542314831-068cd1dbfeeb"],
  ["nugegoda", "Nugegoda", "Kotte", "A lively suburban centre with excellent shopping, schools and transport links.", 6.872, 79.889, "1568605114967-8130f3a36994"],
] as const;

type Sample = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  type: PropertyType;
  status?: ListingStatus;
  hood: string;
  price: number;
  beds?: number;
  baths?: number;
  area?: number;
  land?: number;
  featured?: boolean;
  investment?: boolean;
  features: string[];
  amenities: string[];
  images: string[];
  daysAgo: number;
};

const SAMPLES: Sample[] = [
  {
    slug: "sample-sea-view-residence-kollupitiya",
    title: "Sea-View Residence, Kollupitiya",
    summary: "A light-filled three-bedroom residence with ocean views on a high floor.",
    body: "Generous living and dining spaces open to a full-width balcony facing the Indian Ocean. Three bedrooms, each with an en-suite, a separate family lounge and a fitted kitchen with a utility area.",
    type: "APARTMENT",
    hood: "colombo-03",
    price: 135_000_000,
    beds: 3,
    baths: 3,
    area: 2150,
    featured: true,
    features: ["Ocean views", "Full-width balcony", "Three en-suite bedrooms", "Fitted kitchen", "Two parking spaces"],
    amenities: ["Swimming pool", "Gym", "24-hour security", "Backup generator", "Concierge"],
    images: ["1545324418-cc1a3fa10c00", "1502672260266-1c1ef2d93688", "1600210492486-724fe5c67fb0", "1616594039964-ae9021a400a0", "1484154218962-a197022b5858"],
    daysAgo: 2,
  },
  {
    slug: "sample-sky-penthouse-colombo-02",
    title: "The Sky Penthouse, Union Place",
    summary: "A duplex penthouse with a private terrace above Beira Lake.",
    body: "A two-level penthouse with double-height living spaces, a private roof terrace and plunge pool, four bedroom suites and a separate staff room. Floor-to-ceiling glazing frames the lake and the city skyline.",
    type: "PENTHOUSE",
    hood: "colombo-02",
    price: 520_000_000,
    beds: 4,
    baths: 5,
    area: 4800,
    featured: true,
    features: ["Duplex layout", "Private roof terrace", "Plunge pool", "Double-height living", "Staff quarters"],
    amenities: ["Private lift lobby", "Infinity pool", "Spa", "Valet parking", "24-hour security"],
    images: ["1600573472550-8090b5e0745e", "1613545325278-f24b0cae1224", "1618221195710-dd6b41faaea6", "1600607687644-c7171b42498f", "1600566752355-35792bedcfea"],
    daysAgo: 5,
  },
  {
    slug: "sample-garden-villa-cinnamon-gardens",
    title: "Garden Villa, Cinnamon Gardens",
    summary: "A contemporary five-bedroom villa on a mature, landscaped plot.",
    body: "Set behind a walled garden, this villa arranges its living spaces around a courtyard and a 15-metre pool. Five bedrooms, a library, a formal dining room and covered verandahs for tropical evenings.",
    type: "VILLA",
    hood: "colombo-07",
    price: 780_000_000,
    beds: 5,
    baths: 6,
    area: 6200,
    land: 32,
    featured: true,
    features: ["Courtyard plan", "15m swimming pool", "Library", "Covered verandahs", "Parking for four cars"],
    amenities: ["Landscaped garden", "Solar power", "Staff quarters", "CCTV", "Water treatment"],
    images: ["1613490493576-7fde63acd811", "1600607687939-ce8a6c25118c", "1600585152915-d208bec867a1", "1505691938895-1758d7feb511", "1582268611958-ebfd161ef9cf"],
    daysAgo: 8,
  },
  {
    slug: "sample-canal-side-house-nawala",
    title: "Canal-Side House, Nawala",
    summary: "A calm four-bedroom family home moments from the Nawala canal.",
    body: "A modern two-storey house with open-plan living that steps out onto a lawn. Four bedrooms upstairs, a study, and a covered car porch on a quiet residential lane.",
    type: "HOUSE",
    hood: "nawala",
    price: 145_000_000,
    beds: 4,
    baths: 4,
    area: 3600,
    land: 15,
    featured: true,
    features: ["Open-plan living", "Private lawn", "Study", "Covered car porch", "Roof terrace"],
    amenities: ["Solar water heating", "CCTV", "Rainwater harvesting"],
    images: ["1600585154340-be6161a56a0c", "1600047509807-ba8f99d2cdde", "1560448204-e02f11c3d0e2", "1600566753190-17f0baa2a6c3"],
    daysAgo: 11,
  },
  {
    slug: "sample-residential-land-rajagiriya",
    title: "Residential Land, Rajagiriya",
    summary: "A level 20-perch plot on a residential road, ready to build.",
    body: "A rectangular, level plot with a 30-foot road frontage in a residential neighbourhood, close to schools and the Parliament road. Clear deeds and approved survey plan (to be verified at due diligence).",
    type: "LAND",
    hood: "rajagiriya",
    price: 90_000_000,
    land: 20,
    features: ["Level plot", "30 ft road frontage", "Residential zoning", "Water and electricity available"],
    amenities: [],
    images: ["1500382017468-9049fed747ef", "1600607688969-a5bfcd646154"],
    daysAgo: 14,
  },
  {
    slug: "sample-havelock-apartment-colombo-05",
    title: "Park-Side Apartment, Havelock Town",
    summary: "A three-bedroom apartment overlooking Havelock Park.",
    body: "A well-proportioned three-bedroom apartment with a living room facing the park, a separate dining area and a fitted pantry. Ideal for families wanting a quieter Colombo 05 address.",
    type: "APARTMENT",
    hood: "colombo-05",
    price: 78_000_000,
    beds: 3,
    baths: 2,
    area: 1750,
    features: ["Park views", "Separate dining", "Fitted pantry", "One parking space"],
    amenities: ["Swimming pool", "Gym", "Children's play area", "24-hour security"],
    images: ["1574362848149-11496d93a7c7", "1493809842364-78817add7ffb", "1560185007-cde436f6a4d0", "1505691938895-1758d7feb511"],
    daysAgo: 3,
  },
  {
    slug: "sample-two-bedroom-battaramulla",
    title: "Two-Bedroom Residence, Battaramulla",
    summary: "A contemporary two-bedroom apartment in a new development.",
    body: "Bright, efficient living with a balcony overlooking greenery, two bedrooms and two bathrooms. Close to Parliament Road, schools and supermarkets.",
    type: "APARTMENT",
    hood: "battaramulla",
    price: 46_000_000,
    beds: 2,
    baths: 2,
    area: 1150,
    features: ["Balcony", "Modern kitchen", "One parking space"],
    amenities: ["Rooftop pool", "Gym", "Backup generator"],
    images: ["1527030280862-64139fba04ca", "1522708323590-d24dbb6b0267", "1502672260266-1c1ef2d93688"],
    daysAgo: 20,
  },
  {
    slug: "sample-coastal-house-mount-lavinia",
    title: "Coastal House, Mount Lavinia",
    summary: "A four-bedroom house a short walk from the beach.",
    body: "A bright family home with a generous living room, a garden with a small pool and four bedrooms. A short walk to Mount Lavinia beach and Galle Road.",
    type: "HOUSE",
    hood: "mount-lavinia",
    price: 98_000_000,
    beds: 4,
    baths: 3,
    area: 2900,
    land: 12,
    featured: true,
    features: ["Walk to the beach", "Garden pool", "Four bedrooms", "Car porch"],
    amenities: ["Solar power", "CCTV"],
    images: ["1564013799919-ab600027ffc6", "1600596542815-ffad4c1539a9", "1505843513577-22bb7d21e455", "1616594039964-ae9021a400a0"],
    daysAgo: 6,
  },
  {
    slug: "sample-commercial-building-bambalapitiya",
    title: "Commercial Building, Bambalapitiya",
    summary: "A five-storey mixed-use building on a main road — an income-generating asset.",
    body: "Ground-floor retail with four floors of offices, lift access and basement parking. Suitable for owner occupation or as a long-term investment.",
    type: "COMMERCIAL",
    hood: "colombo-04",
    price: 650_000_000,
    area: 12000,
    land: 18,
    investment: true,
    features: ["Main road frontage", "Ground-floor retail", "Four office floors", "Lift", "Basement parking"],
    amenities: ["Backup generator", "Fire detection system", "CCTV"],
    images: ["1486406146926-c627a92ad1ab", "1600585154526-990dced4db0d", "1516455590571-18256e5bb9ff"],
    daysAgo: 25,
  },
  {
    slug: "sample-sea-view-apartment-dehiwala",
    title: "Sea-View Apartment, Dehiwala",
    summary: "A three-bedroom apartment with sunset views over the ocean.",
    body: "Three bedrooms, a living room opening to an ocean-facing balcony and a modern kitchen. Steps from Galle Road and the coastal railway.",
    type: "APARTMENT",
    status: "UNDER_OFFER",
    hood: "dehiwala",
    price: 62_000_000,
    beds: 3,
    baths: 2,
    area: 1650,
    investment: true,
    features: ["Ocean views", "Balcony", "Modern kitchen"],
    amenities: ["Swimming pool", "Gym", "24-hour security"],
    images: ["1499793983690-e29da59ef1c2", "1600210492486-724fe5c67fb0", "1484154218962-a197022b5858"],
    daysAgo: 30,
  },
  {
    slug: "sample-family-home-nugegoda",
    title: "Family Home, Nugegoda",
    summary: "A three-bedroom home close to schools and the Nugegoda town centre.",
    body: "A practical, well-maintained house with a garden, three bedrooms and a separate dining room. Sold — retained here to test the sale-status filter.",
    type: "HOUSE",
    status: "SOLD",
    hood: "nugegoda",
    price: 72_000_000,
    beds: 3,
    baths: 2,
    area: 2400,
    land: 10,
    features: ["Garden", "Separate dining", "Car porch"],
    amenities: ["CCTV"],
    images: ["1568605114967-8130f3a36994", "1501183638710-841dd1904471"],
    daysAgo: 45,
  },
  {
    slug: "sample-ocean-penthouse-wellawatte",
    title: "Ocean Penthouse, Wellawatte",
    summary: "A four-bedroom penthouse with a wraparound terrace facing the sea.",
    body: "A top-floor residence with a wraparound terrace, open living and dining, a chef's kitchen and four bedroom suites. Strong rental appeal for investors.",
    type: "PENTHOUSE",
    hood: "colombo-06",
    price: 260_000_000,
    beds: 4,
    baths: 4,
    area: 3900,
    featured: true,
    investment: true,
    features: ["Wraparound terrace", "Chef's kitchen", "Four suites", "Two parking spaces"],
    amenities: ["Rooftop pool", "Gym", "Concierge", "24-hour security"],
    images: ["1600607687939-ce8a6c25118c", "1618221195710-dd6b41faaea6", "1600566752355-35792bedcfea", "1616594039964-ae9021a400a0"],
    daysAgo: 9,
  },
  {
    slug: "sample-tropical-villa-battaramulla",
    title: "Tropical Villa, Battaramulla",
    summary: "A five-bedroom villa with a pool pavilion and expansive gardens.",
    body: "Single-level living arranged around a pool and pavilion, with five bedrooms, a home office and wide garden lawns.",
    type: "VILLA",
    hood: "battaramulla",
    price: 230_000_000,
    beds: 5,
    baths: 5,
    area: 5100,
    land: 40,
    features: ["Pool pavilion", "Single-level living", "Home office", "Large garden"],
    amenities: ["Solar power", "Staff quarters", "CCTV", "Water treatment"],
    images: ["1613977257363-707ba9348227", "1582268611958-ebfd161ef9cf", "1600585152915-d208bec867a1", "1505691938895-1758d7feb511"],
    daysAgo: 4,
  },
];

const DISCLAIMER =
  "SAMPLE LISTING FOR TESTING ONLY — this property is fictional, is not available for sale, and uses illustrative stock photography.\n\n";

async function main() {
  for (const [i, [slug, name, tagline, description, lat, lng, image]] of NEIGHBORHOODS.entries()) {
    const district = slug.startsWith("colombo-") ? "Colombo" : tagline;
    await prisma.neighborhood.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name,
        // Only the numbered Colombo districts show an area name beside their title.
        tagline: slug.startsWith("colombo-") ? tagline : null,
        description,
        lat,
        lng,
        district,
        // Prefer the brand's own image in public/neighborhoods; fall back to the stock photo.
        imageUrl: fs.existsSync(`public/neighborhoods/${slug}.webp`) ? `/neighborhoods/${slug}.webp` : img(image),
        sortOrder: i,
      },
    });
  }
  console.log(`✓ ${NEIGHBORHOODS.length} neighbourhoods`);

  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 10) throw new Error("SEED_ADMIN_PASSWORD must be at least 10 characters.");
    const exists = await prisma.adminUser.findUnique({ where: { email } });
    if (!exists) {
      await prisma.adminUser.create({ data: { email, name: "Administrator", passwordHash: await bcrypt.hash(password, 12) } });
      console.log(`✓ admin account ${email}`);
    } else console.log(`• admin account ${email} already exists`);
  } else {
    console.log("• SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — run `npm run admin:create` to add an administrator.");
  }

  if (process.env.SEED_SAMPLES === "false") return;
  const hoods = Object.fromEntries((await prisma.neighborhood.findMany()).map((n) => [n.slug, n]));
  await prisma.property.deleteMany({ where: { isSample: true } });
  for (const s of SAMPLES) {
    const hood = hoods[s.hood];
    const jitter = () => (Math.random() - 0.5) * 0.006;
    await prisma.property.create({
      data: {
        slug: s.slug,
        title: s.title,
        summary: s.summary,
        description: DISCLAIMER + s.body,
        type: s.type,
        status: s.status ?? "AVAILABLE",
        featured: s.featured ?? false,
        investment: s.investment ?? false,
        isSample: true,
        price: s.price,
        bedrooms: s.beds ?? null,
        bathrooms: s.baths ?? null,
        floorArea: s.area ?? null,
        landExtent: s.land ?? null,
        address: `${hood.name}, Sri Lanka`,
        lat: hood.lat! + jitter(),
        lng: hood.lng! + jitter(),
        features: s.features,
        amenities: s.amenities,
        neighborhoodId: hood.id,
        listedAt: new Date(Date.now() - s.daysAgo * 86400000),
        images: {
          create: s.images.map((id, i) => ({ url: img(id), alt: `${s.title} — illustrative photograph ${i + 1}`, sortOrder: i })),
        },
      },
    });
  }
  console.log(`✓ ${SAMPLES.length} sample listings (flagged isSample)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
