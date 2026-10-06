/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { HandlerMethodArgumentResolver, registerArgumentResolvers } from '@blue/dispatcher';
import { NodeQueryValueMethodArgumentResolver } from './query-argument-resolver';
import { NodePathValueMethodArgumentResolver } from './path-argument-resolver';
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
        new NodeQueryValueMethodArgumentResolver(),
        new NodePathValueMethodArgumentResolver(),
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
