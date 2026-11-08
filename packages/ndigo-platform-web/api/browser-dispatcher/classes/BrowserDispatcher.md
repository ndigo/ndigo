[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [browser-dispatcher](../README.md) / BrowserDispatcher

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

The ordered error resolvers.

#### Inherited from

`AbstractDispatcher.errorResolvers`

***

### handlerAdapters

> **handlerAdapters**: `RouteHandlerAdapter`[]

The ordered adapters consulted for a handler.

#### Inherited from

`AbstractDispatcher.handlerAdapters`

***

### handlerMappings

> **handlerMappings**: `RouteHandlerMapping`[]

The ordered mappings a route is resolved against.

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

The active locale resolver.

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

The translator that derives a view name from a route.

#### Inherited from

`AbstractDispatcher.routeToViewNameTranslator`

***

### strategies

> **strategies**: `string`[]

Names of the strategies this composition contributes.

#### Inherited from

`AbstractDispatcher.strategies`

***

### themeResolver

> **themeResolver**: `ThemeResolver`

The active theme resolver.

#### Inherited from

`AbstractDispatcher.themeResolver`

***

### viewResolvers

> **viewResolvers**: `ViewResolver`[]

The ordered view resolvers.

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

Records a strategy name to initialize later.

#### Parameters

##### name

`string`

The strategy name.

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

A promise that resolves once the route is fully processed.

#### Inherited from

`AbstractDispatcher.dispatch`

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

`AbstractDispatcher.getDefaultStrategy`

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

`AbstractDispatcher.getDefaultViewName`

***

### getHandler()

> **getHandler**(`route`): [`RouteHandlerExecutionChain`](#)

Resolves a route to its execution chain.

#### Parameters

##### route

[`Route`](#)

The route to resolve.

#### Returns

[`RouteHandlerExecutionChain`](#)

The execution chain for the route.

#### Inherited from

`AbstractDispatcher.getHandler`

***

### getHandlerAdapter()

> **getHandlerAdapter**(`handler`): `RouteHandlerAdapter`

Finds the adapter that supports a handler.

#### Parameters

##### handler

`object` \| `undefined`

The resolved handler.

#### Returns

`RouteHandlerAdapter`

The supporting adapter.

#### Inherited from

`AbstractDispatcher.getHandlerAdapter`

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

`AbstractDispatcher.initCollectionStrategy`

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

`AbstractDispatcher.initErrorResolvers`

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

`AbstractDispatcher.initHandlerAdapters`

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

`AbstractDispatcher.initHandlerMappings`

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

`AbstractDispatcher.initLanguageResolver`

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

`AbstractDispatcher.initRouteToViewNameTranslator`

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

`AbstractDispatcher.initStrategies`

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

`AbstractDispatcher.initStrategy`

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

`AbstractDispatcher.initThemeResolver`

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

A promise that resolves once the view has rendered.

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
