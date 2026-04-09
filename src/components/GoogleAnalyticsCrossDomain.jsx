import { useEffect } from 'react';
import {
  getGa4LinkerDomains,
  getGa4MeasurementId,
} from '../config/externalUrls';

export default function GoogleAnalyticsCrossDomain() {
  const measurementId = getGa4MeasurementId();

  useEffect(() => {
    if (!measurementId) return undefined;

    const existing = document.getElementById('ga4-gtag-js');
    if (existing) return undefined;

    const script = document.createElement('script');
    script.id = 'ga4-gtag-js';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    gtag('js', new Date());
    gtag('config', measurementId, {
      linker: { domains: getGa4LinkerDomains() },
    });

    return undefined;
  }, [measurementId]);

  return null;
}
