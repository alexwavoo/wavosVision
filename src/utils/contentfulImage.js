export function contentfulUrl(baseUrl, { width, format = 'webp', quality = 80 } = {}) {
  if (!baseUrl) return '';
  const params = new URLSearchParams();
  if (width) params.set('w', String(width));
  if (format) params.set('fm', format);
  if (quality) params.set('q', String(quality));
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

export function isMobile() {
  return window.innerWidth <= 768;
}

export function thumbnailUrl(baseUrl) {
  return contentfulUrl(baseUrl, { width: isMobile() ? 600 : 800 });
}

export function gridUrl(baseUrl) {
  return contentfulUrl(baseUrl, { width: 565 });
}

export function modalUrl(baseUrl) {
  return contentfulUrl(baseUrl, { width: isMobile() ? 1400 : 2560 });
}
