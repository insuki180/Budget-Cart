/**
 * WhatsApp Text Parser Utility
 * Converts raw text into structured cart items.
 */

export interface ParsedItem {
  id: string;
  name: string;
  quantity: number;
  sellingPrice: number;
  isPending: boolean;
  barcode: string | null;
}

export const parseWhatsAppList = (rawText: string): ParsedItem[] => {
  if (!rawText) return [];

  // 1. Split by newline or comma
  const lines = rawText.split(/[\n,]+/).map(line => line.trim()).filter(line => line.length > 0);

  return lines.map(line => {
    let name = line;
    let quantity = 1;

    // 2. Regex to match common quantity patterns:
    // Pattern A: "2x Milk", "2 Milk", "2kg Milk" (at the start)
    const startPattern = /^(\d+)\s*[xX]?\s*(.+)$/;
    // Pattern B: "Milk 2x", "Milk - 2", "Milk x 2" (at the end)
    const endPattern = /^(.+)\s*[-:xX\s]\s*(\d+)\s*[xX]?$/;

    const startMatch = line.match(startPattern);
    const endMatch = line.match(endPattern);

    if (startMatch) {
      quantity = parseInt(startMatch[1], 10);
      name = startMatch[2].trim();
    } else if (endMatch) {
      name = endMatch[1].trim();
      quantity = parseInt(endMatch[2], 10);
    }

    return {
      id: Math.random().toString(36).substring(7),
      name: name,
      quantity: isNaN(quantity) ? 1 : quantity,
      sellingPrice: 0,
      isPending: true,
      barcode: null,
    };
  });
};
