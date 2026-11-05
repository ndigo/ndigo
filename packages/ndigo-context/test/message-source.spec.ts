/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { likeMessageSource, MessageSource } from '@ndigo/content';
import { ApplicationContextAwareProcessor } from '../src/application-context-aware-processor';
import { GenericApplicationContext } from '../src/generic-application-context';

/** Records calls so params/language flow is observable. */
class FakeMessageSource implements MessageSource {
    calls: Array<{ key: string; params?: unknown; language?: string }> = [];
    translations: Record<string, string>;

    constructor(translations: Record<string, string> = {}) {
        this.translations = translations;
    }

    async getMessage(key: string, params?: unknown, language?: string): Promise<string> {
        this.calls.push({ key, params, language });
        return this.translations[key] ?? key;
    }
}

describe('GenericApplicationContext — message source', () => {
    test('getMessage falls back to the content source when no message source is registered', async () => {
        const context = new GenericApplicationContext('test');
        context.setContentSource(
            new (class {
                async getContent(key: string, language: string): Promise<string> {
                    return key === 'welcome' ? `Welcome (${language})` : key;
                }
            })()
        );

        expect(await context.getMessage('welcome', undefined, 'fr')).toBe('Welcome (fr)');
        expect(await context.getMessage('missing')).toBe('missing');
    });

    test('setMessageSource delegates formatting with params and language', async () => {
        const context = new GenericApplicationContext('test');
        const messages = new FakeMessageSource({ greeting: 'Hello {name}!' });
        context.setMessageSource(messages);

        expect(await context.getMessage('greeting', { values: { name: 'Ada' } }, 'fr')).toBe('Hello {name}!');
        expect(messages.calls).toEqual([{ key: 'greeting', params: { values: { name: 'Ada' } }, language: 'fr' }]);
    });

    test('a message source returning the key falls back to content, then the key', async () => {
        const context = new GenericApplicationContext('test');
        const content = new (class {
            async getContent(key: string, _language: string): Promise<string> {
                return key === 'title' ? 'Raw title' : key;
            }
        })();
        context.setContentSource(content);
        context.setMessageSource(new FakeMessageSource({}));

        expect(await context.getMessage('title')).toBe('Raw title');
        expect(await context.getMessage('unknown.key')).toBe('unknown.key');
    });

    test('child contexts delegate message lookups to the parent', async () => {
        const parent = new GenericApplicationContext('parent');
        const messages = new FakeMessageSource({ shared: 'Shared value' });
        parent.setMessageSource(messages);

        const child = parent.newChild('child');
        expect(await child.getMessage('shared')).toBe('Shared value');

        // Child-level message source wins over the parent.
        const childMessages = new FakeMessageSource({ shared: 'Child value' });
        (child as GenericApplicationContext).setMessageSource(childMessages);
        expect(await child.getMessage('shared')).toBe('Child value');
    });

    test('context satisfies the message-source contract guard', () => {
        const context = new GenericApplicationContext('test');
        expect(likeMessageSource(context)).toBe(true);
    });

    describe('ApplicationContextAwareProcessor', () => {
        class TestPrototype {
            isAware = true;
            destroy = vi.fn();
            init = vi.fn();
            setMessageSource = vi.fn();
        }

        let context: GenericApplicationContext;
        let processor: ApplicationContextAwareProcessor;

        beforeEach(() => {
            context = new GenericApplicationContext('test');
            processor = new ApplicationContextAwareProcessor(context);
            context.addProcessor(processor);
        });

        afterEach(() => {
            context.destroy();
            context = undefined as unknown as GenericApplicationContext;
            processor = undefined as unknown as ApplicationContextAwareProcessor;
        });

        test('it should inject the context as message source into aware values', () => {
            context.setValue('test', TestPrototype);

            const test = context.getValue('test') as TestPrototype;
            expect(test.setMessageSource).toHaveBeenCalledWith(context);
        });
    });
});
