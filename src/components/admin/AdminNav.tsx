"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/viewings", label: "Viewing requests" },
  { href: "/admin/content", label: "Homepage & brand" },
];

export function AdminNav({ newLeads }: { newLeads: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors ${
              active ? "bg-ink text-ivory" : "text-mist hover:text-ivory"
            }`}
          >
            {l.label}
            {l.href === "/admin/leads" && newLeads > 0 ? (
              <span className="rounded-full bg-gold px-2 py-0.5 text-[0.65rem] font-semibold text-ink">{newLeads}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="mt-2 text-xs uppercase tracking-[0.2em] text-mist hover:text-ivory"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
