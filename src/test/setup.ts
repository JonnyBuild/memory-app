import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

beforeEach(() => {
  window.localStorage.clear();
  window.scrollTo = vi.fn();
});
