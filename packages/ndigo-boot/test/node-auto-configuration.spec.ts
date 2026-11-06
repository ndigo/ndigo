/**
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { Application } from '../src/application';
import { NodeAutoConfiguration } from '../../ndigo-platform-node/src/node-auto-configuration';
import { configuration, entry } from '@ndigo/context';

/**
 * @ndigo/boot is platform-neutral: it never imports @ndigo/platform-node (or
 * DOM code) itself. Node apps pass `NodeAutoConfiguration` explicitly as a
 * source — same contract as browser apps passing `WebAutoConfiguration`.
 * These specs double as the dependency-boundary proof: neither the source nor
 * the manifest carries a boot → platform-node edge (the spec reaches the
 * platform source relatively; a manifest entry would close an Nx build cycle
 * — platform-node depends on boot).
 */

describe('Application node auto-configuration', () => {
    test('registers the node dispatcher + argument resolvers from an explicit source', async () => {
        const app = new Application([NodeAutoConfiguration]);
        const context = await app.run();

        expect(context.hasValue('dispatcher')).toBe(true);
        expect(context.hasValue('handlerMapping')).toBe(true);
        expect(context.hasValue('argumentResolvers')).toBe(true);
        const resolvers = context.getValue<unknown[]>('argumentResolvers');
        expect(resolvers.length).toBeGreaterThan(0);
    });

    test('user sources can override the node config entries', async () => {
        const app = new Application([NodeAutoConfiguration, NodeDefiningConfiguration]);
        const context = await app.run();
        expect(context.hasValue('handlerMapping')).toBe(true);
        expect(context.getValue('handlerMapping')).toMatchObject({ custom: true });
    });
});

@configuration
class NodeDefiningConfiguration {
    @entry()
    handlerMapping() {
        return { custom: true };
    }
}
