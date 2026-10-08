/**
 * Typed event overlay specs (AD-34 D2): framework emitters deliver typed
 * payloads for declared events while the raw EventEmitter surface stays
 * usable. The positive usages below double as the compile gate — a payload
 * regressing to `unknown[]` would fail assignment/access here.
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { GenericApplicationContext } from '../src/context';
import { ApplicationContext } from '../src/context-interfaces';
import { StandardEnvironment, ConfigurableEnvironment, CONFIG_REFRESH_EVENT } from '../src/environment';

describe('typed context events (AD-34 D2)', () => {
    test('typed lifecycle listener receives the typed context payload', () => {
        const context: ApplicationContext = new GenericApplicationContext('typed');

        let seen: ApplicationContext | null = null;
        let preparingSeen = false;

        context.on('context:refresh', (refreshed: ApplicationContext) => {
            // Compile gate: `refreshed` must be the ApplicationContext type.
            seen = refreshed;
            void refreshed.isActive;
        });
        context.on('context:preparing', (preparing) => {
            preparingSeen = preparing !== null && preparing !== undefined;
        });

        context.refresh();

        expect(preparingSeen).toBe(true);
        expect(seen).toBe(context);
        // The listener assignment happens inside the emit callback, so flow
        // analysis narrows `seen` to null here; the cast re-widens the read
        // handle to the declared union and keeps the null-detecting chain.
        const seenContext = seen as ApplicationContext | null;
        expect(seenContext?.isActive).toBe(true);

        context.close();
    });

    test('typed emit delivers the payload tuple', () => {
        const context: ApplicationContext = new GenericApplicationContext('typed');
        let count = 0;

        context.on('context:close', (closing) => {
            void closing.name;
            count++;
        });
        context.emit('context:close', context);

        expect(count).toBe(1);

        context.close();
    });

    test('raw string events still work alongside typed ones', () => {
        const context: ApplicationContext = new GenericApplicationContext('typed');
        let rawPayload: unknown = undefined;

        context.on('custom:event', (...data: unknown[]) => {
            rawPayload = data[0];
        });
        context.emit('custom:event', { answer: 42 });

        expect(rawPayload).toEqual({ answer: 42 });

        context.close();
    });

    test('typed listeners can be removed with off', () => {
        const context: ApplicationContext = new GenericApplicationContext('typed');
        let calls = 0;
        const listener = (_refreshed: ApplicationContext) => {
            calls++;
        };

        context.on('context:refresh', listener);
        context.off('context:refresh', listener);

        context.refresh();
        expect(calls).toBe(0);

        context.close();
    });
});

describe('typed environment events (AD-34 D2)', () => {
    test('CONFIG_REFRESH_EVENT listens with an empty payload tuple', () => {
        const environment: ConfigurableEnvironment = new StandardEnvironment();
        let refreshes = 0;

        // Typed path: the payload tuple is `[]`, so the listener takes no args.
        environment.on(CONFIG_REFRESH_EVENT, () => {
            refreshes++;
        });

        environment.refresh();

        expect(refreshes).toBe(1);

        environment.refresh();
        expect(refreshes).toBe(2);
    });

    test('raw environment events remain available', () => {
        const environment: ConfigurableEnvironment = new StandardEnvironment();
        let seen: unknown = undefined;

        environment.on('custom:env', (...data: unknown[]) => {
            seen = data[0];
        });
        environment.emit('custom:env', 'hello');

        expect(seen).toBe('hello');
    });
});
