/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { likeContentSourceAware, likeMessageSourceAware } from '@blue/content';
import { likeApplicationEventEmitterAware } from './event-emitter';
import { InitializationAwareProcessor, likeAware } from '@blue/factory';
import { likeEnvironmentAware } from './environment';
import { likeResourceLoaderAware } from './resource';
import { ApplicationContext, likeApplicationContextAware } from './context-interfaces';
import { defineProperty } from './context-shared';

/**
 * Create a new ApplicationContextAwareProcessor for the given context.
 * An {@link InitializationAwareProcessor|InitializationAwareProcessor} implementation that passes the ApplicationContext to value that implement the `EnvironmentAware`, `ResourceLoaderAware`, `ApplicationEventEmitterAware`, `ContentSourceAware`, `MessageSourceAware`, and/or `ApplicationContextAware` interfaces.
 */
export class ApplicationContextAwareProcessor implements InitializationAwareProcessor {
    readonly applicationContext!: ApplicationContext;

    /**
     * Creates a processor bound to a specific application context.
     *
     * @param applicationContext - The context to inject into aware values.
     */
    constructor(applicationContext: ApplicationContext) {
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

    /**
     * Returns the value unchanged after initialization.
     */
    processAfterInitialization<T = unknown>(name: string, value: T): T {
        return value;
    }

    /**
     * Injects the application context into aware values before initialization.
     *
     * @param name - The entry name.
     * @param value - The initialized value.
     */
    processBeforeInitialization<T = unknown>(name: string, value: T): T {
        if (likeAware(value)) {
            const { applicationContext } = this;
            // eslint-disable-next-line no-unused-expressions -- guarded dispatch: inject only into values implementing the contract
            likeEnvironmentAware(value) && value.setEnvironment(applicationContext.environment);
            // eslint-disable-next-line no-unused-expressions -- guarded dispatch: inject only into values implementing the contract
            likeResourceLoaderAware(value) && value.setResourceLoader(applicationContext);
            // eslint-disable-next-line no-unused-expressions -- guarded dispatch: inject only into values implementing the contract
            likeApplicationEventEmitterAware(value) && value.setApplicationEventEmitter(applicationContext);
            // eslint-disable-next-line no-unused-expressions -- guarded dispatch: inject only into values implementing the contract
            likeContentSourceAware(value) && value.setContentSource(applicationContext);
            // eslint-disable-next-line no-unused-expressions -- guarded dispatch: inject only into values implementing the contract
            likeMessageSourceAware(value) && value.setMessageSource(applicationContext);
            // eslint-disable-next-line no-unused-expressions -- guarded dispatch: inject only into values implementing the contract
            likeApplicationContextAware(value) && value.setApplicationContext(applicationContext);
        }
        return value;
    }
}
