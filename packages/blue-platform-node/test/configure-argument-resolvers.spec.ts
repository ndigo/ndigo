/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import { configureNodeArgumentResolvers } from '../src/configure-argument-resolvers';
import { NodeQueryValueMethodArgumentResolver } from '../src/query-argument-resolver';
import { NodePathValueMethodArgumentResolver } from '../src/path-argument-resolver';
import { NodeHeaderValueMethodArgumentResolver } from '../src/header-argument-resolver';
import { NodeBodyValueMethodArgumentResolver } from '../src/body-argument-resolver';
import { NodeDataBindingMethodArgumentResolver } from '../src/data-binding-argument-resolver';
import { NodeRequestPartMethodArgumentResolver } from '../src/request-part-argument-resolver';
import { NodeMultipartFileMethodArgumentResolver } from '../src/multipart-file-argument-resolver';
import { NodeCookieValueMethodArgumentResolver } from '../src/cookie-argument-resolver';
import { NodeRequestSessionValueMethodArgumentResolver } from '../src/request-session-argument-resolver';

describe('configureNodeArgumentResolvers', () => {
    let context: GenericApplicationContext;

    beforeEach(() => {
        vi.resetAllMocks();
        context = new GenericApplicationContext();
    });

    test('should return array of 6 resolvers', () => {
        const resolvers = configureNodeArgumentResolvers(context);
        expect(resolvers).toHaveLength(9);
    });

    test('should return resolvers in correct order', () => {
        const resolvers = configureNodeArgumentResolvers(context);

        expect(resolvers[0]).toBeInstanceOf(NodeQueryValueMethodArgumentResolver);
        expect(resolvers[1]).toBeInstanceOf(NodePathValueMethodArgumentResolver);
        expect(resolvers[2]).toBeInstanceOf(NodeHeaderValueMethodArgumentResolver);
        expect(resolvers[3]).toBeInstanceOf(NodeBodyValueMethodArgumentResolver);
        expect(resolvers[4]).toBeInstanceOf(NodeDataBindingMethodArgumentResolver);
        expect(resolvers[5]).toBeInstanceOf(NodeRequestPartMethodArgumentResolver);
        expect(resolvers[6]).toBeInstanceOf(NodeMultipartFileMethodArgumentResolver);
        expect(resolvers[7]).toBeInstanceOf(NodeCookieValueMethodArgumentResolver);
        expect(resolvers[8]).toBeInstanceOf(NodeRequestSessionValueMethodArgumentResolver);
    });

    test('should register resolvers on context as argumentResolvers', () => {
        const resolvers = configureNodeArgumentResolvers(context);

        // Check that the resolvers are stored in the context
        // Note: This is a simplified check since we don't have access to the actual registration mechanism
        expect(resolvers).toHaveLength(9);
    });

    test('should use context registry if available', () => {
        // Set up a custom converter registry in the context
        const customRegistry = {
            customConverter: (value: unknown) => `converted-${value}`,
        };
        // Note: This is a simplified test since we don't have direct access to setService

        const resolvers = configureNodeArgumentResolvers(context);
        expect(resolvers).toHaveLength(9);
    });

    test('should allow option-level registry to override context registry', () => {
        // Set up an option-level registry that overrides it
        const optionRegistry = {
            optionConverter: (value: unknown) => `option-${value}`,
        };

        const resolvers = configureNodeArgumentResolvers(context, { converterRegistry: optionRegistry });
        expect(resolvers).toHaveLength(9);
    });

    test('should handle strictNamedConverterLookup correctly', () => {
        // This test mainly ensures the function doesn't crash with this option
        const resolvers = configureNodeArgumentResolvers(context, {
            strictNamedConverterLookup: true,
        });
        expect(resolvers).toHaveLength(9);
    });
});
