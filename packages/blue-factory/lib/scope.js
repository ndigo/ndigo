/**
 * @author Jeff Rose
 */
import '../node_modules/reflect-metadata/Reflect';
import { isConstructor } from '@blue/util';
import Entry from './entry';
const SCOPE = 'scope', { defineProperty } = Reflect, { defineMetadata, getMetadata, hasMetadata } = Reflect;
/**
 * @param {*} value
 * @param {*} target
 * @param {string|external:symbol} [propertyKey]
 */
export const defineScope = (value, target) => defineMetadata(SCOPE, value, target);
/**
 * @param {*} target
 * @param {string|external:symbol} [propertyKey]
 * @returns {*}
 */
export const getScope = (target) => getMetadata(SCOPE, target);
/**
 * @param {*} target
 * @param {string|external:symbol} [propertyKey]
 * @returns {boolean} Whether or not the `target` and optional `propertyKey` has a scope mapping defined.
 */
export const hasScope = (target) => hasMetadata(SCOPE, target);
/**
 * @param {string} scope
 */
export const scope = (scope) => (target) => {
    defineScope(scope, target);
    console.log('@Scope', scope, target);
    return target;
};
export const singletonScope = scope('singleton');
export const prototypeScope = scope('prototype');
export const hashScope = scope('hash');
export class PrototypeScope {
    destroyValue(name) {
        throw new Error('Method not implemented.');
    }
    getValue(name, factory) {
        throw new Error('Method not implemented.');
    }
}
export class HashScope {
    destroyValue(name) {
        throw new Error('Method not implemented.');
    }
    getValue(name, factory) {
        throw new Error('Method not implemented.');
    }
}
export class SingletonScope {
    destroyValue(name) {
        throw new Error('Method not implemented.');
    }
    getValue(name, factory) {
        throw new Error('Method not implemented.');
    }
}
const ps = new PrototypeScope(), hs = new HashScope(), ss = new SingletonScope();
export const AsScopedFactory = (superclass) => class extends superclass {
    #scopes;
    constructor(...args) {
        super(...args);
        this.#scopes = new Map();
        // Register default scopes
        this.registerScope('prototype', ps);
        this.registerScope('route', hs);
        this.registerScope('singleton', ss);
    }
    destroyScopedValue(scopeName, valueName) {
        const scope = this.#scopes.get(scopeName);
        scope ?? scope.destroyValue(valueName);
    }
    getScope(name) {
        return this.#scopes.get(name);
    }
    getScopeNames() {
        return [...this.#scopes.keys()];
    }
    getValue(name, argumentsList = []) {
        const entry = this[`$${name}`], scopeName = entry.scope, scope = this.#scopes.get(scopeName);
        scope.getValue(name, () => { });
        return this[name];
    }
    registerScope(name, scope) {
        if (!this.#scopes.has(name)) {
            this.#scopes.set(name, scope);
        }
    }
    setValue(name, value) {
        const scopeName = getScope(value) ?? (isConstructor(value) ? 'prototype' : 'singleton'), entry = new Entry(name, value, scopeName);
        defineProperty(this, `$${name}`, {
            value: entry,
            configurable: true,
            enumerable: true,
            writable: false,
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc2NvcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLDBDQUEwQyxDQUFDO0FBSWxELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDM0MsT0FBTyxLQUFLLE1BQU0sU0FBUyxDQUFDO0FBaUI1QixNQUFNLEtBQUssR0FBRyxPQUFPLEVBQ2pCLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM1QixFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLEdBQUcsT0FBYyxDQUFDO0FBRWxFOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFRLEVBQUUsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztBQUV6Rjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxFQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBRXBFOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUFNLEVBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFeEU7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxLQUFLLEdBQ2QsQ0FBQyxLQUFvQixFQUFFLEVBQUUsQ0FDekIsQ0FBQyxNQUFjLEVBQU8sRUFBRTtJQUNwQixXQUFXLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNyQyxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUM7QUFFTixNQUFNLENBQUMsTUFBTSxj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