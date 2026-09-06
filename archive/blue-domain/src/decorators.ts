/**
 * TC39 Stage 3 decorators for GenericDomainComponent subclasses.
 * @module
 */

import '@tsmetadata/polyfill';
import { FrameworkError } from '@blue/core';

/**
 * Class decorator that registers a name in Symbol.metadata so the factory/registry can auto-discover domain components.
 *
 * @param name - The name to register for this domain component
 * @returns A class decorator function
 */
export const domainComponent =
    (name: string) =>
    <T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext): T => {
        (context.metadata as any)['domain:component'] = { name };
        return target;
    };

/**
 * Method decorator that wraps the method with try/catch error logging and stores the method name in Symbol.metadata
 * so the component knows which methods are actions.
 *
 * @returns A method decorator function
 */
export const domainAction = <T extends (...args: any[]) => any>(
    target: T,
    context: ClassMethodDecoratorContext
): T | void => {
    if (context.kind !== 'method') {
        throw new FrameworkError('@domainAction can only be applied to methods');
    }

    const existingActions = (context.metadata['domain:actions'] as string[] | undefined) || [];
    context.metadata['domain:actions'] = [...existingActions, String(context.name)];

    return function (this: any, ...args: Parameters<T>): ReturnType<T> {
        try {
            return target.apply(this, args);
        } catch (error) {
            const componentName = this.name ?? '(unknown)';
            console.error(`[domain:${componentName}] Action "${String(context.name)}" threw:`, error);
            throw error;
        }
    } as T;
};

/**
 * Field decorator that mirrors the field through `this.model` (a `JSONObject` from `@blue/core`).
 * On `addInitializer`, initializes `this.model` if not already set (to a `createNull()` object),
 * stores the initial value to `this.model.set(fieldName, value)`, then redefines the property
 * with a getter/setter that proxies through `this.model.get(fieldName)` / `this.model.set(fieldName, value)`.
 *
 * @returns A field decorator function
 */
export const domainData = (
    value: undefined,
    context: ClassFieldDecoratorContext
): ((initialValue: any) => any) | void => {
    if (context.kind !== 'field') {
        throw new FrameworkError('@domainData can only be applied to class fields');
    }

    const fieldName = String(context.name);
    const existingData = (context.metadata['domain:data'] as string[] | undefined) || [];
    context.metadata['domain:data'] = [...existingData, fieldName];

    // Return an initializer function — TC39 field decorator initializer
    return function (this: any, initialValue: any): any {
        const name = fieldName;
        Reflect.defineProperty(this, name, {
            get(this: any) {
                return this.model?.get(name);
            },
            set(this: any, newValue: any) {
                this.model?.set(name, newValue);
            },
            configurable: true,
            enumerable: true,
        });
        // Attempt to set initial value if model is ready
        if (this.model != null) {
            this.model.set(name, initialValue);
        }
        return undefined;
    };
};

/**
 * Reads domain-specific metadata from a class decorated with domain decorators.
 *
 * @param target - The constructor function of the domain component class
 * @returns Domain metadata including name, actions, and data fields
 */
export interface DomainMetadata {
    /** Component name from @domainComponent, or undefined if not decorated */
    name?: string;
    /** Action method names from `domainAction` */
    actions: string[];
    /** Data field names from `domainData` */
    data: string[];
}

export const getDomainMetadata = (target: new (...args: any[]) => any): DomainMetadata => {
    const metadata = (target as any)[Symbol.metadata] ?? {};
    const componentMeta = metadata['domain:component'] as { name: string } | undefined;
    return {
        name: componentMeta?.name,
        actions: (metadata['domain:actions'] as string[] | undefined) ?? [],
        data: (metadata['domain:data'] as string[] | undefined) ?? [],
    };
};
