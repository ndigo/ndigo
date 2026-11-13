[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [dispatcher](../README.md) / AbstractDispatcher

# Class: AbstractDispatcher

An abstract, platform-independent application dispatcher.

Dispatches routes to registered handlers, providing mapping, interceptors,
error handling, and view rendering. It is DOM-free: the view target is
resolved from the application context, so browser and Node specializations
extend this base (e.g. `@ndigo/platform-web`'s `BrowserDispatcher` and
`@ndigo/platform-node`'s `NodeDispatcher`).

It can be used with just about any workflow, with the installation of the appropriate strategies and adapter classes.

## Extends

- [`ViewTargeterStrategy`](../../strategies/view-targeter-strategy/interfaces/ViewTargeterStrategy.md) & [`ViewResolverStrategy`](../../strategies/view-resolver-strategy/interfaces/ViewResolverStrategy.md) & [`RouteErrorResolverStrategy`](../../strategies/route-error-resolver-strategy/interfaces/RouteErrorResolverStrategy.md) & [`ThemeResolverStrategy`](../../strategies/theme-resolver-strategy/interfaces/ThemeResolverStrategy.md) & [`RouteToViewNameTranslatorStrategy`](../../strategies/route-to-view-name-translator-strategy/interfaces/RouteToViewNameTranslatorStrategy.md) & [`LanguageResolverStrategy`](../../strategies/language-resolver-strategy/interfaces/LanguageResolverStrategy.md) & [`RouteHandlerMappingStrategy`](../../strategies/route-handler-mapping-strategy/interfaces/RouteHandlerMappingStrategy.md) & [`RouteHandlerAdapterStrategy`](../../strategies/route-handler-adapter-strategy/interfaces/RouteHandlerAdapterStrategy.md) & [`StrategyInitializer`](../../strategies/strategy-initializer/interfaces/StrategyInitializer.md) & `Null`\<`this`\>

## Implements

- [`RouteDispatcher`](../interfaces/RouteDispatcher.md)
- [`RouteRenderer`](../interfaces/RouteRenderer.md)

## Constructors

### Constructor

> **new AbstractDispatcher**(): `AbstractDispatcher`

#### Returns

`AbstractDispatcher`

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).constructor`

## Properties

### applicationContext

> **applicationContext**: `ApplicationContext`

The application context.

***

### defaultViewName

> **defaultViewName**: `string` = `'index'`

The default view name to use if none is specified.

***

### errorResolvers

> **errorResolvers**: [`RouteErrorResolver`](../../route-error-resolver/interfaces/RouteErrorResolver.md)[]

The ordered error resolvers.

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).errorResolvers`

***

### handlerAdapters

> **handlerAdapters**: [`RouteHandlerAdapter`](../../route-handler-adapter/interfaces/RouteHandlerAdapter.md)[]

The ordered adapters consulted for a handler.

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).handlerAdapters`

***

### handlerMappings

> **handlerMappings**: [`RouteHandlerMapping`](../../abstract-handler-mapping/interfaces/RouteHandlerMapping.md)[]

The ordered mappings a route is resolved against.

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).handlerMappings`

***

### isAutoStartup

> `readonly` **isAutoStartup**: `true` = `true`

`SmartLifecycle` — dispatchers must initialize once the context refreshes.

***

### languageResolver

> **languageResolver**: [`LanguageResolver`](../../language-resolver/interfaces/LanguageResolver.md)

The active locale resolver.

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).languageResolver`

***

### phase

> `readonly` **phase**: `-90` = `-90`

`SmartLifecycle` — initialize after the handler mapping, before the server.

***

### routeToViewNameTranslator

> **routeToViewNameTranslator**: [`RouteToViewNameTranslator`](../../route-to-view-name-translator/interfaces/RouteToViewNameTranslator.md)

The translator that derives a view name from a route.

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).routeToViewNameTranslator`

***

### strategies

> **strategies**: `string`[]

Names of the strategies this composition contributes.

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).strategies`

***

### themeResolver

> **themeResolver**: [`ThemeResolver`](../../theme-resolver/interfaces/ThemeResolver.md)

The active theme resolver.

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).themeResolver`

***

### viewResolvers

> **viewResolvers**: `ViewResolver`[]

The ordered view resolvers.

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).viewResolvers`

***

### viewTargeters

> **viewTargeters**: `ViewTargeter`[]

The ordered view targeters.

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).viewTargeters`

## Accessors

### \[$aware\]

#### Get Signature

> **get** **\[$aware\]**(): `boolean`

Marks the value as `Aware` for the factory's aware injection, so the
application context is injected when the dispatcher is registered as an
entry.

##### Returns

`boolean`

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this dispatcher.

##### Returns

`string`

***

### isRunning

#### Get Signature

> **get** **isRunning**(): `boolean`

`SmartLifecycle` — whether the lifecycle has driven strategy init.

##### Returns

`boolean`

## Methods

### addStrategy()

> **addStrategy**(`name`): `void`

Records a strategy name to initialize later.

#### Parameters

##### name

`string`

The strategy name.

#### Returns

`void`

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).addStrategy`

***

### dispatch()

> **dispatch**(`route`): `Promise`\<`void`\>

Dispatches the given route for processing.

#### Parameters

##### route

[`Route`](#)

The route to dispatch.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the route is fully processed.

#### Implementation of

[`RouteDispatcher`](../interfaces/RouteDispatcher.md).[`dispatch`](../interfaces/RouteDispatcher.md#dispatch)

***

### getDefaultStrategy()

> **getDefaultStrategy**\<`T`\>(`context`, `key`, `strategy`): `T`

Installs a default strategy under a context key.

#### Type Parameters

##### T

`T`

#### Parameters

##### context

`ApplicationContext`

The application context.

##### key

`string`

The context key to register under.

##### strategy

`T`

The default strategy value.

#### Returns

`T`

The strategy now registered in the context.

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).getDefaultStrategy`

***

### getDefaultViewName()

> **getDefaultViewName**(`route`): `string`

Derives the default view name for a route.

#### Parameters

##### route

[`Route`](#)

The route to translate.

#### Returns

`string`

The default view name.

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).getDefaultViewName`

***

### getHandler()

> **getHandler**(`route`): [`default`](../../route-handler-execution-chain/classes/default.md)

Resolves a route to its execution chain.

#### Parameters

##### route

[`Route`](#)

The route to resolve.

#### Returns

[`default`](../../route-handler-execution-chain/classes/default.md)

The execution chain for the route.

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).getHandler`

***

### getHandlerAdapter()

> **getHandlerAdapter**(`handler`): [`RouteHandlerAdapter`](../../route-handler-adapter/interfaces/RouteHandlerAdapter.md)

Finds the adapter that supports a handler.

#### Parameters

##### handler

`object` \| `undefined`

The resolved handler.

#### Returns

[`RouteHandlerAdapter`](../../route-handler-adapter/interfaces/RouteHandlerAdapter.md)

The supporting adapter.

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).getHandlerAdapter`

***

### initCollectionStrategy()

> **initCollectionStrategy**\<`T`\>(`context`, `collectionStrategyKey`, `strategyKey`, `name`, `defaultStrategy`): `void`

Installs a collection strategy from the context or its default.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### context

`ApplicationContext`

The application context.

##### collectionStrategyKey

`string`

The context key holding the collection.

##### strategyKey

`string`

The context key holding a single strategy.

##### name

`string`

The instance property to assign.

##### defaultStrategy

`T`[]

The fallback collection.

#### Returns

`void`

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).initCollectionStrategy`

***

### initErrorResolvers()

> **initErrorResolvers**(`context`): `void`

Installs the error-resolver collection.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).initErrorResolvers`

***

### initHandlerAdapters()

> **initHandlerAdapters**(`context`): `void`

Installs the handler adapters from the context or the defaults.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).initHandlerAdapters`

***

### initHandlerMappings()

> **initHandlerMappings**(`context`): `void`

Installs the handler mappings from the context or the defaults.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).initHandlerMappings`

***

### initLanguageResolver()

> **initLanguageResolver**(`context`): `void`

Builds and installs the language resolver.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).initLanguageResolver`

***

### initRouteToViewNameTranslator()

> **initRouteToViewNameTranslator**(`context`): `void`

Installs the view-name translator.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).initRouteToViewNameTranslator`

***

### initStrategies()

> **initStrategies**(`context`): `void`

Runs the `init<Strategy>` initializer for every recorded strategy.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).initStrategies`

***

### initStrategy()

> **initStrategy**\<`T`\>(`context`, `strategyKey`, `name`, `defaultStrategy`): `void`

Installs a single strategy from the context or its default.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### context

`ApplicationContext`

The application context.

##### strategyKey

`string`

The context key holding the strategy.

##### name

`string`

The instance property to assign.

##### defaultStrategy

`T`

The fallback strategy.

#### Returns

`void`

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).initStrategy`

***

### initThemeResolver()

> **initThemeResolver**(`context`): `void`

Builds and installs the theme resolver.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).initThemeResolver`

***

### initViewResolvers()

> **initViewResolvers**(`context`): `void`

Installs the view-resolver chain.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).initViewResolvers`

***

### initViewTargeters()

> **initViewTargeters**(`context`): `void`

Installs the view-targeter chain.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`

#### Inherited from

`AsViewTargeterStrategy( AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ) ).initViewTargeters`

***

### render()

> **render**(`mv`, `route`): `Promise`\<`void`\>

Render the given `ModelAndView`. This is the last stage of handling a route.

The shared pipeline: normalize the result, resolve a view (unless the
result already carries one), give document-producing platforms a chance
to write the whole document, otherwise resolve a target and render into
it.

#### Parameters

##### mv

[`ModelAndView`](../../model-and-view/classes/ModelAndView.md)

The [ModelAndView](../../model-and-view/classes/ModelAndView.md) to render.

##### route

[`Route`](#)

The route associated with the [ModelAndView](../../model-and-view/classes/ModelAndView.md).

#### Returns

`Promise`\<`void`\>

A promise that resolves once the view has rendered.

#### Implementation of

[`RouteRenderer`](../interfaces/RouteRenderer.md).[`render`](../interfaces/RouteRenderer.md#render)

***

### setApplicationContext()

> **setApplicationContext**(`context`): `void`

Injects the owning application context, used by [start](#start) to
initialize strategies.

#### Parameters

##### context

`ApplicationContext`

The application context that owns this dispatcher.

#### Returns

`void`

***

### start()

> **start**(): `void`

`SmartLifecycle` — initialize strategies from the application context.
Runs on refresh, after every configuration has registered.

#### Returns

`void`

***

### stop()

> **stop**(): `void`

`SmartLifecycle` — strategies are immutable once initialized; nothing to
release. Present so this type is a well-behaved lifecycle entry.

#### Returns

`void`
