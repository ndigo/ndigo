/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { HandlerMethodArgumentResolver } from '@blue/dispatcher';
import { configureBrowserArgumentResolvers } from './configure-argument-resolvers';

/**
 * Registers browser argument resolvers.
 *
 * @param applicationContext - The application context to configure.
 * @param _options - Reserved for future use.
 * @returns The resolver instances registered with the context.
 */
export function configureStrictBrowserArgumentResolvers(
    applicationContext: ApplicationContext,
    _options?: unknown
): HandlerMethodArgumentResolver[] {
    return configureBrowserArgumentResolvers(applicationContext);
}
