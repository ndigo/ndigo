import { describe, test, expect } from 'vitest';
import { AsContentSourceAware, StaticContentSource, likeContentSource, likeContentSourceAware } from '../src/content';

describe('@blue/content content utilities', () => {
    test('StaticContentSource resolves language with fallback', () => {
        const source = new StaticContentSource(
            {
                welcome: {
                    en: 'Welcome',
                    es: 'Bienvenido',
                },
            },
            'en'
        );

        expect(source.getContent('welcome', 'es')).toBe('Bienvenido');
        expect(source.getContent('welcome', 'fr')).toBe('Welcome');
        expect(source.getContent('missing', 'en')).toBe('missing');
    });

    test('AsContentSourceAware injects content source on instances', () => {
        class Plain {}

        class AwareExample extends AsContentSourceAware(Plain) {}

        const source = new StaticContentSource({
            hello: { en: 'Hello' },
        });

        const instance = new AwareExample();
        instance.setContentSource(source);

        expect((instance as any).contentSource).toBe(source);
        expect((instance as any).contentSource.getContent('hello', 'en')).toBe('Hello');
    });

    test('duck typing guards for content source and aware objects', () => {
        const source = new StaticContentSource({
            hello: { en: 'Hello' },
        });

        const awareCandidate = {
            isAware: true,
            setContentSource: () => {},
        };

        expect(likeContentSource(source)).toBe(true);
        expect(likeContentSourceAware(awareCandidate)).toBe(true);
    });
});
