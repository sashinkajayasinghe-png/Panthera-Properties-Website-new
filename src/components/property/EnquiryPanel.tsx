"use client";

import { useEffect, useState } from "react";
import { LeadForm } from "@/components/forms/LeadForm";

/** Enquiry / viewing-request tabs on a property page. `#viewing` in the URL opens the viewing tab. */
export function EnquiryPanel({ propertyId, propertyTitle, sold }: { propertyId: string; propertyTitle: string; sold: boolean }) {
  const [tab, setTab] = useState<"PROPERTY_INQUIRY" | "VIEWING_REQUEST">("PROPERTY_INQUIRY");

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === "#viewing" && !sold) setTab("VIEWING_REQUEST");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [sold]);

  return (
    <div id="enquire" className="scroll-mt-28">
      <div role="tablist" aria-label="Enquiry type" className="mb-8 flex gap-2">
        <button role="tab" type="button" aria-selected={tab === "PROPERTY_INQUIRY"} className="chip" aria-pressed={tab === "PROPERTY_INQUIRY"} onClick={() => setTab("PROPERTY_INQUIRY")}>
          Enquire
        </button>
        {!sold ? (
          <button role="tab" type="button" aria-selected={tab === "VIEWING_REQUEST"} className="chip" aria-pressed={tab === "VIEWING_REQUEST"} onClick={() => setTab("VIEWING_REQUEST")}>
            Schedule a viewing
          </button>
        ) : null}
      </div>
      <LeadForm
        key={tab}
        type={tab}
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        source="property-page"
        defaultMessage={tab === "PROPERTY_INQUIRY" ? `I'd like more information about ${propertyTitle}.` : undefined}
      />
    </div>
  );
}
