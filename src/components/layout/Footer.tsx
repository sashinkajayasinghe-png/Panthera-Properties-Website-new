import Image from "next/image";
import Link from "next/link";
import { BRAND, CATEGORIES } from "@/lib/constants";
import { whatsappLink } from "@/lib/whatsapp";
import { LOGO_FULL } from "./Wordmark";

export function Footer({ email, address }: { email?: string; address?: string }) {
  return (
    <footer className="relative border-t border-line bg-ink pt-24 md:pt-32">
      <div className="container-x">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-6">
            <Link href="/" className="relative mb-10 block h-28 w-32" aria-label={`${BRAND.name} — home`}>
              <Image src={LOGO_FULL} alt="Panthera Properties" fill sizes="128px" className="object-contain object-left" />
            </Link>
            <p className="display max-w-xl text-[clamp(2.4rem,5vw,4.5rem)]">
              Exceptional spaces, <em className="text-gold">thoughtfully</em> found.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/contact" className="btn">Private consultation</Link>
              <a href={whatsappLink("Hello Panthera Properties, I'd like to speak with an advisor.")} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
                WhatsApp
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm md:col-span-5 md:col-start-8">
            <div>
              <p className="eyebrow mb-5">Collections</p>
              <ul className="space-y-3 text-mist">
                {CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <Link className="link-underline hover:text-ivory" href={`/collections/${c.slug}`}>{c.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-5">Contact</p>
              <ul className="space-y-3 text-mist">
                <li><a className="link-underline hover:text-ivory" href={`tel:${BRAND.phoneE164}`}>{BRAND.phoneDisplay}</a></li>
                {email ? <li><a className="link-underline hover:text-ivory" href={`mailto:${email}`}>{email}</a></li> : null}
                <li>{address || "Colombo, Sri Lanka"}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-24 flex flex-col gap-4 border-t border-line py-8 text-xs text-mist md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.name}. Colombo, Sri Lanka.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="link-underline hover:text-ivory">Privacy</Link>
            <Link href="/privacy#cookies" className="link-underline hover:text-ivory">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
