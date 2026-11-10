export const PRICE_STEPS = [10, 25, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 2000].map((m) => m * 1_000_000);

export const priceLabel = (v: number) => (v >= 1e9 ? `LKR ${v / 1e9}B` : `LKR ${v / 1e6}M`);
