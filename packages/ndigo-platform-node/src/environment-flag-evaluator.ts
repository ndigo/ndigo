/**
 * The default `FLAG_EVALUATOR` bean (AD-82 D-5): a
 * `PropertyFlagProvider` whose property reader resolves the
 * **application environment at read time**.
 *
 * The container injects the application context (`ApplicationContextAware`)
 * into this bean value at creation; the reader stays lazy (per
 * evaluation), so bean-creation ordering can never capture a stale or
 * undefined environment. `environment.refresh()` (AD-29) therefore flips
 * flags live through the read-through provider — no cache, no restart.
 */
import { AsApplicationContextAware, type ApplicationContext } from '@ndigo/context';
import { Null } from '@ndigo/core';
import {
    PropertyFlagProvider,
    type FlagEvaluation,
    type FlagEvaluationContext,
    type FlagEvaluator,
    type FlagValue,
} from '@ndigo/flags';

/**
 * Environment-backed flag evaluator: flags resolve from `feature.*`
 * properties (default provider namespace), read immediately.
 */
export class EnvironmentFlagEvaluator extends AsApplicationContextAware(Null) implements FlagEvaluator {
    /** The owning application context (container-injected). */
    readonly applicationContext!: ApplicationContext;

    /** Backend identifier — `'property'` (the local provider's kind). */
    get kind(): string {
        return this.#provider.kind;
    }

    readonly #provider: PropertyFlagProvider;

    constructor() {
        super();
        this.#provider = new PropertyFlagProvider({
            // `this.applicationContext` is read per evaluation, after the
            // container injection lands — never captured at construction.
            getProperty: (key) => this.applicationContext?.environment?.getProperty(key),
        });
    }

    /**
     * Evaluates `flag` against the current environment state. Never
     * throws: an absent provider environment or a failing read resolves
     * as `ERROR`/`DEFAULT` with the supplied default.
     */
    async evaluate<T extends FlagValue>(
        flag: string,
        defaultValue: T,
        ctx?: FlagEvaluationContext
    ): Promise<FlagEvaluation<T>> {
        return this.#provider.evaluate(flag, defaultValue, ctx);
    }
}
