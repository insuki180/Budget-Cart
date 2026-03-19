/**
 * Open Food Facts API Wrapper
 * Endpoint: https://world.openfoodfacts.org/api/v2/product/[barcode].json
 */

export interface ExternalProduct {
  name: string;
  brand: string;
  image: string;
  found: boolean;
  barcode: string;
}

export async function fetchProductByBarcode(barcode: string): Promise<ExternalProduct> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      return {
        name: p.product_name_en || p.product_name || 'Unknown Product',
        brand: p.brands || 'Unknown Brand',
        image: p.image_url || '',
        found: true,
        barcode
      };
    }

    return {
      name: '',
      brand: '',
      image: '',
      found: false,
      barcode
    };
  } catch (error) {
    console.error("API Fetch Error:", error);
    return {
      name: '',
      brand: '',
      image: '',
      found: false,
      barcode
    };
  }
}
