/**
 * The `@entry` method decorator.
 */
import { FrameworkError } from '@ndigo/core';
import { ContextToken, isContextToken } from '@ndigo/factory';
import {
    CONFIG_ENTRY,
    defineProperty,
    getOwnPropertyDescriptor,
    type EntryMetadata,
} from './_configuration-metadata.js';

/**
 * Marks a method as a configuration entry factory.
 * Can be used as `@entry()` or `@entry('customName')`.
 *
 * @param nameOrTarget - Entry name.
 * @returns A method decorator.
 */
function createEntryDecorator(entryName?: string | ContextToken<unknown>) {
    // Generic target keeps the decorator's return type assignable to the
    // decorated method (TS1270 would reject a bare `Function` return).
    return function <M extends Function>(target: M, context: ClassMethodDecoratorContext): M {
        if (context.kind !== 'method') {
            throw new FrameworkError('@entry can only be applied to methods');
        }

        // Registry tokens use their description as the runtime string key;
        // the token supplies the compile-time type association.
        let name: string;
        let token: ContextToken<unknown> | undefined;
        if (isContextToken(entryName)) {
            token = entryName;
            name = entryName.description;
        } else {
            name = entryName ?? String(context.name);
        }
        const metadata: EntryMetadata = { name, token };
        context.metadata[`${CONFIG_ENTRY}:${String(context.name)}`] = metadata;

        // Make the method enumerable so it can be found by for...in loops
        context.addInitializer(function (this: unknown) {
            // `this` is the decorated method's instance (runtime-provided).
            // Walk the entire prototype chain: on a subclassed configuration
            // the `@entry` method descriptor lives on the *base* class's
            // prototype, not the instance or its immediate prototype
            // (FOLLOW-1). Mark it enumerable where it is actually declared so
            // the parser's `for...in` discovers inherited factories too.
            let owner: object | null = this as object;
            while (owner !== null) {
                const descriptor = getOwnPropertyDescriptor(owner, context.name);
                if (descriptor) {
                    if (!descriptor.enumerable) {
                        defineProperty(owner, context.name, {
                            ...descriptor,
                            enumerable: true,
                        });
                    }
                    break;
                }
                owner = Object.getPrototypeOf(owner) as object | null;
            }
        });

        return target;
    };
}

/**
 * A method decorator that marks a configuration entry factory.
 *
 * @example
 * ```ts
 * class AppConfig {
 *     @entry('greeting')
 *     greeting() { return 'hello'; }
 * }
 * ```
 */
export type EntryDecorator = <M extends Function>(target: M, context: ClassMethodDecoratorContext) => M;

/**
 * Creates an entry decorator from an explicit entry name (or context token).
 *
 * @param nameOrTarget - Entry name.
 * @returns A method decorator.
 *
 * @example
 * ```ts
 * class AppConfig {
 *     @entry('greeting')
 *     greeting() { return 'hello'; }
 * }
 * ```
 */
export function entry(nameOrTarget: string | ContextToken<unknown>): EntryDecorator;
/**
 * Creates an entry decorator that reads the entry name from the method name.
 *
 * @returns A method decorator.
 *
 * @example
 * ```ts
 * class AppConfig {
 *     greeting() { return 'hello'; }
 * }
 * ```
 */
export function entry(): EntryDecorator;
/**
 * Creates an entry decorator.
 * @param nameOrTarget - Entry name.
 * @returns A method decorator.
 *
 * @example
 * ```ts
 * class AppConfig {
 *     @entry('greeting')
 *     greeting() { return 'hello'; }
 * }
 * ```
 */
export function entry(nameOrTarget?: string | ContextToken<unknown>): EntryDecorator {
    if (typeof nameOrTarget === 'string' || isContextToken(nameOrTarget)) {
        return createEntryDecorator(nameOrTarget);
    }
    return createEntryDecorator();
}
