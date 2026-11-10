"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/lib/constants";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { href: "/properties", label: "Properties", className: "" },
  { href: "/neighborhoods", label: "Neighbourhoods", className: "hidden md:inline" },
  { href: "/about", label: "About", className: "hidden lg:inline" },
  { href: "/contact", label: "Consultation", className: "" },
];

export function Header({ logoUrl }: { logoUrl?: string }) {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHidden(y > 160 && y > lastY.current + 2);
      if (y < lastY.current - 2) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[90] -translate-y-24 bg-ivory px-4 py-2 text-xs uppercase tracking-widest text-ink focus:translate-y-0"
      >
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-[60] transition-[transform,background-color,backdrop-filter] duration-700 ease-[var(--ease-cine)] ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${solid ? "bg-ink/75 backdrop-blur-md" : "bg-transparent"}`}
      >
        <div className="container-x flex h-20 items-center justify-between gap-4 md:h-24">
          <Link href="/" className="relative z-10 shrink-0" aria-label={`${BRAND.name} — home`}>
            <Wordmark logoUrl={logoUrl} />
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-5 md:gap-10">
            {LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`link-underline text-[0.65rem] uppercase tracking-[0.24em] md:text-[0.7rem] md:tracking-[0.28em] ${
                    active ? "text-gold" : ""
                  } ${l.className}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}
