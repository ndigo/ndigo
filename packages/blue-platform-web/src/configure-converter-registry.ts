import { ApplicationContext } from '@blue/context';
import { ArgumentValueConverterRegistry } from './argument-value-converter';

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
