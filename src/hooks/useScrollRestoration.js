import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollRestoration(ready = true) {
  const location = useLocation();
  const key = `scroll_${location.pathname}`;
  const restored = useRef(false);

  useEffect(() => {
    if (!ready || restored.current) return;

    const saved = sessionStorage.getItem(key);
    if (saved) {
      const pos = parseInt(saved, 10);
      requestAnimationFrame(() => {
        window.scrollTo(0, pos);
      });
    }
    restored.current = true;
  }, [ready, key]);

  useEffect(() => {
    const save = () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };

    window.addEventListener('scroll', save, { passive: true });
    return () => {
      save();
      window.removeEventListener('scroll', save);
    };
  }, [key]);
}
