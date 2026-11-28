/**
 * Decorator metadata keys and readers for configuration classes.
 */
import { getSymbolMetadata } from '@ndigo/core';
import type { JSONObject } from '@ndigo/core';
import type { ContextToken } from '@ndigo/factory';

export interface EntryMetadata {
    name: string;
    token?: ContextToken<unknown>;
}

export const { defineProperty, getOwnPropertyDescriptor } = Reflect,
    CONFIG_CONSTRUCTOR = 'config:constructor',
    CONFIG_PROPERTY = 'config:property',
    CONFIG_PROPERTY_SOURCE = 'config:property:source',
    CONFIG_DEFAULT_VALUE = 'config:defaultValue',
    CONFIG_NESTED = 'config:nested',
    CONFIG_PROPERTY_TYPE = 'config:propertyType',
    CONFIG_ENTRY = 'config:entry',
    // Helper to get metadata from a class constructor. Instances are handled
    // separately by getInstanceMetadata; the function guard keeps that split.
    getMetadata = (target: unknown): Record<string, unknown> =>
        typeof target === 'function' ? getSymbolMetadata(target) : {},
    // Helper to get metadata from an instance
    getInstanceMetadata = (instance: unknown): Record<string, unknown> => {
        if (!instance || typeof instance !== 'object') {
            return {};
        }
        // Instances expose their class as `.constructor` (plain JS object shape)
        if (!('constructor' in instance)) {
            return {};
        }
        return getMetadata(instance.constructor);
    },
    // Metadata getter functions
    hasConfigurationMetadata = (target: unknown): boolean => getMetadata(target)[CONFIG_CONSTRUCTOR] === true,
    hasPropertyMetadata = (target: unknown, propertyKey: string | symbol): boolean => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        return metadata[`${CONFIG_PROPERTY}:${String(propertyKey)}`] !== undefined;
    },
    hasPropertySourceMetadata = (target: unknown): boolean => getMetadata(target)[CONFIG_PROPERTY_SOURCE] !== undefined,
    hasEntryMetadata = (target: unknown, propertyKey: string | symbol): boolean => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        return metadata[`${CONFIG_ENTRY}:${String(propertyKey)}`] !== undefined;
    },
    getPropertyMetadata = (target: unknown, propertyKey: string | symbol): string => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        // The decorator wrote the property path string under this key
        return metadata[`${CONFIG_PROPERTY}:${String(propertyKey)}`] as string;
    },
    getPropertySourceMetadata = (target: unknown): JSONObject[] => {
        // The decorator wrote the property source array under this key
        return getMetadata(target)[CONFIG_PROPERTY_SOURCE] as JSONObject[];
    },
    getEntryMetadataRecord = (target: unknown, propertyKey: string | symbol): EntryMetadata => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        return metadata[`${CONFIG_ENTRY}:${String(propertyKey)}`] as EntryMetadata;
    };
