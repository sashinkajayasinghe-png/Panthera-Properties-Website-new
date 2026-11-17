"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { LeadType } from "@prisma/client";
import { PROPERTY_TYPE_LABEL, PROPERTY_TYPES } from "@/lib/constants";
import { whatsappLink } from "@/lib/whatsapp";

type Props = {
  type: LeadType;
  allowTypeChoice?: boolean;
  propertyId?: string;
  propertyTitle?: string;
  source: string;
  defaultMessage?: string;
  details?: Record<string, string | number | boolean | null>;
  sellerFields?: boolean;
  submitLabel?: string;
  hoods?: { slug: string; name: string }[];
  onSuccess?: () => void;
};

const TYPE_CHOICES: { value: LeadType; label: string }[] = [
  { value: "CONSULTATION", label: "Private consultation" },
  { value: "VIEWING_REQUEST", label: "Schedule a viewing" },
  { value: "SELL_PROPERTY", label: "Sell your property" },
];

const BUDGET_RANGES = [
  "LKR 50 million – LKR 100 million",
  "LKR 100 million – LKR 250 million",
  "LKR 250 million – LKR 500 million",
  "LKR 500 million – LKR 1 billion",
];

type Status ={ kind: "idle" } | { kind: "sending" } | { kind: "ok" } | { kind: "error"; message: string };

export function LeadForm(props: Props) {
  const uid = useId();
  const [type, setType] = useState<LeadType>(props.type);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const startedAt = useRef(0);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  useEffect(() => setType(props.type), [props.type]);

  const seller = props.sellerFields || type === "SELL_PROPERTY";
  const viewing = type === "VIEWING_REQUEST";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const str = (k: string) => (fd.get(k) as string | null)?.trim() || undefined;
    const details: Record<string, string | number | boolean | null> = { ...(props.details ?? {}) };
    if (seller) {
      for (const k of ["propertyType", "location", "address", "bedrooms", "landExtent", "floorArea", "expectedPrice", "timeline"]) {
        const v = str(`seller_${k}`);
        if (v) details[k] = v;
      }
    }
    if (type === "CONSULTATION") {
      const budget = str("budget");
      if (budget) details.budget = budget;
    }
    const payload = {
      type,
      name: str("name") ?? "",
      email: str("email") ?? "",
      phone: str("phone"),
      message: str("message"),
      propertyId: props.propertyId,
      preferredDate: viewing ? str("preferredDate") : undefined,
      preferredTime: viewing ? str("preferredTime") : undefined,
      details: Object.keys(details).length ? details : undefined,
      source: props.source,
      consent: fd.get("consent") === "on",
      website: (fd.get("website") as string) ?? "",
      startedAt: startedAt.current,
    };
    setStatus({ kind: "sending" });
    setErrors({});
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(json.fields ?? {});
        setStatus({ kind: "error", message: json.error ?? "We could not submit your request. Please try again." });
        return;
      }
      setStatus({ kind: "ok" });
      props.onSuccess?.();
    } catch {
      setStatus({ kind: "error", message: "Network error — your request was not submitted. Please try again or contact us on WhatsApp." });
    }
  }

  if (status.kind === "ok") {
    return (
      <div role="status" className="border border-gold/40 p-8">
        <p className="eyebrow mb-4 text-gold">Received</p>
        <p className="display text-4xl">Thank you.</p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
          Your {viewing ? "viewing request" : type === "SELL_PROPERTY" ? "property details" : "enquiry"} has been saved and our team will contact you
          personally. {viewing ? "Your viewing is not confirmed until we contact you to agree a time." : ""}
        </p>
        <a
          href={whatsappLink(`Hello Panthera Properties, I've just submitted an enquiry${props.propertyTitle ? ` about "${props.propertyTitle}"` : ""}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-gold mt-8"
        >
          Continue on WhatsApp
        </a>
      </div>
    );
  }

  const field = (name: string) => ({
    id: `${uid}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${uid}-${name}-err` : undefined,
  });
  const Err = ({ name }: { name: string }) =>
    errors[name] ? (
      <p id={`${uid}-${name}-err`} className="mt-2 text-xs text-[#e09485]">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
      {props.allowTypeChoice ? (
        <fieldset className="sm:col-span-2">
          <legend className="label mb-3">How can we help?</legend>
          <div className="flex flex-wrap gap-2">
            {TYPE_CHOICES.map((c) => (
              <button key={c.value} type="button" className="chip" aria-pressed={type === c.value} onClick={() => setType(c.value)}>
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {props.propertyTitle ? (
        <p className="text-sm text-mist sm:col-span-2">
          Regarding: <span className="text-ivory">{props.propertyTitle}</span>
        </p>
      ) : null}

      <div>
        <label className="label" htmlFor={`${uid}-name`}>Full name *</label>
        <input className="field" autoComplete="name" required maxLength={120} {...field("name")} />
        <Err name="name" />
      </div>
      <div>
        <label className="label" htmlFor={`${uid}-email`}>Email *</label>
        <input className="field" type="email" autoComplete="email" required maxLength={200} {...field("email")} />
        <Err name="email" />
      </div>
      <div>
        <label className="label" htmlFor={`${uid}-phone`}>Phone / WhatsApp</label>
        <input className="field" type="tel" autoComplete="tel" placeholder="+94" maxLength={40} {...field("phone")} />
        <Err name="phone" />
      </div>

      {viewing ? (
        <>
          <div>
            <label className="label" htmlFor={`${uid}-preferredDate`}>Preferred date *</label>
            <input className="field" type="date" min={today} required {...field("preferredDate")} />
            <Err name="preferredDate" />
          </div>
          <div>
            <label className="label" htmlFor={`${uid}-preferredTime`}>Preferred time</label>
            <select className="field" {...field("preferredTime")} defaultValue="">
              <option value="">Any time</option>
              <option>Morning (9am – 12pm)</option>
              <option>Afternoon (12pm – 4pm)</option>
              <option>Evening (4pm – 7pm)</option>
            </select>
          </div>
        </>
      ) : type === "CONSULTATION" ? (
        <div>
          <label className="label" htmlFor={`${uid}-budget`}>Budget (optional)</label>
          <select className="field" name="budget" id={`${uid}-budget`} defaultValue="">
            <option value="">Select a budget…</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="hidden sm:block" />
      )}

      {seller ? (
        <>
          <div>
            <label className="label" htmlFor={`${uid}-seller_propertyType`}>Property type</label>
            <select className="field" id={`${uid}-seller_propertyType`} name="seller_propertyType" defaultValue="">
              <option value="">Select…</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={PROPERTY_TYPE_LABEL[t]}>{PROPERTY_TYPE_LABEL[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor={`${uid}-seller_location`}>Location</label>
            {props.hoods?.length ? (
              <select className="field" id={`${uid}-seller_location`} name="seller_location" defaultValue="">
                <option value="">Select…</option>
                {props.hoods.map((h) => (
                  <option key={h.slug} value={h.name}>{h.name}</option>
                ))}
                <option value="Other">Elsewhere in Sri Lanka</option>
              </select>
            ) : (
              <input className="field" id={`${uid}-seller_location`} name="seller_location" maxLength={120} />
            )}
          </div>
          <div>
            <label className="label" htmlFor={`${uid}-seller_bedrooms`}>Bedrooms</label>
            <input className="field" id={`${uid}-seller_bedrooms`} name="seller_bedrooms" inputMode="numeric" maxLength={3} />
          </div>
          <div>
            <label className="label" htmlFor={`${uid}-seller_floorArea`}>Floor area (sq ft)</label>
            <input className="field" id={`${uid}-seller_floorArea`} name="seller_floorArea" inputMode="numeric" maxLength={10} />
          </div>
          <div>
            <label className="label" htmlFor={`${uid}-seller_landExtent`}>Land extent (perches)</label>
            <input className="field" id={`${uid}-seller_landExtent`} name="seller_landExtent" inputMode="decimal" maxLength={10} />
          </div>
          <div>
            <label className="label" htmlFor={`${uid}-seller_expectedPrice`}>Expected price (LKR)</label>
            <input className="field" id={`${uid}-seller_expectedPrice`} name="seller_expectedPrice" maxLength={60} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor={`${uid}-seller_timeline`}>Timeline</label>
            <select className="field" id={`${uid}-seller_timeline`} name="seller_timeline" defaultValue="">
              <option value="">Select…</option>
              <option>As soon as possible</option>
              <option>Within 3 months</option>
              <option>Within 6–12 months</option>
              <option>Exploring options</option>
            </select>
          </div>
        </>
      ) : null}

      <div className="sm:col-span-2">
        <label className="label" htmlFor={`${uid}-message`}>{seller ? "About the property" : "Message"}</label>
        <textarea className="field min-h-28 resize-y" maxLength={4000} defaultValue={props.defaultMessage} {...field("message")} />
        <Err name="message" />
      </div>

      {/* Honeypot — hidden from people, tempting to bots */}
      <div aria-hidden className="absolute left-[-10000px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input id={`${uid}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm text-mist">
          <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-[#c5a46d]" aria-invalid={errors.consent ? true : undefined} />
          <span>
            I agree to Panthera Properties storing these details to respond to my enquiry, as described in the{" "}
            <a href="/privacy" className="text-ivory underline underline-offset-4">privacy policy</a>.
          </span>
        </label>
        <Err name="consent" />
      </div>

      <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
        <button type="submit" className="btn btn-solid" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending…" : props.submitLabel ?? (viewing ? "Request viewing" : seller ? "Send property details" : "Send enquiry")}
        </button>
        {status.kind === "error" ? (
          <p role="alert" className="text-sm text-[#e09485]">{status.message}</p>
        ) : null}
      </div>
    </form>
  );
}
