/**
 * Test providers for the bridge spec (AD-87): the SDK's in-memory provider
 * for realistic flag sets, plus a scripted provider whose resolutions the
 * tests dictate (custom reasons, error codes, metadata — shapes the
 * in-memory provider cannot produce).
 */
import { InMemoryProvider } from '@openfeature/server-sdk';
import type { JsonValue, Provider, ResolutionDetails } from '@openfeature/server-sdk';

/** The evaluation type a scripted resolution applies to. */
export type ScriptedFlagType = 'boolean' | 'string' | 'number' | 'object';

/** A scripted resolution — the details the bridge should translate. */
export type ScriptedResolution = (
    flag: string,
    type: ScriptedFlagType
) => ResolutionDetails<JsonValue> | Promise<ResolutionDetails<JsonValue>>;

/**
 * A minimal Provider whose `resolve*` methods run the supplied script. The
 * SDK requires only `metadata` + the four resolvers from a lifecycle-free
 * test stub (no `initialize` means "ready from registration", spec
 * Req 2.8.5.1), so the object literal carries exactly that shape.
 *
 * @param script - The resolution script.
 * @returns The provider to register with the OpenFeature API.
 */
export function scriptedProvider(script: ScriptedResolution): Provider {
    return {
        metadata: { name: 'scripted' },
        runsOn: 'server' as const,
        resolveBooleanEvaluation: async (flag: string) => (await script(flag, 'boolean')) as ResolutionDetails<boolean>,
        resolveNumberEvaluation: async (flag: string) => (await script(flag, 'number')) as ResolutionDetails<number>,
        resolveStringEvaluation: async (flag: string) => (await script(flag, 'string')) as ResolutionDetails<string>,
        resolveObjectEvaluation: async (flag: string) => (await script(flag, 'object')) as ResolutionDetails<JsonValue>,
    } as unknown as Provider; // The SDK's Provider interface carries optional lifecycle surface this stub does not need.
}

/**
 * Convenience wrapper for the SDK's in-memory provider (the test stub the
 * SDK itself ships).
 *
 * @param flags - The flag configuration (variants / defaultVariant / disabled / contextEvaluator).
 * @returns The configured provider.
 */
export function inMemoryProvider(flags: ConstructorParameters<typeof InMemoryProvider>[0]): Provider {
    return new InMemoryProvider(flags);
}
