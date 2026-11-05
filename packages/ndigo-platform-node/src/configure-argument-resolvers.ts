/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ApplicationContext } from '@ndigo/context';
import {
    HandlerMethodArgumentResolver,
    PathValueMethodArgumentResolver,
    QueryValueMethodArgumentResolver,
    registerArgumentResolvers,
} from '@ndigo/dispatcher';
import { NodeHeaderValueMethodArgumentResolver } from './header-argument-resolver';
import { NodeBodyValueMethodArgumentResolver } from './body-argument-resolver';
import { NodeMultipartFileMethodArgumentResolver } from './multipart-file-argument-resolver';
import { NodeDataBindingMethodArgumentResolver } from './data-binding-argument-resolver';
import { NodeRequestPartMethodArgumentResolver } from './request-part-argument-resolver';
import { NodeCookieValueMethodArgumentResolver } from './cookie-argument-resolver';
import { NodeRequestSessionValueMethodArgumentResolver } from './request-session-argument-resolver';

/**
 * Builds the Node.js argument-resolver list in registration order (first
 * match wins). Single source of truth shared by
 * {@link configureNodeArgumentResolvers} and the auto-configuration entry, so
 * the two lists can never drift (HG-7).
 */
export function createNodeArgumentResolvers(): HandlerMethodArgumentResolver[] {
    return [
        // Query/path binding uses the dispatcher's platform-independent
        // defaults (DSV-DUP-1): the former Node shadows were byte-for-byte
        // behavioral duplicates.
        new QueryValueMethodArgumentResolver(),
        new PathValueMethodArgumentResolver(),
        new NodeHeaderValueMethodArgumentResolver(),
        new NodeBodyValueMethodArgumentResolver(),
        new NodeDataBindingMethodArgumentResolver(),
        new NodeRequestPartMethodArgumentResolver(),
        new NodeMultipartFileMethodArgumentResolver(),
        new NodeCookieValueMethodArgumentResolver(),
        new NodeRequestSessionValueMethodArgumentResolver(),
    ];
}

/**
 * Registers Node.js-specific argument resolvers into the application context.
 */
export function configureNodeArgumentResolvers(
    applicationContext: ApplicationContext,
    _options?: unknown
): HandlerMethodArgumentResolver[] {
    return registerArgumentResolvers(applicationContext, createNodeArgumentResolvers());
}
