[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / NodeDispatcher

# Class: NodeDispatcher

Defined in: packages/blue-platform-node/src/node-dispatcher.ts:33

A dispatcher for Node.js that renders its output to the HTTP response.

## Example

```ts
const dispatcher = new NodeDispatcher();
dispatcher.setApplicationContext(context);
dispatcher.initStrategies(context);
```

## Extends

- `BrowserDispatcher`

## Constructors

### Constructor

> **new NodeDispatcher**(): `NodeDispatcher`

#### Returns

`NodeDispatcher`

#### Inherited from

`BrowserDispatcher.constructor`

## Properties

### applicationContext

> **applicationContext**: `ApplicationContext`

Defined in: packages/blue-dispatcher/lib/dispatcher.d.ts:41

The application context.

#### Inherited from

`BrowserDispatcher.applicationContext`

***

### defaultViewName

> **defaultViewName**: `string`

Defined in: packages/blue-dispatcher/lib/dispatcher.d.ts:45

The default view name to use if none is specified.

#### Inherited from

`BrowserDispatcher.defaultViewName`

***

### languageResolver

> **languageResolver**: `LanguageResolver`

Defined in: packages/blue-dispatcher/lib/strategies/language-resolver-strategy.d.ts:9

#### Inherited from

`BrowserDispatcher.languageResolver`

***

### errorResolvers

> **errorResolvers**: `RouteErrorResolver`[]

Defined in: packages/blue-dispatcher/lib/strategies/route-error-resolver-strategy.d.ts:9

#### Inherited from

`BrowserDispatcher.errorResolvers`

***

### handlerAdapters

> **handlerAdapters**: `RouteHandlerAdapter`[]

Defined in: packages/blue-dispatcher/lib/strategies/route-handler-adapter-strategy.d.ts:9

#### Inherited from

`BrowserDispatcher.handlerAdapters`

***

### handlerMappings

> **handlerMappings**: `RouteHandlerMapping`[]

Defined in: packages/blue-dispatcher/lib/strategies/route-handler-mapping-strategy.d.ts:11

#### Inherited from

`BrowserDispatcher.handlerMappings`

***

### routeToViewNameTranslator

> **routeToViewNameTranslator**: `RouteToViewNameTranslator`

Defined in: packages/blue-dispatcher/lib/strategies/route-to-view-name-translator-strategy.d.ts:10

#### Inherited from

`BrowserDispatcher.routeToViewNameTranslator`

***

### strategies

> **strategies**: `string`[]

Defined in: packages/blue-dispatcher/lib/strategies/strategy-initializer.d.ts:7

#### Inherited from

`BrowserDispatcher.strategies`

***

### themeResolver

> **themeResolver**: `ThemeResolver`

Defined in: packages/blue-dispatcher/lib/strategies/theme-resolver-strategy.d.ts:9

#### Inherited from

`BrowserDispatcher.themeResolver`

***

### viewResolvers

> **viewResolvers**: `ViewResolver`[]

Defined in: packages/blue-dispatcher/lib/strategies/view-resolver-strategy.d.ts:9

#### Inherited from

`BrowserDispatcher.viewResolvers`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/lib/dispatcher.d.ts:49

Returns the string tag for this dispatcher.

##### Returns

`string`

#### Inherited from

`BrowserDispatcher.[toStringTag]`

## Methods

### dispatch()

> **dispatch**(`route`): `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/lib/dispatcher.d.ts:55

Dispatches the given route for processing.

#### Parameters

##### route

`Route`

The route to dispatch.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`BrowserDispatcher.dispatch`

***

### \_processHandlerError()

> `protected` **\_processHandlerError**(`route`, `handler`, `error`): `ModelAndView` \| `null`

Defined in: packages/blue-dispatcher/lib/dispatcher.d.ts:70

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

`BrowserDispatcher._processHandlerError`

***

### \_resolveViewName()

> `protected` **\_resolveViewName**(`viewName`, `language`): `Promise`\<`View` \| `null`\>

Defined in: packages/blue-dispatcher/lib/dispatcher.d.ts:77

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

`BrowserDispatcher._resolveViewName`

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

`BrowserDispatcher.initLanguageResolver`

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

`BrowserDispatcher.initErrorResolvers`

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

`BrowserDispatcher.initHandlerAdapters`

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

`BrowserDispatcher.getHandlerAdapter`

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

`BrowserDispatcher.initHandlerMappings`

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

`BrowserDispatcher.getHandler`

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

`BrowserDispatcher.initRouteToViewNameTranslator`

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

`BrowserDispatcher.getDefaultViewName`

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

`BrowserDispatcher.addStrategy`

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

`BrowserDispatcher.getDefaultStrategy`

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

`BrowserDispatcher.initStrategies`

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

`BrowserDispatcher.initCollectionStrategy`

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

`BrowserDispatcher.initStrategy`

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

`BrowserDispatcher.initThemeResolver`

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

`BrowserDispatcher.initViewResolvers`

***

### render()

> **render**(`mv`, `route`): `Promise`\<`void`\>

Defined in: packages/blue-platform-node/src/node-dispatcher.ts:44

Render the given `ModelAndView` to the HTTP response.

Reads the `ServerResponse` from `route.attributes[NODE_RESPONSE_ATTRIBUTE]`
(set by the HTTP server adapter), creates an `HTTPResponseViewTarget`, and
renders the view into it.

#### Parameters

##### mv

`ModelAndView`

The `ModelAndView` to render.

##### route

`Route`

The route associated with the `ModelAndView`.

#### Returns

`Promise`\<`void`\>

#### Overrides

`BrowserDispatcher.render`
