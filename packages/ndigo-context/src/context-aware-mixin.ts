/**
 */
import { Constructable } from '@ndigo/core';
import { AsAware } from '@ndigo/factory';
import { ApplicationContext, ApplicationContextAware } from './context-interfaces';
import { defineProperty } from './context-shared';

/**
 * @see module:context.AsApplicationContextAware
 */
export const AsApplicationContextAware = <T extends Constructable>(
    superclass: T
): Constructable<ApplicationContextAware> & T =>
    class extends AsAware(superclass) implements ApplicationContextAware {
        readonly applicationContext?: ApplicationContext;

        /**
         * Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.
         *
         * Invoked after population of normal value properties but before an `init` callback.
         * @param context - The ApplicationContext to be used by this object.
         */
        setApplicationContext(applicationContext: ApplicationContext): void {
            /**
             * @readonly
             */
            defineProperty(this, 'applicationContext', {
                value: applicationContext,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };

/**
 * Base class for any object managed by the ApplicationContext.
 * Provides a standard way to access the application context.
 */
