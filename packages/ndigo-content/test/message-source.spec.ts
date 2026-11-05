/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { AsMessageSourceAware, MessageParams, likeMessageSource, likeMessageSourceAware } from '../src/message-source';

/** Minimal fake: interpolates `{name}` values so param flow is observable. */
class FakeMessageSource {
    lastLanguage: string | undefined = undefined;

    async getMessage(key: string, params?: MessageParams, language?: string): Promise<string> {
        this.lastLanguage = language;
        const template = { greeting: 'Hello {name}!', items: 'count={count}' }[key];
        if (!template) return key;
        let message = template;
        for (const [name, value] of Object.entries(params?.values ?? {})) {
            message = message.replace(`{${name}}`, String(value));
        }
        if (params?.count !== undefined) {
            message = message.replace('{count}', String(params.count));
        }
        return message;
    }
}

describe('@ndigo/content message source contract', () => {
    test('getMessage passes values, count, and language to the source', async () => {
        const source = new FakeMessageSource();

        expect(await source.getMessage('greeting', { values: { name: 'Ada' } }, 'fr')).toBe('Hello Ada!');
        expect(source.lastLanguage).toBe('fr');
        expect(await source.getMessage('items', { count: 3 }, 'en')).toBe('count=3');
    });

    test('missing keys fall back to the key itself', async () => {
        const source = new FakeMessageSource();
        expect(await source.getMessage('unknown.message', {}, 'en')).toBe('unknown.message');
    });

    test('AsMessageSourceAware injects message source on instances', async () => {
        class Plain {}

        class AwareExample extends AsMessageSourceAware(Plain) {}

        const source = new FakeMessageSource();
        const instance = new AwareExample();
        instance.setMessageSource(source);

        // messageSource is attached reflectively and not part of the public type:
        // narrow from unknown, then validate the runtime shape with the package guard.
        const candidate: unknown = instance;
        if (typeof candidate !== 'object' || candidate === null || !('messageSource' in candidate)) {
            throw new Error('expected message source to be attached');
        }
        const attached = candidate.messageSource;
        if (!likeMessageSource(attached)) {
            throw new Error('expected message source to be attached');
        }

        expect(attached).toBe(source);
        expect(await attached.getMessage('greeting', { values: { name: 'Ada' } }, 'en')).toBe('Hello Ada!');
    });

    test('duck typing guards for message source and aware objects', () => {
        const source = new FakeMessageSource();

        const awareCandidate = {
            isAware: true,
            setMessageSource: () => {},
        };

        expect(likeMessageSource(source)).toBe(true);
        expect(likeMessageSource({ getMessage: () => '' })).toBe(true);
        expect(likeMessageSource({})).toBe(false);
        expect(likeMessageSourceAware(awareCandidate)).toBe(true);
        expect(likeMessageSourceAware({})).toBe(false);
    });
});
