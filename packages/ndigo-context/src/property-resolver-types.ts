/**
 * Property resolver contracts: the resolver interface, the property index
 * strategy interface, and resolver options.
 */
import { type ConversionService, Constructable, JSONValue } from '@ndigo/core';
import { like } from '@ndigo/util/types';
import type { SecretDecryptor } from './secret-cipher';
import type { PropertySource } from './property-source';

export interface PropertyResolver {
    /**
     * Resolves a property value, falling back to a default when missing.
     *
     * @param key - The property name to resolve.
     * @param defaultValue - The value to return when no property is found.
     * @returns The resolved property value or the default value.
     */
    getProperty(key: string, defaultValue?: JSONValue): JSONValue | undefined;
    /**
     * Returns the resolved property value or throws when missing.
     *
     * @param key - The property name to resolve.
     * @returns The resolved property value.
     * @throws When the property cannot be resolved.
     */
    getRequiredProperty(key: string): JSONValue;
    /**
     * Returns whether a property key can be resolved.
     *
     * @param key - The property name to resolve.
     * @returns `true` when the property exists.
     */
    hasProperty(key: string): boolean;
    /**
     * Resolves a property as a typed value, converting when needed.
     *
     * @param key - The property name to resolve.
     * @param targetType - The target constructor or primitive (`Number`, `Boolean`, `Date`, ...).
     * @param defaultValue - The value to return when the property is missing.
     * @returns The typed value or the default.
     * @throws When a present value cannot be converted.
     */
    getPropertyAs<T>(key: string, targetType: Constructable<T> | (() => T) | T, defaultValue?: T): T | undefined;
    /**
     * Returns a typed property or throws when missing or unconvertible.
     *
     * @param key - The property name to resolve.
     * @param targetType - The target constructor or primitive.
     * @returns The typed value.
     * @throws When missing, unresolved, or unconvertible.
     */
    getRequiredPropertyAs<T>(key: string, targetType: Constructable<T> | (() => T) | T): T;
    /**
     * Raw index lookup, bypassing placeholder resolution (internal use by the
     * placeholder resolver; consumers should use {@link getProperty}).
     *
     * @param key - The property name to resolve.
     * @returns The raw value or `undefined`.
     */
    getRawProperty(key: string): JSONValue | undefined;
    /**
     * Returns the name of the source that won the given key, or `null` when
     * the active index does not retain origins or the key is unknown.
     *
     * @param key - The property key (top-level granularity).
     * @returns The winning source name, or `null`.
     * @see PropertyIndex#originOf
     */
    originOf(key: string): string | null;
}

/**
 * Returns whether a value behaves like a {@link PropertyResolver|PropertyResolver}.
 *
 * @param value - The value to be tested.
 * @returns Whether or not the value is like a {@link PropertyResolver|PropertyResolver}.
 */
export const likePropertyResolver = like({
    getProperty: Function,
    getRequiredProperty: Function,
    hasProperty: Function,
}) as (value: unknown) => value is PropertyResolver;

export interface PropertyIndex {
    /**
     * Rebuilds the index from the given ordered sources (first = highest
     * precedence).
     *
     * @param sources - The ordered property sources.
     */
    build(sources: PropertySource[]): void;
    /**
     * Resolves a property value, or `undefined` when absent.
     *
     * @param key - The property name (keypath syntax).
     * @returns The resolved value or `undefined`.
     */
    getProperty(key: string): JSONValue | undefined;
    /**
     * Returns whether the property resolves to a non-null value.
     *
     * @param key - The property name (keypath syntax).
     * @returns `true` when the property is defined.
     */
    hasProperty(key: string): boolean;
    /**
     * Returns the name of the source that won the given key — optional:
     * strategies that retain origins implement it; others omit it (the
     * resolver reports `null`). Top-level-key granularity.
     *
     * @param key - The top-level property key.
     * @returns The winning source name, or `undefined` when unsupported/unknown.
     */
    originOf?(key: string): string | undefined;
}

export interface ResolverOptions {
    /**
     * The lookup index to use. Defaults to the prototype chain (the
     * framework's historical behavior).
     *
     * Divergence note (ARC-7): `prototype` (PrototypeChainIndex) keeps a live
     * chain — in-place edits to a captured source map are visible without a
     * rebuild; `flat` (FlatMergedIndex) snapshots — in-place edits stay
     * invisible until the next rebuild. You must use the source-registry
     * mutation APIs (replace/add) or `refresh()` for either index to observe
     * edits; the placeholder cache clears only on registry version change or
     * refresh, not on raw object mutation.
     */
    index?: 'prototype' | 'flat';
    /**
     * The conversion service for typed lookups (`getPropertyAs`). Defaults to
     * a fresh `createConversionService()` when typed reads are used.
     */
    conversionService?: ConversionService;
    /**
     * Optional at-rest secret decryption. Consulted for every
     * resolved string value AFTER placeholder resolution and BEFORE
     * conversion/typed reads: `{cipher:...}` markers decrypt, everything else
     * passes through. The resolver passes the key path as the AAD context
     * (key-path AAD binding). A `SecretSchemeRegistry` is the standard
     * implementation; the seam is an interface so a single-cipher resolver
     * can be injected without the registry.
     */
    secretDecryptor?: SecretDecryptor;
}
