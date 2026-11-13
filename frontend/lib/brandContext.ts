export interface ActiveBrand {
  id: number;
  name: string;
  code: string;
}

const BRAND_STORAGE_KEY = 'brandguard_active_brand';

export function getActiveBrand(): ActiveBrand | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BRAND_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setActiveBrand(brand: ActiveBrand): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brand));
    // Trigger storage event so other components update immediately
    window.dispatchEvent(new Event('brandchange'));
  } catch {}
}

export function clearActiveBrand(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(BRAND_STORAGE_KEY);
    window.dispatchEvent(new Event('brandchange'));
  } catch {}
}
