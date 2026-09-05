import { IllegalStateError } from '@blue/core';
import { PossibleScope, Scope } from './scope';

/**
 * Internal scope registry used by factories to manage scope strategies.
 */
export default class ScopeRegistry {
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
