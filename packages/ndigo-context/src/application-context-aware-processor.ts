/**
 * Aware-processor mixin that injects the application context.
 */
import { likeContentSourceAware, likeMessageSourceAware } from '@ndigo/content';
import { likeLockDriverAware } from '@ndigo/locks';
import { likeRateLimiterAware } from '@ndigo/rate-limit';
import { likeHttpAware } from '@ndigo/http';
import { likeApplicationEventEmitterAware } from './event-emitter';
import { InitializationAwareProcessor, likeAware } from '@ndigo/factory';
import { likeEnvironmentAware } from './environment';
import { likeResourceLoaderAware } from './resource';
import { ApplicationContext, likeApplicationContextAware } from './context-interfaces';
import { defineProperty } from './context-shared';

/**
 * Create a new ApplicationContextAwareProcessor for the given context.
 * An {@link InitializationAwareProcessor|InitializationAwareProcessor} implementation that passes the ApplicationContext to value that implement the `EnvironmentAware`, `ResourceLoaderAware`, `ApplicationEventEmitterAware`, `ContentSourceAware`, `MessageSourceAware`, and/or `ApplicationContextAware` interfaces.
 */
export class ApplicationContextAwareProcessor implements InitializationAwareProcessor {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ApplicationContextAwareProcessor".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ApplicationContextAwareProcessor]"
     */
    get [Symbol.toStringTag](): string {
        return 'ApplicationContextAwareProcessor';
    }

    /** The application context injected into aware values. */
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
     * @param name - The entry name.
     * @param value - The entry value.
     * @returns The unchanged value.
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

            if (likeLockDriverAware(value) && applicationContext.hasValue('lockDriver')) {
                value.setLockDriver(applicationContext.getValue('lockDriver'));
            }
            if (likeRateLimiterAware(value) && applicationContext.hasValue('rateLimiter')) {
                value.setRateLimiter(applicationContext.getValue('rateLimiter'));
            }
            if (likeHttpAware(value) && applicationContext.hasValue('http')) {
                value.setHttp(applicationContext.getValue('http'));
            }

            const cacheManagerAware = value as { setCacheManager?: (manager: unknown) => void };
            if (
                typeof cacheManagerAware.setCacheManager === 'function' &&
                applicationContext.hasValue('cacheManager')
            ) {
                cacheManagerAware.setCacheManager(applicationContext.getValue('cacheManager'));
            }
            const conversionAware = value as { setConversionService?: (service: unknown) => void };
            if (
                typeof conversionAware.setConversionService === 'function' &&
                applicationContext.hasValue('conversionService')
            ) {
                conversionAware.setConversionService(applicationContext.getValue('conversionService'));
            }
            const socketRegistryAware = value as { setSocketSessionRegistry?: (registry: unknown) => void };
            if (
                typeof socketRegistryAware.setSocketSessionRegistry === 'function' &&
                applicationContext.hasValue('socketSessionRegistry')
            ) {
                socketRegistryAware.setSocketSessionRegistry(applicationContext.getValue('socketSessionRegistry'));
            }
            const metricAggregatorAware = value as { setFeatureMetricAggregator?: (aggregator: unknown) => void };
            if (
                typeof metricAggregatorAware.setFeatureMetricAggregator === 'function' &&
                applicationContext.hasValue('metricAggregator')
            ) {
                metricAggregatorAware.setFeatureMetricAggregator(applicationContext.getValue('metricAggregator'));
            }
            const healthRegistryAware = value as { setHealthRegistry?: (registry: unknown) => void };
            if (
                typeof healthRegistryAware.setHealthRegistry === 'function' &&
                applicationContext.hasValue('healthRegistry')
            ) {
                healthRegistryAware.setHealthRegistry(applicationContext.getValue('healthRegistry'));
            }
            const dataSourceAware = value as { setDataSource?: (dataSource: unknown) => void };
            if (typeof dataSourceAware.setDataSource === 'function' && applicationContext.hasValue('dataSource')) {
                dataSourceAware.setDataSource(applicationContext.getValue('dataSource'));
            }

            const authServerAware = value as { setAuthServer?: (authServer: unknown) => void };
            if (typeof authServerAware.setAuthServer === 'function' && applicationContext.hasValue('authServer')) {
                authServerAware.setAuthServer(applicationContext.getValue('authServer'));
            }
            const passwordEncoderAware = value as { setPasswordEncoder?: (encoder: unknown) => void };
            if (
                typeof passwordEncoderAware.setPasswordEncoder === 'function' &&
                applicationContext.hasValue('passwordEncoder')
            ) {
                passwordEncoderAware.setPasswordEncoder(applicationContext.getValue('passwordEncoder'));
            }
            const sessionStoreAware = value as { setSessionStore?: (store: unknown) => void };
            if (
                typeof sessionStoreAware.setSessionStore === 'function' &&
                applicationContext.hasValue('sessionStore')
            ) {
                sessionStoreAware.setSessionStore(applicationContext.getValue('sessionStore'));
            }
            const userStoreAware = value as { setUserStore?: (store: unknown) => void };
            if (typeof userStoreAware.setUserStore === 'function' && applicationContext.hasValue('userStore')) {
                userStoreAware.setUserStore(applicationContext.getValue('userStore'));
            }
        }
        return value;
    }
}
