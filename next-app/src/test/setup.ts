import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Provide a standard window.scrollTo and matchMedia mock for JSDOM
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

if (typeof Element !== 'undefined' && !Element.prototype.scrollBy) {
  Element.prototype.scrollBy = vi.fn();
}
