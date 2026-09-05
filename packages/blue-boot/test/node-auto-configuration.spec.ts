// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { Application } from '../src/application';
import { NodeAutoConfiguration } from '@blue/platform-node';
import { configuration, entry } from '@blue/context';

/**
 * @blue/boot is platform-neutral: it never imports @blue/platform-node (or
 * DOM code) itself. Node apps pass `NodeAutoConfiguration` explicitly as a
 * source — same contract as browser apps passing `WebAutoConfiguration`.
 * These specs double as the dependency-boundary proof: this package's source
 * compiles with no boot → platform-node edge (enforced by the absence of the
 * runtime dependency in package.json).
 */

describe('Application node auto-configuration', () => {
    test('registers the node dispatcher + argument resolvers from an explicit source', () => {
        const app = new Application([NodeAutoConfiguration]);
        const context = app.run();

        expect(context.hasValue('dispatcher')).toBe(true);
        expect(context.hasValue('handlerMapping')).toBe(true);
        expect(context.hasValue('argumentResolvers')).toBe(true);
        const resolvers = context.getValue<unknown[]>('argumentResolvers');
        expect(resolvers.length).toBeGreaterThan(0);
    });

    test('user sources can override the node config entries', () => {
        const app = new Application([NodeAutoConfiguration, NodeDefiningConfiguration]);
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
