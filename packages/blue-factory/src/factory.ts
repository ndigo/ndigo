// Barrel: the factory contract (interfaces, aware mixin, guards), the
// AbstractFactory implementation, and the concrete factories were split
// into cohesive modules. This file re-exports the exact original public
// API so intra-package imports of './factory' and the package index
// remain unchanged.

export {
    Factory,
    HierarchicalFactory,
    ConfigurableFactory,
    FactoryAware,
    AsFactoryAware,
    likeFactory,
    likeFactoryAware,
    likeHierarchicalFactory,
    likeConfigurableFactory,
} from './factory-contract';
export { AbstractFactory } from './abstract-factory';
export { DefaultFactory, ProxiedFactory } from './default-factory';
