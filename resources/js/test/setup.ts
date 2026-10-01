import '@testing-library/jest-dom/vitest';

/**
 * jsdom implements neither of these, and both Framer Motion (used by the
 * storefront's Reveal components) and Radix UI (used by several admin/form
 * components) check for them - without a stub, rendering anything that uses
 * `whileInView` or Radix's media-query-aware primitives throws.
 */
class IntersectionObserverStub implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
}

global.IntersectionObserver = IntersectionObserverStub;

if (!window.matchMedia) {
    window.matchMedia = (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    });
}

class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}

global.ResizeObserver = ResizeObserverStub;
