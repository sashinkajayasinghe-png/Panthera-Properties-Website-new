"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-charcoal" />,
});

export function PropertyMap(props: { lat: number; lng: number; label: string; approximate?: boolean }) {
  return (
    <div className="relative h-[420px] w-full overflow-hidden border border-line md:h-[520px]">
      <LeafletMap {...props} />
      {props.approximate ? (
        <p className="pointer-events-none absolute left-3 top-3 z-[400] bg-ink/80 px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.18em] text-mist">
          Approximate location
        </p>
      ) : null}
    </div>
  );
}
