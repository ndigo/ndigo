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

- [`ViewResolverStrategy`](../../strategies/view-resolver-strategy/interfaces/ViewResolverStrategy.md) & [`RouteErrorResolverStrategy`](../../strategies/route-error-resolver-strategy/interfaces/RouteErrorResolverStrategy.md) & [`ThemeResolverStrategy`](../../strategies/theme-resolver-strategy/interfaces/ThemeResolverStrategy.md) & [`RouteToViewNameTranslatorStrategy`](../../strategies/route-to-view-name-translator-strategy/interfaces/RouteToViewNameTranslatorStrategy.md) & [`LanguageResolverStrategy`](../../strategies/language-resolver-strategy/interfaces/LanguageResolverStrategy.md) & [`RouteHandlerMappingStrategy`](../../strategies/route-handler-mapping-strategy/interfaces/RouteHandlerMappingStrategy.md) & [`RouteHandlerAdapterStrategy`](../../strategies/route-handler-adapter-strategy/interfaces/RouteHandlerAdapterStrategy.md) & [`StrategyInitializer`](../../strategies/strategy-initializer/interfaces/StrategyInitializer.md) & `Null`\<`this`\>

## Implements

- [`RouteDispatcher`](../interfaces/RouteDispatcher.md)
- [`RouteRenderer`](../interfaces/RouteRenderer.md)

## Constructors

### Constructor

> **new AbstractDispatcher**(): `AbstractDispatcher`

#### Returns

`AbstractDispatcher`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).constructor`

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

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).errorResolvers`

***

### handlerAdapters

> **handlerAdapters**: [`RouteHandlerAdapter`](../../route-handler-adapter/interfaces/RouteHandlerAdapter.md)[]

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).handlerAdapters`

***

### handlerMappings

> **handlerMappings**: [`RouteHandlerMapping`](../../abstract-handler-mapping/interfaces/RouteHandlerMapping.md)[]

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).handlerMappings`

***

### isAutoStartup

> `readonly` **isAutoStartup**: `true` = `true`

`SmartLifecycle` — dispatchers must initialize once the context refreshes.

***

### languageResolver

> **languageResolver**: [`LanguageResolver`](../../language-resolver/interfaces/LanguageResolver.md)

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).languageResolver`

***

### phase

> `readonly` **phase**: `-90` = `-90`

`SmartLifecycle` — initialize after the handler mapping, before the server.

***

### routeToViewNameTranslator

> **routeToViewNameTranslator**: [`RouteToViewNameTranslator`](../../route-to-view-name-translator/interfaces/RouteToViewNameTranslator.md)

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).routeToViewNameTranslator`

***

### strategies

> **strategies**: `string`[]

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).strategies`

***

### themeResolver

> **themeResolver**: [`ThemeResolver`](../../theme-resolver/interfaces/ThemeResolver.md)

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).themeResolver`

***

### viewResolvers

> **viewResolvers**: `ViewResolver`[]

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).viewResolvers`

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

#### Parameters

##### name

`string`

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).addStrategy`

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

#### Implementation of

[`RouteDispatcher`](../interfaces/RouteDispatcher.md).[`dispatch`](../interfaces/RouteDispatcher.md#dispatch)

***

### getDefaultStrategy()

> **getDefaultStrategy**\<`T`\>(`context`, `key`, `strategy`): `T`

#### Type Parameters

##### T

`T`

#### Parameters

##### context

`ApplicationContext`

##### key

`string`

##### strategy

`T`

#### Returns

`T`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).getDefaultStrategy`

***

### getDefaultViewName()

> **getDefaultViewName**(`route`): `string`

#### Parameters

##### route

[`Route`](#)

#### Returns

`string`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).getDefaultViewName`

***

### getHandler()

> **getHandler**(`route`): [`default`](../../route-handler-execution-chain/classes/default.md)

#### Parameters

##### route

[`Route`](#)

#### Returns

[`default`](../../route-handler-execution-chain/classes/default.md)

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).getHandler`

***

### getHandlerAdapter()

> **getHandlerAdapter**(`handler`): [`RouteHandlerAdapter`](../../route-handler-adapter/interfaces/RouteHandlerAdapter.md)

#### Parameters

##### handler

`object` \| `undefined`

#### Returns

[`RouteHandlerAdapter`](../../route-handler-adapter/interfaces/RouteHandlerAdapter.md)

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).getHandlerAdapter`

***

### initCollectionStrategy()

> **initCollectionStrategy**\<`T`\>(`context`, `collectionStrategyKey`, `strategyKey`, `name`, `defaultStrategy`): `void`

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### context

`ApplicationContext`

##### collectionStrategyKey

`string`

##### strategyKey

`string`

##### name

`string`

##### defaultStrategy

`T`[]

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initCollectionStrategy`

***

### initErrorResolvers()

> **initErrorResolvers**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initErrorResolvers`

***

### initHandlerAdapters()

> **initHandlerAdapters**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initHandlerAdapters`

***

### initHandlerMappings()

> **initHandlerMappings**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initHandlerMappings`

***

### initLanguageResolver()

> **initLanguageResolver**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initLanguageResolver`

***

### initRouteToViewNameTranslator()

> **initRouteToViewNameTranslator**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initRouteToViewNameTranslator`

***

### initStrategies()

> **initStrategies**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initStrategies`

***

### initStrategy()

> **initStrategy**\<`T`\>(`context`, `strategyKey`, `name`, `defaultStrategy`): `void`

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### context

`ApplicationContext`

##### strategyKey

`string`

##### name

`string`

##### defaultStrategy

`T`

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initStrategy`

***

### initThemeResolver()

> **initThemeResolver**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initThemeResolver`

***

### initViewResolvers()

> **initViewResolvers**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initViewResolvers`

***

### render()

> **render**(`mv`, `route`): `Promise`\<`void`\>

Render the given `ModelAndView`. This is the last stage of handling a route.

#### Parameters

##### mv

[`ModelAndView`](../../model-and-view/classes/ModelAndView.md)

The [ModelAndView](../../model-and-view/classes/ModelAndView.md) to render.

##### route

[`Route`](#)

The route associated with the [ModelAndView](../../model-and-view/classes/ModelAndView.md).

#### Returns

`Promise`\<`void`\>

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
release. Present so this type is a well-behaved lifecycle bean.

#### Returns

`void`
