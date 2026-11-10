import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import { getHomepageContent } from "@/lib/content";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Privacy & Cookies",
  description: "How Panthera Properties collects, uses and protects your personal information, and how this website uses browser storage.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const { email } = await getHomepageContent();
  const contact = email ? `${email} or ${BRAND.phoneDisplay}` : BRAND.phoneDisplay;
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy & cookies" intro="This notice explains what information we collect through this website and how we use it." />
      <section className="container-x pb-32">
        <div className="max-w-3xl space-y-12 text-base leading-[1.85] text-ivory/80 [&_h2]:mb-4 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:text-ivory">
          <div>
            <h2>Who we are</h2>
            <p>{BRAND.name} is a real estate brokerage based in Colombo, Sri Lanka. You can contact us about privacy at {contact}.</p>
          </div>
          <div>
            <h2>Information we collect</h2>
            <p>
              When you submit an enquiry, viewing request, seller enquiry, consultation request or property brief, we collect the details you
              provide — typically your name, email address, phone number, message, preferred viewing dates and information about a property you
              wish to sell. To protect against spam we also store a one-way, non-reversible hash of your IP address.
            </p>
          </div>
          <div>
            <h2>How we use it</h2>
            <p>
              We use your information only to respond to your request, arrange viewings, advise you about properties that match your
              requirements and manage the sale or purchase process. We do not sell your information. We share it only with parties you ask us
              to involve, or where required by law.
            </p>
          </div>
          <div>
            <h2>Property assistant</h2>
            <p>
              If the optional property assistant is enabled, the text you type may be sent to our AI provider solely to convert it into search
              filters. Search results always come from our own listings database. Please do not enter sensitive personal information into the
              assistant.
            </p>
          </div>
          <div>
            <h2>Retention and your rights</h2>
            <p>
              We keep enquiry records for as long as needed to serve you and meet legal obligations. You may ask us to access, correct or delete
              your information at any time using the contact details above.
            </p>
          </div>
          <div id="cookies" className="scroll-mt-28">
            <h2>Cookies and browser storage</h2>
            <p>
              This website does not use advertising or analytics cookies. We use essential browser storage only: to remember whether you have
              seen the introduction and cookie notice, and — for administrators only — a secure, HTTP-only session cookie
              to keep you signed in. Maps are provided by OpenStreetMap and CARTO, whose servers receive standard technical requests when a map
              is displayed. Embedded videos or virtual tours, where present, are served by their providers.
            </p>
          </div>
          <div>
            <h2>Listings and photography</h2>
            <p>
              Property information is provided in good faith and should be verified during due diligence. Listings labelled “Sample listing” are
              fictional test entries with illustrative imagery and are not available for sale.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
