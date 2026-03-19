// src/utils/pricing.ts

export type OfferType = 'flat' | 'percent' | 'bogo' | 'combo' | 'none';

export interface Offer {
  type: OfferType;
  value?: number;       // flat amt, percent %, bogo buy qty (X), combo buy qty (X)
  freeQty?: number;     // bogo free qty (Y)
  comboPrice?: number;  // combo special price (Y)
}

/**
 * calculateItemTotal - A robust, pure deterministic function to calculate final price and savings.
 * 
 * @param {number} mrp - Maximum Retail Price per unit (baseline for savings calculation)
 * @param {number} price - Actual selling price per unit before offers
 * @param {number} qty - Total quantity of the item purchased
 * @param {Offer} offer - The exact offer object applied to this item
 * @returns {object} { finalTotal: number, totalSavings: number }
 */
export const calculateItemTotal = (
  mrp: number,
  price: number,
  qty: number,
  offer: Offer = { type: 'none' }
): { finalTotal: number; totalSavings: number } => {
  let finalTotal = price * qty;
  
  // Guard clause for 0 or negative quantities
  if (qty <= 0) return { finalTotal: 0, totalSavings: 0 };

  switch (offer.type) {
    case 'flat':
      // Deduct the flat amount per unit
      const flatDeduction = offer.value || 0;
      finalTotal = Math.max(0, (price - flatDeduction) * qty);
      break;

    case 'percent':
      // Deduct the percentage off the total price
      const percentOff = offer.value || 0;
      finalTotal = finalTotal * (1 - percentOff / 100);
      break;

    case 'bogo':
      // Buy X Get Y Free.
      // Example: Buy 2 Get 1 Free. value = 2, freeQty = 1.
      const buyRequirement = offer.value || 1;
      const freeAmount = offer.freeQty || 1;
      const setSize = buyRequirement + freeAmount;
      
      // Calculate how many full sets (X + Y) are found in the total quantity.
      // E.g., qty = 4, setSize = 3 (Buy 2 Get 1). Sets = 1.
      const numberOfSets = Math.floor(qty / setSize);
      
      // Total free items the user gets
      const totalFreeItems = numberOfSets * freeAmount;
      
      // Items user needs to actually pay for
      const payableItems = qty - totalFreeItems;
      finalTotal = payableItems * price;
      break;

    case 'combo':
      // Buy X for ₹Y
      // Example: Buy 3 for ₹120. value = 3, comboPrice = 120.
      const comboQty = offer.value || 1;
      const comboPrice = offer.comboPrice || price;
      
      // How many times does the combo apply?
      const numCombos = Math.floor(qty / comboQty);
      
      // What remaining quantity does not fall into the combo bucket?
      const remainingQty = qty % comboQty;
      
      // Total equals cost of all applied combos plus cost of remainder items at standard price
      finalTotal = (numCombos * comboPrice) + (remainingQty * price);
      break;

    case 'none':
    default:
      // No standard deductions apply to the 'price'
      break;
  }

  // Ensure totalSavings reflects total MRP value minus what the user actually pays.
  const totalSavings = Math.max(0, (mrp * qty) - finalTotal);

  return {
    finalTotal: Number(finalTotal.toFixed(2)),
    totalSavings: Number(totalSavings.toFixed(2))
  };
};

/**
 * Local Test Function to verify logic.
 */
export const __runLocalPricingTests = () => {
  console.log("Running Pricing Tests...");
  const mrp = 100;
  const price = 90;

  // 1. None Test
  let res = calculateItemTotal(mrp, price, 4, { type: 'none' });
  console.assert(res.finalTotal === 360, "None Test Failed: finalTotal");
  console.assert(res.totalSavings === 40, "None Test Failed: savings");

  // 2. Flat Test (₹30 off per unit)
  res = calculateItemTotal(mrp, price, 4, { type: 'flat', value: 30 });
  console.assert(res.finalTotal === 240, "Flat Test Failed: finalTotal");
  console.assert(res.totalSavings === 160, "Flat Test Failed: savings");

  // 3. Percent Test (10% off)
  res = calculateItemTotal(mrp, price, 4, { type: 'percent', value: 10 });
  console.assert(res.finalTotal === 324, "Percent Test Failed: finalTotal"); // 360 - 10% = 324
  console.assert(res.totalSavings === 76, "Percent Test Failed: savings"); // 400 - 324 = 76

  // 4. BOGO Test (Buy 2 Get 1 Free, qty = 4)
  // 1 set of 3 gets 1 free. User pays for 3.
  res = calculateItemTotal(mrp, price, 4, { type: 'bogo', value: 2, freeQty: 1 });
  console.assert(res.finalTotal === 270, "BOGO Test Failed: finalTotal"); // pays for 3 items at 90 = 270
  console.assert(res.totalSavings === 130, "BOGO Test Failed: savings"); // 400 - 270 = 130

  // 5. Combo Test (Buy 3 for 250, qty = 4)
  res = calculateItemTotal(mrp, price, 4, { type: 'combo', value: 3, comboPrice: 250 });
  console.assert(res.finalTotal === 340, "Combo Test Failed: finalTotal"); // 250 + 90 = 340
  console.assert(res.totalSavings === 60, "Combo Test Failed: savings"); // 400 - 340 = 60
  
  console.log("All pricing tests passed successfully.");
};
