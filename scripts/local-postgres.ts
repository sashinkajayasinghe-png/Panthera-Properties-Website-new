/**
 * Starts a real local PostgreSQL server for development on machines without
 * a Postgres install, using the binaries shipped by `embedded-postgres`.
 *
 *   npm run db:local
 *
 * Then use DATABASE_URL="postgresql://postgres:panthera@localhost:5433/panthera"
 * (Prisma creates the `panthera` database on `npm run db:push`).
 * On Replit or in production, use the managed PostgreSQL DATABASE_URL instead.
 *
 * Binaries and data live in ~/.panthera-pg (override with PG_LOCAL_DIR) because
 * Postgres on Windows cannot open files under very long paths.
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PORT = process.env.PG_LOCAL_PORT ?? "5433";
const base = process.env.PG_LOCAL_DIR ?? path.join(os.homedir(), ".panthera-pg");
const nativeDir = path.join(base, "native");
const dataDir = path.join(base, "data");
const exe = (name: string) =>
  path.join(nativeDir, "bin", process.platform === "win32" ? `${name}.exe` : name);

function ensureBinaries() {
  if (fs.existsSync(exe("postgres"))) return;
  const platform = process.platform === "win32" ? "windows" : process.platform;
  const pkg = `@embedded-postgres/${platform}-${process.arch}`;
  const src = path.join(process.cwd(), "node_modules", pkg, "native");
  console.log(`Copying PostgreSQL binaries to ${nativeDir} ...`);
  fs.mkdirSync(base, { recursive: true });
  fs.cpSync(src, nativeDir, { recursive: true, dereference: true });
}

function ensureCluster() {
  if (fs.existsSync(path.join(dataDir, "PG_VERSION"))) return;
  const pwfile = path.join(base, "pwfile");
  fs.writeFileSync(pwfile, "panthera\n");
  const r = spawnSync(
    exe("initdb"),
    ["-D", dataDir, "-U", "postgres", `--pwfile=${pwfile}`, "-E", "UTF8", "--no-locale", "-A", "scram-sha-256"],
    { stdio: "inherit" },
  );
  fs.rmSync(pwfile, { force: true });
  if (r.status !== 0) throw new Error("initdb failed");
}

ensureBinaries();
ensureCluster();

const server = spawn(exe("postgres"), ["-D", dataDir, "-p", PORT, "-c", "listen_addresses=localhost"], {
  stdio: "inherit",
});
console.log(`PostgreSQL starting at postgresql://postgres:panthera@localhost:${PORT}/panthera`);
const stop = () => server.kill("SIGINT");
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
server.on("exit", (code) => process.exit(code ?? 0));
