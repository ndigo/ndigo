// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { featureForPath } from '../src/shell-composition';

const indexHtml = readFileSync(join(import.meta.dirname, '..', 'index.html'), 'utf8');

describe('host shell navigation', () => {
    it('maps route paths to the feature each one activates', () => {
        expect(featureForPath('/')).toBeNull();
        expect(featureForPath('/catalog')).toBe('catalog');
        expect(featureForPath('/catalog/42')).toBe('catalog');
        expect(featureForPath('/checkout')).toBe('checkout');
        expect(featureForPath('/reports')).toBe('reports');
        expect(featureForPath('/nothing-here')).toBeNull();
    });

    it('nav anchors are real hash links that resolve to the documented features', () => {
        const document = new DOMParser().parseFromString(indexHtml, 'text/html');
        const anchors = [...document.querySelectorAll('nav a')];
        const hrefs = anchors.map((anchor) => anchor.getAttribute('href'));

        expect(hrefs).toEqual(['#/', '#/catalog', '#/checkout', '#/reports']);
        expect(hrefs.map((href) => featureForPath((href ?? '').slice(1)))).toEqual([
            null,
            'catalog',
            'checkout',
            'reports',
        ]);
    });
});
