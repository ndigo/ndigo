/**
 * @module ndigo-context
 * @since 1.0.0
 * @author Jeff Rose
 */
// Barrel: the application-context contract and implementations were split
// into cohesive modules (interfaces, GenericApplicationContext, proxied
// context, aware mixin + component bases, and the aware processor). This
// file re-exports the exact original public API so intra-package imports
// of './context' and the package index remain unchanged.

export {
    ApplicationContext,
    ApplicationContextAware,
    ConfigurableApplicationContext,
    likeApplicationContext,
    likeApplicationContextAware,
} from './context-interfaces';
export { GenericApplicationContext } from './generic-application-context';
export { ProxiedGenericApplicationContext } from './proxied-application-context';
export { AsApplicationContextAware } from './context-aware-mixin';
export { ApplicationComponent, BusinessComponent, ViewComponent } from './application-context-components';
export { ApplicationContextAwareProcessor } from './application-context-aware-processor';
