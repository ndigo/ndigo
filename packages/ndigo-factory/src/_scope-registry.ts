/**
 * Scope registry backing factory scope strategies.
 */
import { IllegalStateError } from '@ndigo/core';
import { PossibleScope, Scope } from './scope';

/**
 * Internal scope registry used by factories to manage scope strategies.
 */
export default class ScopeRegistry {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ScopeRegistry".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ScopeRegistry]"
     */
    get [Symbol.toStringTag](): string {
        return 'ScopeRegistry';
    }

    #scopes: Map<PossibleScope, Scope>;

    constructor() {
        this.#scopes = new Map<PossibleScope, Scope>();
    }

    destroyScopedValue(scopeName: PossibleScope, valueName: string): void {
        const scope = this.#scopes.get(scopeName);

        if (!scope) {
            throw new IllegalStateError(`Scope '${scopeName}' is not registered`);
        }

        scope.destroyValue(valueName);
    }

    getScope(name: PossibleScope): Scope {
        const scope = this.#scopes.get(name);

        if (!scope) {
            throw new IllegalStateError(`Scope '${name}' is not registered`);
        }

        return scope;
    }

    getScopeNames(): PossibleScope[] {
        return [...this.#scopes.keys()];
    }

    registerScope(name: PossibleScope, scope: Scope): void {
        if (!this.#scopes.has(name)) {
            this.#scopes.set(name, scope);
        }
    }
}
