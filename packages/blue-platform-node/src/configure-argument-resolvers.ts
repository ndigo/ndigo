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
 * Registers Node.js-specific argument resolvers into the application context.
 */
export function configureNodeArgumentResolvers(
    applicationContext: ApplicationContext,
    _options?: unknown
): HandlerMethodArgumentResolver[] {
    const resolvers: HandlerMethodArgumentResolver[] = [
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

    return registerArgumentResolvers(applicationContext, resolvers);
}
