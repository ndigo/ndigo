/**
 * @author Jeff Rose
 */
import '../node_modules/reflect-metadata/Reflect';
import { isConstructor } from '@blue/util';
import Entry from './entry';
const SCOPE = 'scope', { defineProperty } = Reflect, { defineMetadata, getMetadata, hasMetadata } = Reflect;
/**
 * @function module:factory.defineScope
 * @param {*} value
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 */
export const defineScope = (value, target) => defineMetadata(SCOPE, value, target);
/**
 * @function module:factory.getScope
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 * @returns {*}
 */
export const getScope = (target) => getMetadata(SCOPE, target);
/**
 * @function module:factory.hasScope
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 * @returns {external:boolean} Whether or not the `target` and optional `propertyKey` has a scope mapping defined.
 */
export const hasScope = (target) => hasMetadata(SCOPE, target);
/**
 * @function module:factory.Scope
 * @param {external:string} scope
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc2NvcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLDBDQUEwQyxDQUFDO0FBSWxELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDM0MsT0FBTyxLQUFLLE1BQU0sU0FBUyxDQUFDO0FBaUI1QixNQUFNLEtBQUssR0FBRyxPQUFPLEVBQ2pCLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM1QixFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLEdBQUcsT0FBYyxDQUFDO0FBRWxFOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBUSxFQUFFLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFekY7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUFNLEVBQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFcEU7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUFNLEVBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFeEU7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sS0FBSyxHQUNkLENBQUMsS0FBb0IsRUFBRSxFQUFFLENBQ3pCLENBQUMsTUFBYyxFQUFPLEVBQUU7SUFDcEIsV0FBVyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDckMsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFDO0FBRU4sTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUVqRCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBRWpELE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFdkMsTUFBTSxPQUFPLGNBQWM7SUFDdkIsWUFBWSxDQUFDLElBQVk7UUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRCxRQUFRLENBQVUsSUFBWSxFQUFFLE9BQVk7UUFDeEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7Q0FDSjtBQUVELE1BQU0sT0FBTyxTQUFTO0lBQ2xCLFlBQVksQ0FBQyxJQUFZO1FBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ0QsUUFBUSxDQUFVLElBQVksRUFBRSxPQUFZO1FBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0NBQ0o7QUFFRCxNQUFNLE9BQU8sY0FBYztJQUN2QixZQUFZLENBQUMsSUFBWTtRQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNELFFBQVEsQ0FBVSxJQUFZLEVBQUUsT0FBWTtRQUN4QyxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDL0MsQ0FBQztDQUNKO0FBRUQsTUFBTSxFQUFFLEdBQUcsSUFBSSxjQUFjLEVBQUUsRUFDM0IsRUFBRSxHQUFHLElBQUksU0FBUyxFQUFFLEVBQ3BCLEVBQUUsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBSzlCLE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxDQUEwQixVQUFhLEVBQW9DLEVBQUUsQ0FDeEcsS0FBTSxTQUFRLFVBQVU7SUFDcEIsT0FBTyxDQUE0QjtJQUVuQyxZQUFZLEdBQUcsSUFBVztRQUN0QixLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQXdCLENBQUM7UUFFL0MsMEJBQTBCO1FBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxTQUF3QixFQUFFLFNBQWlCO1FBQzFELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFDLEtBQUssSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxRQUFRLENBQUMsSUFBbUI7UUFDeEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsYUFBYTtRQUNULE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsUUFBUSxDQUFVLElBQVksRUFBRSxnQkFBdUIsRUFBRTtRQUNyRCxNQUFNLEtBQUssR0FBYSxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxFQUNwQyxTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFDdkIsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXhDLEtBQUssQ0FBQyxRQUFRLENBQUksSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUFDO1FBRWxDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxhQUFhLENBQUMsSUFBbUIsRUFBRSxLQUFZO1FBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsQyxDQUFDO0lBQ0wsQ0FBQztJQUVELFFBQVEsQ0FBVSxJQUFZLEVBQUUsS0FBUTtRQUNwQyxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQ25GLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBSSxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRWpELGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxJQUFJLEVBQUUsRUFBRTtZQUM3QixLQUFLLEVBQUUsS0FBSztZQUNaLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFDIn0=