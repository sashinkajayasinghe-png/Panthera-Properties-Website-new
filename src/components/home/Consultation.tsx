import { BRAND } from "@/lib/constants";
import { whatsappLink } from "@/lib/whatsapp";
import { ParallaxImage } from "@/components/motion/Parallax";
import { FadeUp, RevealLines } from "@/components/motion/Reveal";
import { LeadForm } from "@/components/forms/LeadForm";

/** One unified consultation section: general consultation, viewing requests and seller enquiries share a single form. */
export function Consultation({
  headline,
  body,
  image,
  hoods,
}: {
  headline: string;
  body: string;
  image: string;
  hoods: { slug: string; name: string }[];
}) {
  return (
    <section id="consultation" className="relative isolate scroll-mt-20 overflow-hidden" aria-label="Private consultation">
      <ParallaxImage src={image} alt="" className="!absolute inset-0 -z-10" strength={10} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/75 via-ink/65 to-ink" />
      <div className="container-x grid gap-14 py-28 md:py-36 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <FadeUp className="mb-8 flex items-center gap-4">
            <span className="eyebrow text-gold">06</span>
            <span className="h-px w-16 bg-line" />
            <span className="eyebrow">Private consultation</span>
          </FadeUp>
          <RevealLines text={headline.toUpperCase()} className="display text-[clamp(2.8rem,6.4vw,7rem)]" />
          <FadeUp className="mt-8 max-w-md text-base text-ivory/80 md:text-lg">{body}</FadeUp>
          <FadeUp className="mt-10 flex flex-col items-start gap-4">
            <a
              href={whatsappLink("Hello Panthera Properties, I'd like to arrange a private consultation.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
            >
              WhatsApp {BRAND.phoneDisplay}
            </a>
            <a href={`tel:${BRAND.phoneE164}`} className="link-underline text-sm text-mist hover:text-ivory">
              Or call us directly
            </a>
          </FadeUp>
        </div>

        <FadeUp className="border border-line bg-ink/80 p-6 backdrop-blur-md md:p-10 lg:col-span-6 lg:col-start-7">
          <p className="eyebrow mb-3 text-gold">Request a consultation</p>
          <p className="mb-8 text-sm leading-relaxed text-mist">
            Choose how we can help — a private consultation, a viewing, or selling your property — and we will respond personally.
          </p>
          <LeadForm type="CONSULTATION" allowTypeChoice source="homepage-consultation" hoods={hoods} />
        </FadeUp>
      </div>
    </section>
  );
}
