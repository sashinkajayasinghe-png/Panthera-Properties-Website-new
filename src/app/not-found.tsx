import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink px-6 text-center">
      <p className="eyebrow mb-6 text-gold">404</p>
      <h1 className="display text-[clamp(3rem,9vw,8rem)]">Page not found</h1>
      <p className="mt-6 max-w-md text-mist">The page you are looking for may have moved, or the property is no longer listed.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn">Home</Link>
        <Link href="/properties" className="btn btn-gold">Browse properties</Link>
      </div>
    </div>
  );
}
