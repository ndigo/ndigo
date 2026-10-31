[**@blue/platform-web v0.0.1**](../../README.md)

***

[@blue/platform-web](../../README.md) / [blue-platform-web](../README-1.md) / BrowserDispatcher

# Class: BrowserDispatcher

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

The application context.

#### Inherited from

`AbstractDispatcher.applicationContext`

***

### defaultViewName

> **defaultViewName**: `string`

The default view name to use if none is specified.

#### Inherited from

`AbstractDispatcher.defaultViewName`

***

### errorResolvers

> **errorResolvers**: `RouteErrorResolver`[]

#### Inherited from

`AbstractDispatcher.errorResolvers`

***

### handlerAdapters

> **handlerAdapters**: `RouteHandlerAdapter`[]

#### Inherited from

`AbstractDispatcher.handlerAdapters`

***

### handlerMappings

> **handlerMappings**: `RouteHandlerMapping`[]

#### Inherited from

`AbstractDispatcher.handlerMappings`

***

### isAutoStartup

> `readonly` **isAutoStartup**: `true` = `true`

`SmartLifecycle` — dispatchers must initialize once the context refreshes.

#### Inherited from

`AbstractDispatcher.isAutoStartup`

***

### languageResolver

> **languageResolver**: `LanguageResolver`

#### Inherited from

`AbstractDispatcher.languageResolver`

***

### phase

> `readonly` **phase**: `-90` = `-90`

`SmartLifecycle` — initialize after the handler mapping, before the server.

#### Inherited from

`AbstractDispatcher.phase`

***

### routeToViewNameTranslator

> **routeToViewNameTranslator**: `RouteToViewNameTranslator`

#### Inherited from

`AbstractDispatcher.routeToViewNameTranslator`

***

### strategies

> **strategies**: `string`[]

#### Inherited from

`AbstractDispatcher.strategies`

***

### themeResolver

> **themeResolver**: `ThemeResolver`

#### Inherited from

`AbstractDispatcher.themeResolver`

***

### viewResolvers

> **viewResolvers**: `ViewResolver`[]

#### Inherited from

`AbstractDispatcher.viewResolvers`

## Accessors

### \[$aware\]

#### Get Signature

> **get** **\[$aware\]**(): `boolean`

Marks the value as `Aware` for the factory's aware injection, so the
application context is injected when the dispatcher is registered as an
entry.

##### Returns

`boolean`

#### Inherited from

`AbstractDispatcher.[$aware]`

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Inherit Doc

##### Returns

`string`

#### Overrides

`AbstractDispatcher.[toStringTag]`

***

### isRunning

#### Get Signature

> **get** **isRunning**(): `boolean`

`SmartLifecycle` — whether the lifecycle has driven strategy init.

##### Returns

`boolean`

#### Inherited from

`AbstractDispatcher.isRunning`

## Methods

### addStrategy()

> **addStrategy**(`name`): `void`

#### Parameters

##### name

`string`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.addStrategy`

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

#### Inherited from

`AbstractDispatcher.dispatch`

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

`AbstractDispatcher.getDefaultStrategy`

***

### getDefaultViewName()

> **getDefaultViewName**(`route`): `string`

#### Parameters

##### route

[`Route`](#)

#### Returns

`string`

#### Inherited from

`AbstractDispatcher.getDefaultViewName`

***

### getHandler()

> **getHandler**(`route`): [`RouteHandlerExecutionChain`](#)

#### Parameters

##### route

[`Route`](#)

#### Returns

[`RouteHandlerExecutionChain`](#)

#### Inherited from

`AbstractDispatcher.getHandler`

***

### getHandlerAdapter()

> **getHandlerAdapter**(`handler`): `RouteHandlerAdapter`

#### Parameters

##### handler

`object` \| `undefined`

#### Returns

`RouteHandlerAdapter`

#### Inherited from

`AbstractDispatcher.getHandlerAdapter`

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

`AbstractDispatcher.initCollectionStrategy`

***

### initErrorResolvers()

> **initErrorResolvers**(`context`): `void`

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

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.initHandlerAdapters`

***

### initHandlerMappings()

> **initHandlerMappings**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.initHandlerMappings`

***

### initLanguageResolver()

> **initLanguageResolver**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.initLanguageResolver`

***

### initRouteToViewNameTranslator()

> **initRouteToViewNameTranslator**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.initRouteToViewNameTranslator`

***

### initStrategies()

> **initStrategies**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.initStrategies`

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

`AbstractDispatcher.initStrategy`

***

### initThemeResolver()

> **initThemeResolver**(`context`): `void`

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

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.initViewResolvers`

***

### render()

> **render**(`mv`, `route`): `Promise`\<`void`\>

Render the given `ModelAndView`. This is the last stage of handling a route.

#### Parameters

##### mv

[`ModelAndView`](#)

The [ModelAndView](#) to render.

##### route

[`Route`](#)

The route associated with the [ModelAndView](#).

#### Returns

`Promise`\<`void`\>

#### Inherited from

`AbstractDispatcher.render`

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

#### Inherited from

`AbstractDispatcher.setApplicationContext`

***

### start()

> **start**(): `void`

`SmartLifecycle` — initialize strategies from the application context.
Runs on refresh, after every configuration has registered.

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.start`

***

### stop()

> **stop**(): `void`

`SmartLifecycle` — strategies are immutable once initialized; nothing to
release. Present so this type is a well-behaved lifecycle bean.

#### Returns

`void`

#### Inherited from

`AbstractDispatcher.stop`
