export const pricingTiers = [
  { tier: 0, min: 0, max: 5000, price: 399, priceId: "price_test_0" },
  { tier: 1, min: 5000, max: 10000, price: 500, priceId: "price_test_1" },
  { tier: 2, min: 10000, max: 20000, price: 750, priceId: "price_test_2" },
  { tier: 3, min: 20000, max: 35000, price: 1000, priceId: "price_test_3" },
  { tier: 4, min: 35000, max: 50000, price: 1250, priceId: "price_test_4" },
  { tier: 5, min: 50000, max: 100000, price: 1500, priceId: "price_test_5" },
  { tier: 6, min: 100000, max: 200000, price: 2000, priceId: "price_test_6" },
  { tier: 7, min: 200000, max: Infinity, price: 2500, priceId: "price_test_7" },
];

export const tierFor = (credit: number) => 
  pricingTiers.find(t => credit >= t.min && credit < t.max)!;

// Legacy function name for compatibility
export const assignPricingTier = tierFor;