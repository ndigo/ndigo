import { describe, expect, it } from 'vitest';
import { InMemoryTemplateSourceProvider } from '../src/template-source-provider';

describe('InMemoryTemplateSourceProvider', () => {
    it('returns registered source by path', async () => {
        const provider = new InMemoryTemplateSourceProvider().set('home.html', '<h1>hi</h1>');
        expect(provider.loadTemplate('home.html')).toBe('<h1>hi</h1>');
    });

    it('throws when the path is not registered', async () => {
        const provider = new InMemoryTemplateSourceProvider();
        let message = '';
        try {
            provider.loadTemplate('missing.html');
        } catch (error) {
            message = (error as Error).message;
        }
    });

    it('set() returns this for chaining', () => {
        const provider = new InMemoryTemplateSourceProvider();
        expect(provider.set('a.html', '<a/>')).toBe(provider);
    });
});
