import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieNotice, Cursor, IntroLoader, WhatsAppFab } from "@/components/layout/Chrome";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import { JsonLd, organizationJsonLd } from "@/lib/seo";
import { getHomepageContent } from "@/lib/content";

// Listings, prices and statuses change from the admin dashboard — always render fresh data.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getHomepageContent();
  return (
    <>
      <JsonLd data={organizationJsonLd(content)} />
      <SmoothScroll />
      <IntroLoader />
      <Header logoUrl={content.logoUrl || undefined} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer email={content.email} address={content.address} />
      <WhatsAppFab />
      <AssistantWidget />
      <CookieNotice />
      <Cursor />
    </>
  );
}
