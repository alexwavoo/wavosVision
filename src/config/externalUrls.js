const DEFAULT_SITE = 'https://wavos.vision';
const DEFAULT_STORE = 'https://store.wavos.vision';

export function getSiteUrl() {
  const raw = import.meta.env.REACT_APP_SITE_URL;
  return (typeof raw === 'string' && raw.trim()) || DEFAULT_SITE;
}

export function getStoreUrl() {
  const raw = import.meta.env.REACT_APP_STORE_URL;
  return (typeof raw === 'string' && raw.trim()) || DEFAULT_STORE;
}

export function getGa4MeasurementId() {
  const raw = import.meta.env.REACT_APP_GA4_MEASUREMENT_ID;
  return (typeof raw === 'string' && raw.trim()) || '';
}

export function getGa4LinkerDomains() {
  try {
    const site = new URL(getSiteUrl()).hostname;
    const store = new URL(getStoreUrl()).hostname;
    return [...new Set([site, store])];
  } catch {
    return ['wavos.vision', 'store.wavos.vision'];
  }
}

/**
 * Optional deep links to the Shopify store (full URLs), keyed by Contentful project entry id
 * (same value as the :projectId route param). Add entries as you connect work to products.
 */
export const PROJECT_STORE_LINKS = {};
