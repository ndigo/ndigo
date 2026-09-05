// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { Application } from '../src/application';
import { configuration, entry } from '@blue/context';

/**
 * @blue/boot auto-registers the node dispatch/resolver auto-config on Node
 * (window absent), so node apps need not pass NodeAutoConfiguration explicitly.
 */

describe('Application node auto-configuration', () => {
    test('registers the node dispatcher + argument resolvers without an explicit source', () => {
        const app = new Application([]);
        const context = app.run();

        expect(context.hasValue('dispatcher')).toBe(true);
        expect(context.hasValue('handlerMapping')).toBe(true);
        expect(context.hasValue('argumentResolvers')).toBe(true);
        const resolvers = context.getValue<unknown[]>('argumentResolvers');
        expect(resolvers.length).toBeGreaterThan(0);
    });

    test('user sources can override the auto-registered node config', () => {
        const app = new Application([NodeDefiningConfiguration]);
        const context = app.run();
        expect(context.hasValue('handlerMapping')).toBe(true);
        expect(context.getValue('handlerMapping')).toMatchObject({ custom: true });
    });
});

@configuration
class NodeDefiningConfiguration {
    @entry
    handlerMapping() {
        return { custom: true };
    }
}