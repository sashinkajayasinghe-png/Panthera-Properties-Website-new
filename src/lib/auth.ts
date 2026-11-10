import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./session";

/** Returns the signed-in admin, re-validated against the database. */
export async function getAdmin(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await prisma.adminUser.findUnique({ where: { id: session.sub }, select: { id: true } });
  return user ? session : null;
}

/** For admin pages: redirect to the login screen when not authenticated. */
export async function requireAdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** For admin API routes: returns a 401 Response when not authenticated. */
export async function requireAdminApi(): Promise<SessionPayload | Response> {
  const admin = await getAdmin();
  return admin ?? Response.json({ error: "Unauthorised" }, { status: 401 });
}
