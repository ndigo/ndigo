/**
 * Environment structural guards and the awareness mixin.
 */
import type { Constructable } from '@ndigo/core';
import { AsAware, likeAwareAnd } from '@ndigo/factory';
import { like, isNil } from '@ndigo/util/types';
import { likePropertyResolver } from './property-resolver.js';
import type { Environment, EnvironmentAware, EnvironmentSource } from './environment-types.js';

const { defineProperty } = Reflect;

/**
 * @see module:context.AsEnvironmentAware
 */
export const AsEnvironmentAware = <T extends Constructable>(superclass: T): Constructable<EnvironmentAware> & T =>
    class extends AsAware(superclass) implements EnvironmentAware {
        readonly environment!: Environment;

        /**
         * Captures the environment on the instance.
         *
         * @param environment - The environment to assign.
         */
        setEnvironment(environment: Environment): void {
            defineProperty(this, 'environment', {
                value: environment,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };

/**
 * Returns whether a value behaves like an environment.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like an environment.
 */
const _likeEnvironmentShape = like({
    activeProfiles: Array,
    defaultProfiles: Array,
    addActiveProfile: Function,
    addDefaultProfile: Function,
    acceptsProfiles: Function,
    originOf: Function,
    refresh: Function,
});

/**
 * Tests whether a value behaves like an `Environment`.
 *
 * @param value - Value to test.
 * @returns `true` when it does.
 */
export const likeEnvironment = (value: unknown): value is Environment =>
    likePropertyResolver(value) && _likeEnvironmentShape(value);

/**
 * Returns whether a value can receive an environment.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like environment aware.
 */
export const likeEnvironmentAware = likeAwareAnd(like({ setEnvironment: Function })) as (
    value: unknown
) => value is EnvironmentAware;

const hasEnvironmentProperty = (value: unknown): boolean =>
    likeEnvironment((value as Record<PropertyKey, unknown>)?.['environment']);

/**
 * Returns whether a value exposes an environment.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like an environment source.
 */
export const likeEnvironmentSource = (value: unknown): value is EnvironmentSource =>
    !isNil(value) && hasEnvironmentProperty(value);

/**
 * Environment implementation intended for tests.
 *
 * @example
 * ```ts
 * const env = new MockEnvironment();
 * env.setActiveProfiles('test');
 * env.getProperty('foo'); // undefined
 * ```
 */
