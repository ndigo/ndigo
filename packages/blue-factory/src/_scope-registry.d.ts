/**
 * @author Jeff Rose
 */
import { PossibleScope, Scope } from './scope';
/**
 * Internal scope registry used by factories to manage scope strategies.
 */
export default class ScopeRegistry {
    #private;
    constructor();
    destroyScopedValue(scopeName: PossibleScope, valueName: string): void;
    getScope(name: PossibleScope): Scope;
    getScopeNames(): PossibleScope[];
    registerScope(name: PossibleScope, scope: Scope): void;
}
