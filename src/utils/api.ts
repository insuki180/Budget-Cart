/**
 * Waterfall API Strategy for Product Discovery (HOTFIX 1)
 */

export interface ExternalProduct {
  name: string;
  brand: string;
  source: string;
  found: boolean;
  barcode: string;
  image?: string;
}

const API_HEADERS = {
  'Accept': 'application/json',
  'User-Agent': 'BudgetCart/1.0',
};

export async function fetchProductByBarcode(barcode: string): Promise<ExternalProduct | null> {
  // 1. OpenFoodFacts (Primary for Food)
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
      headers: API_HEADERS
    });
    if (response.ok) {
      const offData = await response.json();
      if (offData.status === 1 && offData.product && offData.product.product_name) {
        const p = offData.product;
        return {
          name: p.product_name_en || p.product_name || 'Unknown Product',
          brand: p.brands || 'Unknown Brand',
          source: 'OpenFoodFacts',
          found: true,
          barcode,
          image: p.image_url || ''
        };
      }
    }
  } catch (e) {
    console.warn("OpenFoodFacts Fetch Error (Network/Header Reject):", e);
    // Explicitly continue to next fallback
  }

  // 2. UPCitemdb (Trial API for General Goods/Cosmetics)
  try {
    const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`, {
      headers: API_HEADERS
    });
    if (response.ok) {
      const upcData = await response.json();
      if (upcData.items && upcData.items.length > 0) {
        const item = upcData.items[0];
        return {
          name: item.title || 'Unknown Product',
          brand: item.brand || 'Unknown Brand',
          source: 'UPCitemdb',
          found: true,
          barcode,
          image: item.images && item.images.length > 0 ? item.images[0] : ''
        };
      }
    }
  } catch (e) {
    console.warn("UPCitemdb Fetch Error (Network/Header Reject):", e);
    // Explicitly continue to next fallback
  }

  // 3. Brocade.io (Fallback for Universal Items)
  try {
    const response = await fetch(`https://www.brocade.io/api/items/${barcode}`, {
      headers: API_HEADERS
    });
    if (response.ok) {
      const brocadeData = await response.json();
      if (brocadeData && brocadeData.name) {
        return {
          name: brocadeData.name,
          brand: brocadeData.brand || 'Unknown Brand',
          source: 'Brocade.io',
          found: true,
          barcode,
          image: ''
        };
      }
    }
  } catch (e) {
    console.warn("Brocade Fetch Error (Network/Header Reject):", e);
    // Explicitly return null for manual entry trigger
  }

  // If ALL APIs fail, return null to prompt manual entry
  return null;
}
