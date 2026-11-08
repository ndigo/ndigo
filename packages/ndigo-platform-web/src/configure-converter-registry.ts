/**
 * Configures the browser argument value converter registry.
 */
import { ApplicationContext } from '@ndigo/context';
import { ArgumentValueConverterRegistry } from '@ndigo/dispatcher';

/**
 * Registers a named converter registry used by argument resolvers.
 *
 * @param applicationContext - The application context to update.
 * @param registry - The converter registry to expose.
 * @returns The registered converter registry.
 */
export function configureArgumentValueConverterRegistry(
    applicationContext: ApplicationContext,
    registry: ArgumentValueConverterRegistry
): ArgumentValueConverterRegistry {
    applicationContext.setValue('argumentValueConverterRegistry', registry);

    return registry;
}
