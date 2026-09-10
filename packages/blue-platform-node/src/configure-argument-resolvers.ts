import { ApplicationContext } from '@blue/context';
import { HandlerMethodArgumentResolver } from '@blue/dispatcher';
import { NodeQueryValueMethodArgumentResolver } from './query-argument-resolver';
import { NodePathValueMethodArgumentResolver } from './path-argument-resolver';
import { NodeHeaderValueMethodArgumentResolver } from './header-argument-resolver';
import { NodeBodyValueMethodArgumentResolver } from './body-argument-resolver';
import { NodeCookieValueMethodArgumentResolver } from './cookie-argument-resolver';
import { NodeSessionValueMethodArgumentResolver } from './session-argument-resolver';

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
        new NodeCookieValueMethodArgumentResolver(),
        new NodeSessionValueMethodArgumentResolver(),
    ];

    applicationContext.setValue('argumentResolvers', resolvers);

    return resolvers;
}
