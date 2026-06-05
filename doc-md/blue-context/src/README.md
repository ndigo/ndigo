[**BlueJS Framework v0.0.1**](../../README.md)

***

[BlueJS Framework](../../modules.md) / blue-context/src

# blue-context/src

## Classes

- [ConfigurationProcessor](classes/ConfigurationProcessor.md)
- [MetadataConfigApplicationContext](classes/MetadataConfigApplicationContext.md)
- [GenericApplicationContext](classes/GenericApplicationContext.md)
- [ProxiedGenericApplicationContext](classes/ProxiedGenericApplicationContext.md)
- [ApplicationContextAwareProcessor](classes/ApplicationContextAwareProcessor.md)
- [AbstractEnvironment](classes/AbstractEnvironment.md)
- [MockEnvironment](classes/MockEnvironment.md)
- [StandardEnvironment](classes/StandardEnvironment.md)
- [Emitter](classes/Emitter.md)
- [PermissiveRelayValidationStrategy](classes/PermissiveRelayValidationStrategy.md)
- [NamespaceRelayValidationStrategy](classes/NamespaceRelayValidationStrategy.md)
- [InvalidRelayError](classes/InvalidRelayError.md)
- [ContextEventGateway](classes/ContextEventGateway.md)
- [FeatureContextMountManager](classes/FeatureContextMountManager.md)
- [PrototypalPropertyResolver](classes/PrototypalPropertyResolver.md)
- [URLResource](classes/URLResource.md)
- [UnresolvedResource](classes/UnresolvedResource.md)
- [DefaultResourceLoader](classes/DefaultResourceLoader.md)
- [ContextToken](classes/ContextToken.md)

## Interfaces

- [ShellContextOptions](interfaces/ShellContextOptions.md)
- [FeatureContextOptions](interfaces/FeatureContextOptions.md)
- [FeatureContextComposition](interfaces/FeatureContextComposition.md)
- [ApplicationContext](interfaces/ApplicationContext.md)
- [ApplicationContextAware](interfaces/ApplicationContextAware.md)
- [ConfigurableApplicationContext](interfaces/ConfigurableApplicationContext.md)
- [Environment](interfaces/Environment.md)
- [EnvironmentAware](interfaces/EnvironmentAware.md)
- [EnvironmentSource](interfaces/EnvironmentSource.md)
- [ConfigurableEnvironment](interfaces/ConfigurableEnvironment.md)
- [EventEmitter](interfaces/EventEmitter.md)
- [AsyncEventEmitter](interfaces/AsyncEventEmitter.md)
- [ConditionalEventEmitter](interfaces/ConditionalEventEmitter.md)
- [PositionalEventEmitter](interfaces/PositionalEventEmitter.md)
- [ApplicationEventEmitterAware](interfaces/ApplicationEventEmitterAware.md)
- [ContextEventRelay](interfaces/ContextEventRelay.md)
- [RelayValidationResult](interfaces/RelayValidationResult.md)
- [RelayValidationStrategy](interfaces/RelayValidationStrategy.md)
- [GatewayDiagnosticHandler](interfaces/GatewayDiagnosticHandler.md)
- [ContextEventGatewayOptions](interfaces/ContextEventGatewayOptions.md)
- [NamespaceRelayValidationOptions](interfaces/NamespaceRelayValidationOptions.md)
- [FeatureRegistrationOptions](interfaces/FeatureRegistrationOptions.md)
- [FeatureContextMountManagerOptions](interfaces/FeatureContextMountManagerOptions.md)
- [PropertyResolver](interfaces/PropertyResolver.md)
- [ConfigurablePropertyResolver](interfaces/ConfigurablePropertyResolver.md)
- [Resource](interfaces/Resource.md)
- [ResourceLoader](interfaces/ResourceLoader.md)
- [ResourceLoaderAware](interfaces/ResourceLoaderAware.md)
- [FeatureMetricRecorder](interfaces/FeatureMetricRecorder.md)

## Type Aliases

- [FeatureUnmountPolicy](type-aliases/FeatureUnmountPolicy.md)
- [EventListener](type-aliases/EventListener.md)
- [EventHandler](type-aliases/EventHandler.md)
- [EventHandlers](type-aliases/EventHandlers.md)
- [EventType](type-aliases/EventType.md)
- [EventEmitterTarget](type-aliases/EventEmitterTarget.md)

## Variables

- [likeApplicationContext](variables/likeApplicationContext.md)
- [likeApplicationContextAware](variables/likeApplicationContextAware.md)
- [likeEnvironment](variables/likeEnvironment.md)
- [likeEnvironmentAware](variables/likeEnvironmentAware.md)
- [likeEnvironmentSource](variables/likeEnvironmentSource.md)
- [likeApplicationEventEmitterAware](variables/likeApplicationEventEmitterAware.md)
- [likeEventEmitter](variables/likeEventEmitter.md)
- [likePropertyResolver](variables/likePropertyResolver.md)
- [likeResource](variables/likeResource.md)
- [likeResourceLoader](variables/likeResourceLoader.md)
- [likeResourceLoaderAware](variables/likeResourceLoaderAware.md)
- [isContextToken](variables/isContextToken.md)

## Functions

- [configuration](functions/configuration.md)
- [profile](functions/profile.md)
- [property](functions/property.md)
- [propertySource](functions/propertySource.md)
- [entry](functions/entry.md)
- [createShellContext](functions/createShellContext.md)
- [createFeatureContext](functions/createFeatureContext.md)
- [unmountFeatureContext](functions/unmountFeatureContext.md)
- [traverseToRoot](functions/traverseToRoot.md)
- [traverseSubtree](functions/traverseSubtree.md)
- [findAncestor](functions/findAncestor.md)
- [findDescendants](functions/findDescendants.md)
- [AsApplicationContextAware](functions/AsApplicationContextAware.md)
- [AsEnvironmentAware](functions/AsEnvironmentAware.md)
- [AsAsyncEventEmitter](functions/AsAsyncEventEmitter.md)
- [AsConditionalEventEmitter](functions/AsConditionalEventEmitter.md)
- [AsPositionalEventEmitter](functions/AsPositionalEventEmitter.md)
- [AsEventEmitter](functions/AsEventEmitter.md)
- [asEventEmitter](functions/asEventEmitter-1.md)
- [AsResourceLoaderAware](functions/AsResourceLoaderAware.md)
- [AsModuleResourceLoader](functions/AsModuleResourceLoader.md)
