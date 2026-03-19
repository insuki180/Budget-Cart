// src/utils/pricingEngine.ts
// Handles the core deterministic pricing logic: Flat, Percentage, Buy X Get Y, Combo

export const calculateSavings = (mrp: number, sellingPrice: number, quantity: number) => {
  return (mrp - sellingPrice) * quantity;
};
