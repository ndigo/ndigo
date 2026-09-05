[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractDispatcher

# Class: AbstractDispatcher

Defined in: packages/blue-dispatcher/src/dispatcher.ts:58

An abstract, platform-independent application dispatcher.

Dispatches routes to registered handlers, providing mapping, interceptors,
error handling, and view rendering. It is DOM-free: the view target is
resolved from the application context, so browser and Node specializations
extend this base (e.g. `@blue/platform-web`'s `BrowserDispatcher` and
`@blue/platform-node`'s `NodeDispatcher`).

It can be used with just about any workflow, with the installation of the appropriate strategies and adapter classes.

## Extends

- `ViewResolverStrategy` & `RouteErrorResolverStrategy` & `ThemeResolverStrategy` & `RouteToViewNameTranslatorStrategy` & `LanguageResolverStrategy` & `RouteHandlerMappingStrategy` & `RouteHandlerAdapterStrategy` & `StrategyInitializer` & `Null`\<`this`\>

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

Defined in: packages/blue-dispatcher/src/dispatcher.ts:75

The application context.

***

### defaultViewName

> **defaultViewName**: `string` = `'index'`

Defined in: packages/blue-dispatcher/src/dispatcher.ts:79

The default view name to use if none is specified.

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

Defined in: packages/blue-dispatcher/src/strategies/route-handler-mapping-strategy.ts:14

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

Defined in: packages/blue-dispatcher/src/strategies/theme-resolver-strategy.ts:12

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).themeResolver`

***

### viewResolvers

> **viewResolvers**: `ViewResolver`[]

Defined in: packages/blue-dispatcher/src/strategies/view-resolver-strategy.ts:11

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).viewResolvers`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/dispatcher.ts:85

Returns the string tag for this dispatcher.

##### Returns

`string`

## Methods

### dispatch()

> **dispatch**(`route`): `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/src/dispatcher.ts:97

Dispatches the given route for processing.

#### Parameters

##### route

`Route`

The route to dispatch.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RouteDispatcher`](../interfaces/RouteDispatcher.md).[`dispatch`](../interfaces/RouteDispatcher.md#dispatch)

***

### render()

> **render**(`mv`, `route`): `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/src/dispatcher.ts:129

Render the given `ModelAndView`. This is the last stage of handling a route.

#### Parameters

##### mv

[`ModelAndView`](ModelAndView.md)

The [ModelAndView](ModelAndView.md) to render.

##### route

`Route`

The route associated with the [ModelAndView](ModelAndView.md).

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RouteRenderer`](../interfaces/RouteRenderer.md).[`render`](../interfaces/RouteRenderer.md#render)

***

### \_processHandlerError()

> `protected` **\_processHandlerError**(`route`, `handler`, `error`): [`ModelAndView`](ModelAndView.md) \| `null`

Defined in: packages/blue-dispatcher/src/dispatcher.ts:174

Processes a handler error by attempting to resolve it with registered error resolvers.

#### Parameters

##### route

`Route`

The current route.

##### handler

`object` \| `null`

The handler that caused the error.

##### error

`Error`

The error that occurred.

#### Returns

[`ModelAndView`](ModelAndView.md) \| `null`

A [ModelAndView](ModelAndView.md) if the error was resolved, otherwise throws a TypeError.

#### Throws

If no view name can be determined for the error.

***

### \_resolveViewName()

> `protected` **\_resolveViewName**(`viewName`, `language`): `Promise`\<`View` \| `null`\>

Defined in: packages/blue-dispatcher/src/dispatcher.ts:197

Resolves a view name into a View object using registered view resolvers.

#### Parameters

##### viewName

`string`

The name of the view to resolve.

##### language

`string`

The language to use for view resolution.

#### Returns

`Promise`\<`View` \| `null`\>

A Promise that resolves to the View object, or `null` if not found.

***

### initLanguageResolver()

> **initLanguageResolver**(`context`): `void`

Defined in: packages/blue-dispatcher/src/strategies/language-resolver-strategy.ts:12

#### Parameters

##### context

`ApplicationContext`

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

`ApplicationContext`

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

`ApplicationContext`

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

Defined in: packages/blue-dispatcher/src/strategies/route-handler-mapping-strategy.ts:15

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initHandlerMappings`

***

### getHandler()

> **getHandler**(`route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/strategies/route-handler-mapping-strategy.ts:16

#### Parameters

##### route

`Route`

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

`ApplicationContext`

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

`Route`

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

### initStrategies()

> **initStrategies**(`context`): `void`

Defined in: packages/blue-dispatcher/src/strategies/strategy-initializer.ts:13

#### Parameters

##### context

`ApplicationContext`

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

### initStrategy()

> **initStrategy**\<`T`\>(`context`, `strategyKey`, `name`, `defaultStrategy`): `void`

Defined in: packages/blue-dispatcher/src/strategies/strategy-initializer.ts:21

#### Type Parameters

##### T

`T` = `any`

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

Defined in: packages/blue-dispatcher/src/strategies/theme-resolver-strategy.ts:13

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

Defined in: packages/blue-dispatcher/src/strategies/view-resolver-strategy.ts:12

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy(AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))) ) ) ) ) ).initViewResolvers`
