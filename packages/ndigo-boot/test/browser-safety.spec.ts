/**
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ApplicationBuilder } from '../src/application-builder';

/**
 * Isomorphism guard (AD-90 D-5): in a browser there is no `process` global,
 * so the shared bootstrap reaches its environment variables through `getEnv`
 * (a no-op without `process`) rather than `process.env`. Before the fix,
 * `Application._configureProfiles` / `#profileGroups` read `process.env`
 * directly and `run()` threw `ReferenceError: process is not defined` — while
 * profiles supplied programmatically or over the CLI must still apply.
 */

class EmptyConfiguration {}

describe('@ndigo/boot without a process global', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('builder profiles apply when run() sees no process', async () => {
        vi.stubGlobal('process', undefined);

        const context = await new ApplicationBuilder([EmptyConfiguration]).profiles('dev').run();

        expect(context.environment?.activeProfiles).toEqual(['dev']);
        context.close();
    });

    test('CLI profiles apply when run() sees no process', async () => {
        vi.stubGlobal('process', undefined);

        const context = await new ApplicationBuilder([EmptyConfiguration]).run('--profiles.active=dev,test');

        expect(context.environment?.activeProfiles).toEqual(['dev', 'test']);
        context.close();
    });
});
