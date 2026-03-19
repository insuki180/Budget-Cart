import { CartItem } from '../store/CartContext';
import { calculateItemTotal } from './pricing';

export const injectMockData = (addToCart: (item: CartItem) => void) => {
  const items = [
    {
      id: 'mock1_' + Date.now(),
      barcode: '111111',
      name: 'Aashirvaad Atta 5kg',
      mrp: 250,
      sellingPrice: 250,
      quantity: 1,
      offer: { type: 'none' as const }
    },
    {
      id: 'mock2_' + Date.now(),
      barcode: '222222',
      name: 'Maggi 4-Pack',
      mrp: 60,
      sellingPrice: 60,
      quantity: 1,
      offer: { type: 'flat' as const, value: 10 } // ₹10 Flat Off Per Unit
    },
    {
      id: 'mock3_' + Date.now(),
      barcode: '333333',
      name: 'Surf Excel 1kg',
      mrp: 200,
      sellingPrice: 200,
      quantity: 2,
      offer: { type: 'combo' as const, value: 2, comboPrice: 350 } // Buy 2 for ₹350
    }
  ];

  items.forEach(rawItem => {
    const calc = calculateItemTotal(rawItem.mrp, rawItem.sellingPrice, rawItem.quantity, rawItem.offer);
    
    addToCart({
      id: rawItem.id,
      barcode: rawItem.barcode,
      name: rawItem.name,
      mrp: rawItem.mrp,
      sellingPrice: rawItem.sellingPrice,
      quantity: rawItem.quantity,
      offer: rawItem.offer,
      finalTotal: calc.finalTotal,
      savings: calc.totalSavings
    });
  });
};
