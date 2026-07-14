import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollRestoration(ready = true) {
  const location = useLocation();
  const key = `scroll_${location.pathname}`;
  const restoredKey = useRef(null);

  useEffect(() => {
    if (!ready || restoredKey.current === key) return;

    const saved = sessionStorage.getItem(key);
    if (saved) {
      const pos = parseInt(saved, 10);
      requestAnimationFrame(() => {
        window.scrollTo(0, pos);
      });
    }
    restoredKey.current = key;
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
