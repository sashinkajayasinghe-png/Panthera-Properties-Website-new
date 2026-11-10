"use client";

import { AssistantPanel } from "./AssistantPanel";

export function AssistantInline() {
  return (
    <div>
      <p className="eyebrow mb-2 text-gold">✦ Describe it in your own words</p>
      <AssistantPanel />
    </div>
  );
}
