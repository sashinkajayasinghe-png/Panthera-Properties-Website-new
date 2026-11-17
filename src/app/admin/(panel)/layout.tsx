import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminNav, LogoutButton } from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s — Panthera Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  const newLeads = await prisma.lead.count({ where: { status: "NEW" } });
  return (
    <div className="min-h-dvh bg-ink lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-charcoal lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-6 py-6 lg:block">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="relative block h-10 w-12">
              <Image src="/brand/logo-mark.png" alt="" fill sizes="48px" className="object-contain" />
            </span>
            <span>
              <span className="block font-serif text-lg tracking-[0.3em] text-gold-soft">PANTHERA</span>
              <span className="mt-1 block text-[0.5rem] tracking-[0.5em] text-mist">ADMIN</span>
            </span>
          </Link>
          <Link href="/" target="_blank" className="text-xs text-mist hover:text-ivory lg:mt-4 lg:inline-block">View site ↗</Link>
        </div>
        <AdminNav newLeads={newLeads} />
        <div className="hidden px-6 py-6 text-xs text-mist lg:absolute lg:bottom-0 lg:block">
          <p className="truncate">{admin.email}</p>
          <LogoutButton />
        </div>
      </aside>
      <div className="min-w-0 px-5 py-8 md:px-10 md:py-10">
        <div className="mb-6 flex justify-end lg:hidden"><LogoutButton /></div>
        {children}
      </div>
    </div>
  );
}
