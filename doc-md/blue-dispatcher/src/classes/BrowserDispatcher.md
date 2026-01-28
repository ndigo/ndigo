[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / BrowserDispatcher

# Class: BrowserDispatcher

Defined in: packages/blue-dispatcher/src/dispatcher.ts:76

Dispatcher for brower-based handlers.
* It can use any RouteHandlerMapping\|RouteHandlerMapping implementation - pre-built or provided as part of an application - to control the routing of routes to handlers. Default is NamePathHandlerMapping\|NamePathHandlerMapping and MetadataHandlerMapping\|MetadataHandlerMapping. HandlerMapping objects can be defined as values in the application context, implementing the HandlerMapping interface, overriding the default HandlerMapping if present. HandlerMappings can be given any value name.
* It can use any HandlerAdapter\|HandlerAdapter; this allows for using any handler interface. Default adapters are MetadataHandlerAdapter\|MetadataHandlerAdapter, ControllerHandlerAdapter\|ControllerHandlerAdapter, for RouteMappingHandler\|RouteMappingHandler and Controller\|Controller interfaces, respectively. A default MetadataHandlerAdapter\|MetadataHandlerAdapter will be registered as well. RouteHandlerAdapter objects can be added as values in the application context, overriding the default RouteHandlerAdapters. Like HandlerMappings, RouteHandlerAdapters can be given any name.
* The dispatcher's error resolution strategy can be specified via a RouteHandlerErrorResolver\|HandlerErrorResolver, for example mapping certain exceptions to error pages. Default is DefaultRouteHandlerErrorResolver\|DefaultRouteHandlerErrorResolver. HandlerErrorResolvers can be overridden through the application context. HandlerErrorResolver can be given any name.
* Its view resolution strategy can be specified via a ViewResolver\|ViewResolver implementation, resolving symbolic view names into [View](../../../blue-view/src/interfaces/View.md) objects. Default is InternalResourceViewResolver\|InternalResourceViewResolver. ViewResolver objects can be added as values in the application context, overriding the default ViewResolver. ViewResolvers can be given any name.
* Its language resolution strategy is determined by a LanguageResolver\|LanguageResolver. The out-of-the-box implementation works via [https://developer.mozilla.org/en-US/docs/Web/API/Navigator\|navigator](https://developer.mozilla.org/en-US/docs/Web/API/Navigator|navigator) object. The LanguageResolver name is "languageResolver"; default is NavigatorLanguageResolver\|NavigatorLanguageResolver.
* Its theme resolution strategy is determined by a ThemeResolver\|ThemeResolver. Implementations for a fixed theme and cookie resolved theme are included. The ThemeResolver name is "themeResolver"; default is FixedThemeResolver\|FixedThemeResolver.

## See

 - module:dispatcher.AsRouteHandlerAdapterStrategy
 - module:dispatcher.AsRouteHandlerMappingStrategy
 - module:dispatcher.AsRouteErrorResolverStrategy
 - module:dispatcher.AsLanguageResolverStrategy
 - module:dispatcher.AsRouteToViewNameTranslatorStrategy
 - module:dispatcher.AsThemeResolverStrategy
 - module:dispatcher.AsViewMappingStrategy
 - module:dispatcher.AsViewResolverStrategy

## Extends

- `ViewResolverStrategy` & `RouteErrorResolverStrategy` & `ThemeResolverStrategy` & `RouteToViewNameTranslatorStrategy` & `LanguageResolverStrategy` & `RouteHandlerMappingStrategy` & `RouteHandlerAdapterStrategy` & `StrategyInitializer` & [`Null`](../../../blue-core/src/classes/Null.md)\<`this`\>

## Implements

- [`RouteDispatcher`](../interfaces/RouteDispatcher.md)
- [`RouteRenderer`](../interfaces/RouteRenderer.md)

## Constructors

### Constructor

> **new BrowserDispatcher**(): `BrowserDispatcher`

#### Returns

`BrowserDispatcher`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).constructor`

## Properties

### defaultViewName

> **defaultViewName**: `string` = `'index'`

Defined in: packages/blue-dispatcher/src/dispatcher.ts:90

***

### languageResolver

> **languageResolver**: [`LanguageResolver`](../interfaces/LanguageResolver.md)

Defined in: packages/blue-dispatcher/src/strategies/language-resolver-strategy.ts:11

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).languageResolver`

***

### errorResolvers

> **errorResolvers**: [`RouteErrorResolver`](../interfaces/RouteErrorResolver.md)[]

Defined in: packages/blue-dispatcher/src/strategies/route-error-resolver-strategy.ts:11

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).errorResolvers`

***

### handlerAdapters

> **handlerAdapters**: [`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md)[]

Defined in: packages/blue-dispatcher/src/strategies/route-handler-adapter-strategy.ts:11

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).handlerAdapters`

***

### handlerMappings

> **handlerMappings**: [`RouteHandlerMapping`](../interfaces/RouteHandlerMapping.md)[]

Defined in: packages/blue-dispatcher/src/strategies/route-handler-mapping-strategy.ts:13

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).handlerMappings`

***

### routeToViewNameTranslator

> **routeToViewNameTranslator**: [`RouteToViewNameTranslator`](../interfaces/RouteToViewNameTranslator.md)

Defined in: packages/blue-dispatcher/src/strategies/route-to-view-name-translator-strategy.ts:12

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).routeToViewNameTranslator`

***

### strategies

> **strategies**: `string`[]

Defined in: packages/blue-dispatcher/src/strategies/strategy-initializer.ts:10

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).strategies`

***

### themeResolver

> **themeResolver**: [`ThemeResolver`](../interfaces/ThemeResolver.md)

Defined in: packages/blue-dispatcher/src/strategies/theme-resolver-strategy.ts:11

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).themeResolver`

***

### viewResolvers

> **viewResolvers**: [`ViewResolver`](../../../blue-view/src/interfaces/ViewResolver.md)[]

Defined in: packages/blue-dispatcher/src/strategies/view-resolver-strategy.ts:11

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).viewResolvers`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/dispatcher.ts:92

##### Returns

`string`

## Methods

### dispatch()

> **dispatch**(`route`): `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/src/dispatcher.ts:96

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RouteDispatcher`](../interfaces/RouteDispatcher.md).[`dispatch`](../interfaces/RouteDispatcher.md#dispatch)

***

### render()

> **render**(`mv`, `route`): `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/src/dispatcher.ts:135

Render the given `ModelAndView`. This is the last stage of handling a route.
    *

#### Parameters

##### mv

[`ModelAndView`](ModelAndView.md)

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RouteRenderer`](../interfaces/RouteRenderer.md).[`render`](../interfaces/RouteRenderer.md#render)

***

### \_processHandlerError()

> `protected` **\_processHandlerError**(`route`, `handler`, `error`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/dispatcher.ts:163

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### handler

`any`

##### error

`Error`

#### Returns

[`ModelAndView`](ModelAndView.md)

***

### \_resolveViewName()

> `protected` **\_resolveViewName**(`viewName`, `language`): `Promise`\<[`View`](../../../blue-view/src/interfaces/View.md)\>

Defined in: packages/blue-dispatcher/src/dispatcher.ts:182

#### Parameters

##### viewName

`string`

##### language

`string`

#### Returns

`Promise`\<[`View`](../../../blue-view/src/interfaces/View.md)\>

***

### initLanguageResolver()

> **initLanguageResolver**(`context`): `void`

Defined in: packages/blue-dispatcher/src/strategies/language-resolver-strategy.ts:12

#### Parameters

##### context

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initLanguageResolver`

***

### initErrorResolvers()

> **initErrorResolvers**(`context`): `void`

Defined in: packages/blue-dispatcher/src/strategies/route-error-resolver-strategy.ts:12

#### Parameters

##### context

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initErrorResolvers`

***

### initHandlerAdapters()

> **initHandlerAdapters**(`context`): `void`

Defined in: packages/blue-dispatcher/src/strategies/route-handler-adapter-strategy.ts:12

#### Parameters

##### context

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initHandlerAdapters`

***

### getHandlerAdapter()

> **getHandlerAdapter**(`handler`): [`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md)

Defined in: packages/blue-dispatcher/src/strategies/route-handler-adapter-strategy.ts:13

#### Parameters

##### handler

`any`

#### Returns

[`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md)

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).getHandlerAdapter`

***

### initHandlerMappings()

> **initHandlerMappings**(`context`): `void`

Defined in: packages/blue-dispatcher/src/strategies/route-handler-mapping-strategy.ts:14

#### Parameters

##### context

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initHandlerMappings`

***

### getHandler()

> **getHandler**(`route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/strategies/route-handler-mapping-strategy.ts:15

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`RouteHandlerExecutionChain`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).getHandler`

***

### initRouteToViewNameTranslator()

> **initRouteToViewNameTranslator**(`context`): `void`

Defined in: packages/blue-dispatcher/src/strategies/route-to-view-name-translator-strategy.ts:13

#### Parameters

##### context

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initRouteToViewNameTranslator`

***

### getDefaultViewName()

> **getDefaultViewName**(`route`): `string`

Defined in: packages/blue-dispatcher/src/strategies/route-to-view-name-translator-strategy.ts:14

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`string`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).getDefaultViewName`

***

### addStrategy()

> **addStrategy**(`name`): `void`

Defined in: packages/blue-dispatcher/src/strategies/strategy-initializer.ts:11

#### Parameters

##### name

`string`

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).addStrategy`

***

### getDefaultStrategy()

> **getDefaultStrategy**\<`T`\>(`context`, `key`, `strategy`): `T`

Defined in: packages/blue-dispatcher/src/strategies/strategy-initializer.ts:12

#### Type Parameters

##### T

`T`

#### Parameters

##### context

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

##### key

`string`

##### strategy

`T`

#### Returns

`T`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).getDefaultStrategy`

***

### initStrategies()

> **initStrategies**(`context`): `void`

Defined in: packages/blue-dispatcher/src/strategies/strategy-initializer.ts:13

#### Parameters

##### context

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initStrategies`

***

### initCollectionStrategy()

> **initCollectionStrategy**\<`T`\>(`context`, `collectionStrategyKey`, `strategyKey`, `name`, `defaultStrategy`): `void`

Defined in: packages/blue-dispatcher/src/strategies/strategy-initializer.ts:14

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### context

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

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

### initStrategy()

> **initStrategy**\<`T`\>(`context`, `strategyKey`, `name`, `defaultStrategy`): `void`

Defined in: packages/blue-dispatcher/src/strategies/strategy-initializer.ts:21

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### context

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

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

Defined in: packages/blue-dispatcher/src/strategies/theme-resolver-strategy.ts:12

#### Parameters

##### context

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initThemeResolver`

***

### initViewResolvers()

> **initViewResolvers**(`context`): `void`

Defined in: packages/blue-dispatcher/src/strategies/view-resolver-strategy.ts:12

#### Parameters

##### context

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initViewResolvers`
