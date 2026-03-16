/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { ArgumentValueConverterRegistry } from './argument-value-converter';

/**
 * Registers a named converter registry used by argument resolvers.
 */
export function configureArgumentValueConverterRegistry(
    applicationContext: ApplicationContext,
    registry: ArgumentValueConverterRegistry
): ArgumentValueConverterRegistry {
    applicationContext.setValue('argumentValueConverterRegistry', registry);

    return registry;
}
