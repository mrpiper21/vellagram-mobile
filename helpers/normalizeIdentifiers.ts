import { parsePhoneNumber } from "libphonenumber-js";

export function normalizeIdentifiers(input: string | string[]): string[] {
  if (!input) return [];
  
  const items = Array.isArray(input) ? input : [input];
  const normalized: string[] = [];

  for (const item of items) {
    if (!item) continue;
    
    const str = String(item).trim();
    if (!str) continue;

    try {
      // Try parsing as phone number
      const parsed = parsePhoneNumber(str, 'GH'); // GH for Ghana
      if (parsed?.isValid()) {
        // Return in 3 formats for maximum matching
        normalized.push(
          parsed.number, 
          parsed.nationalNumber.replace(/\D/g, ''),
          parsed.nationalNumber 
        );
        continue;
      }
    } catch {}
    
    // Fallback for invalid numbers
    const clean = str.replace(/\D/g, '');
    if (clean.length >= 6) {
      normalized.push(clean);
    }
  }

  return [...new Set(normalized)]
}