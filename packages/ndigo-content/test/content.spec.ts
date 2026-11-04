/**
 * @module ndigo-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { AsContentSourceAware, StaticContentSource, likeContentSource, likeContentSourceAware } from '../src/content';

describe('@ndigo/content content utilities', () => {
    test('StaticContentSource resolves language with fallback', async () => {
        const source = new StaticContentSource(
            {
                welcome: {
                    en: 'Welcome',
                    es: 'Bienvenido',
                },
            },
            'en'
        );

        expect(await source.getContent('welcome', 'es')).toBe('Bienvenido');
        expect(await source.getContent('welcome', 'fr')).toBe('Welcome');
        expect(await source.getContent('missing', 'en')).toBe('missing');
    });

    test('AsContentSourceAware injects content source on instances', async () => {
        class Plain {}

        class AwareExample extends AsContentSourceAware(Plain) {}

        const source = new StaticContentSource({
            hello: { en: 'Hello' },
        });

        const instance = new AwareExample();
        instance.setContentSource(source);

        // contentSource is attached reflectively and not part of the public type:
        // narrow from unknown, then validate the runtime shape with the package guard.
        const candidate: unknown = instance;
        if (typeof candidate !== 'object' || candidate === null || !('contentSource' in candidate)) {
            throw new Error('expected content source to be attached');
        }
        const attached = candidate.contentSource;
        if (!likeContentSource(attached)) {
            throw new Error('expected content source to be attached');
        }

        expect(attached).toBe(source);
        expect(await attached.getContent('hello', 'en')).toBe('Hello');
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
