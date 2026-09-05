[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / BrowserDispatcher

# Class: BrowserDispatcher

Defined in: packages/blue-platform-web/src/browser-dispatcher.ts:26

Browser application dispatcher.

## Example

```ts
const dispatcher = new BrowserDispatcher();
dispatcher.initStrategies(context);
dispatcher.applicationContext = context;
```

## Extends

- `AbstractDispatcher`

## Constructors

### Constructor

> **new BrowserDispatcher**(): `BrowserDispatcher`

#### Returns

`BrowserDispatcher`

#### Inherited from

`AbstractDispatcher.constructor`

## Properties

### applicationContext

> **applicationContext**: `ApplicationContext`

Defined in: packages/blue-dispatcher/lib/dispatcher.d.ts:47

The application context.

#### Inherited from

`AbstractDispatcher.applicationContext`

***

### defaultViewName

> **defaultViewName**: `string`

Defined in: packages/blue-dispatcher/lib/dispatcher.d.ts:51

The default view name to use if none is specified.

#### Inherited from

`AbstractDispatcher.defaultViewName`

***

### languageResolver

> **languageResolver**: `LanguageResolver`

Defined in: packages/blue-dispatcher/lib/strategies/language-resolver-strategy.d.ts:9

#### Inherited from

`AbstractDispatcher.languageResolver`

***

### errorResolvers

> **errorResolvers**: `RouteErrorResolver`[]

Defined in: packages/blue-dispatcher/lib/strategies/route-error-resolver-strategy.d.ts:9

#### Inherited from

`AbstractDispatcher.errorResolvers`

***

### handlerAdapters

> **handlerAdapters**: `RouteHandlerAdapter`[]

Defined in: packages/blue-dispatcher/lib/strategies/route-handler-adapter-strategy.d.ts:9

#### Inherited from

`AbstractDispatcher.handlerAdapters`

***

### handlerMappings

> **handlerMappings**: `RouteHandlerMapping`[]

Defined in: packages/blue-dispatcher/lib/strategies/route-handler-mapping-strategy.d.ts:11

#### Inherited from

`AbstractDispatcher.handlerMappings`

***

### routeToViewNameTranslator

> **routeToViewNameTranslator**: `RouteToViewNameTranslator`

Defined in: packages/blue-dispatcher/lib/strategies/route-to-view-name-translator-strategy.d.ts:10

#### Inherited from

`AbstractDispatcher.routeToViewNameTranslator`

***

### strategies

> **strategies**: `string`[]

Defined in: packages/blue-dispatcher/lib/strategies/strategy-initializer.d.ts:7

#### Inherited from

`AbstractDispatcher.strategies`

***

### themeResolver

> **themeResolver**: `ThemeResolver`

Defined in: packages/blue-dispatcher/lib/strategies/theme-resolver-strategy.d.ts:9

#### Inherited from

`AbstractDispatcher.themeResolver`

***

### viewResolvers

> **viewResolvers**: `ViewResolver`[]

Defined in: packages/blue-dispatcher/lib/strategies/view-resolver-strategy.d.ts:9

#### Inherited from

`AbstractDispatcher.viewResolvers`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-platform-web/src/browser-dispatcher.ts:28

##### Inherit Doc

##### Returns

`string`

#### Overrides

`AbstractDispatcher.[toStringTag]`

## Methods

### dispatch()

> **dispatch**(`route`): `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/lib/dispatcher.d.ts:61

Dispatches the given route for processing.

#### Parameters

##### route

`Route`

The route to dispatch.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`AbstractDispatcher.dispatch`

***

### render()

> **render**(`mv`, `route`): `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/lib/dispatcher.d.ts:67

Render the given `ModelAndView`. This is the last stage of handling a route.

#### Parameters

##### mv

`ModelAndView`

The ModelAndView to render.

##### route

`Route`

The route associated with the ModelAndView.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`AbstractDispatcher.render`

***

### \_processHandlerError()

> `protected` **\_processHandlerError**(`route`, `handler`, `error`): `ModelAndView` \| `null`

Defined in: packages/blue-dispatcher/lib/dispatcher.d.ts:76

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

`ModelAndView` \| `null`

A ModelAndView if the error was resolved, otherwise throws a TypeError.

#### Throws

If no view name can be determined for the error.

#### Inherited from

`AbstractDispatcher._processHandlerError`

***

### \_resolveViewName()

> `protected` **\_resolveViewName**(`viewName`, `language`): `Promise`\<`View` \| `null`\>

Defined in: packages/blue-dispatcher/lib/dispatcher.d.ts:83

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

#### Inherited from

`AbstractDispatcher._resolveViewName`

***

### initLanguageResolver()

> **initLanguageResolver**(`context`): `void`

Defined in: packages/blue-dispatcher/lib/strategies/language-resolver-strategy.d.ts:10

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.initLanguageResolver`

***

### initErrorResolvers()

> **initErrorResolvers**(`context`): `void`

Defined in: packages/blue-dispatcher/lib/strategies/route-error-resolver-strategy.d.ts:10

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.initErrorResolvers`

***

### initHandlerAdapters()

> **initHandlerAdapters**(`context`): `void`

Defined in: packages/blue-dispatcher/lib/strategies/route-handler-adapter-strategy.d.ts:10

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.initHandlerAdapters`

***

### getHandlerAdapter()

> **getHandlerAdapter**(`handler`): `RouteHandlerAdapter`

Defined in: packages/blue-dispatcher/lib/strategies/route-handler-adapter-strategy.d.ts:11

#### Parameters

##### handler

`any`

#### Returns

`RouteHandlerAdapter`

#### Inherited from

`AbstractDispatcher.getHandlerAdapter`

***

### initHandlerMappings()

> **initHandlerMappings**(`context`): `void`

Defined in: packages/blue-dispatcher/lib/strategies/route-handler-mapping-strategy.d.ts:12

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.initHandlerMappings`

***

### getHandler()

> **getHandler**(`route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/lib/strategies/route-handler-mapping-strategy.d.ts:13

#### Parameters

##### route

`Route`

#### Returns

`RouteHandlerExecutionChain`

#### Inherited from

`AbstractDispatcher.getHandler`

***

### initRouteToViewNameTranslator()

> **initRouteToViewNameTranslator**(`context`): `void`

Defined in: packages/blue-dispatcher/lib/strategies/route-to-view-name-translator-strategy.d.ts:11

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.initRouteToViewNameTranslator`

***

### getDefaultViewName()

> **getDefaultViewName**(`route`): `string`

Defined in: packages/blue-dispatcher/lib/strategies/route-to-view-name-translator-strategy.d.ts:12

#### Parameters

##### route

`Route`

#### Returns

`string`

#### Inherited from

`AbstractDispatcher.getDefaultViewName`

***

### addStrategy()

> **addStrategy**(`name`): `void`

Defined in: packages/blue-dispatcher/lib/strategies/strategy-initializer.d.ts:8

#### Parameters

##### name

`string`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.addStrategy`

***

### getDefaultStrategy()

> **getDefaultStrategy**\<`T`\>(`context`, `key`, `strategy`): `T`

Defined in: packages/blue-dispatcher/lib/strategies/strategy-initializer.d.ts:9

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

`AbstractDispatcher.getDefaultStrategy`

***

### initStrategies()

> **initStrategies**(`context`): `void`

Defined in: packages/blue-dispatcher/lib/strategies/strategy-initializer.d.ts:10

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.initStrategies`

***

### initCollectionStrategy()

> **initCollectionStrategy**\<`T`\>(`context`, `collectionStrategyKey`, `strategyKey`, `name`, `defaultStrategy`): `void`

Defined in: packages/blue-dispatcher/lib/strategies/strategy-initializer.d.ts:11

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

`AbstractDispatcher.initCollectionStrategy`

***

### initStrategy()

> **initStrategy**\<`T`\>(`context`, `strategyKey`, `name`, `defaultStrategy`): `void`

Defined in: packages/blue-dispatcher/lib/strategies/strategy-initializer.d.ts:12

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

`AbstractDispatcher.initStrategy`

***

### initThemeResolver()

> **initThemeResolver**(`context`): `void`

Defined in: packages/blue-dispatcher/lib/strategies/theme-resolver-strategy.d.ts:10

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.initThemeResolver`

***

### initViewResolvers()

> **initViewResolvers**(`context`): `void`

Defined in: packages/blue-dispatcher/lib/strategies/view-resolver-strategy.d.ts:10

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.initViewResolvers`
