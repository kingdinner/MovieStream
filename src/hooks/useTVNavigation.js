import { useEffect } from 'react';

export default function useTVNavigation() {
  useEffect(() => {
    const handler = (e) => {
      const active = document.activeElement;

      if (!active) return;

      switch (e.key) {
        case 'ArrowRight':
          active.nextElementSibling?.focus();
          break;
        case 'ArrowLeft':
          active.previousElementSibling?.focus();
          break;
        case 'ArrowDown':
          active.parentElement?.nextElementSibling
            ?.querySelector('[tabindex]')?.focus();
          break;
        case 'ArrowUp':
          active.parentElement?.previousElementSibling
            ?.querySelector('[tabindex]')?.focus();
          break;
        case 'Enter':
          active.click();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
