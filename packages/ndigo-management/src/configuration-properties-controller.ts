/**
 * Serves bound-configuration introspection under `/configprops`
 * (AD-76 D-3). Registered WITHOUT route decorators — the auto-configuration
 * wires the routes explicitly so exposure can gate them.
 */
import { AsApplicationContextAware, type ApplicationContext, declaredConfigurationProperties } from '@ndigo/context';
import { Null } from '@ndigo/core';
import { getMapping, requestMapping } from '@ndigo/dispatcher';
import { ResponseEntity } from '@ndigo/platform-node';
import { isEndpointExposed } from './management-properties';

/**
 * Serves `/configprops`: the declared keys and conversion types of the
 * app's `@configurationProperties` classes — **never their values**, so the
 * endpoint cannot leak a secret by construction (the same value-free
 * contract `@ndigo/inspect` codifies; AD-76 D-3).
 *
 * The class list is the explicit `configurationClasses` option (mirroring
 * `@ndigo/inspect`'s `configurationClasses` input) — the framework keeps no
 * registry of bound classes to scan.
 *
 * Payload shape: `{ entries: [{ name, properties: [{ key, type? }] }] }`,
 * deterministically sorted.
 */
@requestMapping('/configprops')
export class ConfigurationPropertiesController extends AsApplicationContextAware(Null) {
    /** The application context injected by the aware mixin. */
    readonly applicationContext!: ApplicationContext;
    readonly #classes: Array<new () => unknown>;
    readonly #exposure: { include?: string[]; exclude?: string[] };

    /**
     * Creates the `/configprops` controller.
     *
     * @param classes - The `@configurationProperties` classes to enumerate.
     * @param exposure - The programmatic exposure override.
     */
    constructor(classes: Array<new () => unknown> = [], exposure: { include?: string[]; exclude?: string[] } = {}) {
        super();
        this.#classes = classes;
        this.#exposure = exposure;
    }

    /**
     * The configuration-properties document.
     *
     * @returns `{ entries: […] }` — never values.
     */
    @getMapping('/')
    configprops() {
        if (!isEndpointExposed(this.applicationContext?.environment, this.#exposure, 'configprops')) {
            return ResponseEntity.notFound();
        }
        const entries: Array<{
            name: string;
            properties: Array<{ key: string; type?: string }>;
        }> = [];
        for (const ctor of this.#classes) {
            const declared = declaredConfigurationProperties(ctor);
            if (declared.length === 0) {
                continue;
            }
            entries.push({
                name: entryPrefix(declared.map((entry) => entry.key)),
                properties: declared.map((entry) =>
                    entry.type === undefined ? { key: entry.key } : { key: entry.key, type: entry.type }
                ),
            });
        }
        return { entries };
    }
}

/**
 * Derives a deterministic entry name for a class's declared keys: the common
 * first key segment when every key shares it, otherwise `ROOT` (a
 * prefix-less class).
 *
 * @param keys - The declared dotted keys.
 * @returns The entry name.
 */
function entryPrefix(keys: readonly string[]): string {
    const dotted = keys.filter((key) => key.includes('.'));
    if (dotted.length === 0) {
        return 'ROOT';
    }
    const candidate = dotted[0].slice(0, dotted[0].indexOf('.'));
    return dotted.every((key) => key.startsWith(`${candidate}.`)) ? candidate : 'ROOT';
}
