[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / ProxiedGenericApplicationContext

# Class: ProxiedGenericApplicationContext

Application context proxy that exposes values as dynamic object properties.

## Extends

- [`GenericApplicationContext`](GenericApplicationContext.md)

## Implements

- `Record`\<`string`, `unknown`\>

## Indexable

> \[`key`: `string`\]: `unknown`

## Constructors

### Constructor

> **new ProxiedGenericApplicationContext**(`name`, `data?`): `ProxiedGenericApplicationContext`

Creates a proxied context that forwards property access to values.

#### Parameters

##### name

`string`

The context name.

##### data?

`JSONObject`

Optional initial values to register.

#### Returns

`ProxiedGenericApplicationContext`

#### Overrides

[`GenericApplicationContext`](GenericApplicationContext.md).[`constructor`](GenericApplicationContext.md#constructor)

## Properties

### createdTimestamp

> **createdTimestamp**: `number`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`createdTimestamp`](GenericApplicationContext.md#createdtimestamp)

***

### destroyed

> **destroyed**: `boolean`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroyed`](GenericApplicationContext.md#destroyed)

***

### destroyedTimestamp?

> `optional` **destroyedTimestamp?**: `number`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroyedTimestamp`](GenericApplicationContext.md#destroyedtimestamp)

***

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Indicates if there are any construction-aware processors.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasConstructionAwareProcessors`](GenericApplicationContext.md#hasconstructionawareprocessors)

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Indicates if there are any destruction-aware processors.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasDestructionAwareProcessors`](GenericApplicationContext.md#hasdestructionawareprocessors)

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Indicates if there are any initialization-aware processors.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasInitializationAwareProcessors`](GenericApplicationContext.md#hasinitializationawareprocessors)

***

### processors

> **processors**: `EntryProcessor`[]

A list of entry processors applied to instances.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`processors`](GenericApplicationContext.md#processors)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this factory.

##### Returns

`string`

Always 'Factory'.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`[toStringTag]`](GenericApplicationContext.md#tostringtag)

***

### children

#### Get Signature

> **get** **children**(): readonly [`ApplicationContext`](../interfaces/ApplicationContext.md)[]

The direct child contexts.

##### Returns

readonly [`ApplicationContext`](../interfaces/ApplicationContext.md)[]

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`children`](GenericApplicationContext.md#children)

***

### contentSource

#### Get Signature

> **get** **contentSource**(): [`ContentSource`](#)

The content source used to resolve theme content.

##### Returns

[`ContentSource`](#)

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`contentSource`](GenericApplicationContext.md#contentsource)

***

### environment

#### Get Signature

> **get** **environment**(): [`Environment`](../interfaces/Environment.md)

The lazily created environment for this context.

##### Returns

[`Environment`](../interfaces/Environment.md)

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`environment`](GenericApplicationContext.md#environment)

***

### id

#### Get Signature

> **get** **id**(): `number`

The stable identifier assigned at construction.

##### Returns

`number`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`id`](GenericApplicationContext.md#id)

***

### isActive

#### Get Signature

> **get** **isActive**(): `boolean`

Indicates whether the context has been refreshed and not yet closed.

##### Returns

`boolean`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`isActive`](GenericApplicationContext.md#isactive)

***

### name

#### Get Signature

> **get** **name**(): `string`

The configured context name.

##### Returns

`string`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`name`](GenericApplicationContext.md#name)

***

### parent

#### Get Signature

> **get** **parent**(): [`ApplicationContext`](../interfaces/ApplicationContext.md) \| `null`

The current parent context.

##### Returns

[`ApplicationContext`](../interfaces/ApplicationContext.md) \| `null`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`parent`](GenericApplicationContext.md#parent)

***

### path

#### Get Signature

> **get** **path**(): `string`

The slash-delimited hierarchy path from the root to this context.

##### Returns

`string`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`path`](GenericApplicationContext.md#path)

***

### themeName

#### Get Signature

> **get** **themeName**(): `string`

The default theme name associated with this context.

##### Returns

`string`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`themeName`](GenericApplicationContext.md#themename)

## Methods

### \_checkVersion()

> **\_checkVersion**\<`T`\>(`nameOrToken`, `value`): `void`

Checks the resolved value's version against the token's requiredVersion and warns on mismatch.

#### Type Parameters

##### T

`T`

#### Parameters

##### nameOrToken

`string` \| [`ContextToken`](ContextToken.md)\<`T`\>

##### value

`T`

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_checkVersion`](GenericApplicationContext.md#_checkversion)

***

### addProcessor()

> **addProcessor**(`processor`): `void`

Adds an entry processor to the factory.

#### Parameters

##### processor

`EntryProcessor`

The entry processor to add.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`addProcessor`](GenericApplicationContext.md#addprocessor)

***

### broadcast()

> **broadcast**(`type`, ...`data`): `void`

Broadcasts an event to all descendants.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### data

...`unknown`[]

Event payload values.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`broadcast`](GenericApplicationContext.md#broadcast)

***

### bubble()

> **bubble**(`type`, ...`data`): `void`

Emits an event to parent contexts.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### data

...`unknown`[]

Event payload values.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`bubble`](GenericApplicationContext.md#bubble)

***

### close()

> **close**(): `void`

Closes the context and all descendants.

Teardown sequence: emit `context:close`, close each child, run the
lifecycle processor's `onClose`, destroy managed values, detach the
environment refresh subscription ([unsubscribeRefresh](GenericApplicationContext.md#unsubscriberefresh)), unhook
from the parent, mark `destroyed`/`destroyedTimestamp`, emit
`context:destroy`, then remove every listener.

Exception-safe (CTX-06): a throwing listener or teardown hook is
reported and swallowed so the remaining steps still run — `destroyed`
is always set and children/beans are still torn down. Exceptions from
`context:close`/`context:destroy` listeners otherwise abort teardown
mid-way (the emitter re-throws when no `error` listener is attached).

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`close`](GenericApplicationContext.md#close)

***

### destroy()

> **destroy**(): `void`

Releases this context's resources.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroy`](GenericApplicationContext.md#destroy)

***

### destroyScopedValue()

> **destroyScopedValue**(`scopeName`, `valueName`): `void`

Destroys a scoped value.

#### Parameters

##### scopeName

`string`

The name of the scope.

##### valueName

`string`

The name of the value within the scope.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroyScopedValue`](GenericApplicationContext.md#destroyscopedvalue)

***

### destroyValue()

#### Call Signature

> **destroyValue**\<`T`\>(`token`): `void`

Destroys a value managed by the factory.

##### Type Parameters

###### T

`T` = `unknown`

The type of the value.

##### Parameters

###### token

[`ContextToken`](ContextToken.md)\<`T`\>

(the scope-entry key) The name or ContextToken of the value to destroy.

##### Returns

`void`

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroyValue`](GenericApplicationContext.md#destroyvalue)

#### Call Signature

> **destroyValue**(`name`): `void`

Destroys a value managed by the factory.

##### Parameters

###### name

`string`

##### Returns

`void`

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroyValue`](GenericApplicationContext.md#destroyvalue)

***

### emit()

> **emit**(`type`, ...`data`): `boolean`

Emits an event to the listeners registered for the given type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### data

...`unknown`[]

Event payload values.

#### Returns

`boolean`

`true` when at least one listener ran.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`emit`](GenericApplicationContext.md#emit)

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Returns the event types with registered listeners.

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`eventTypes`](GenericApplicationContext.md#eventtypes)

***

### getContent()

> **getContent**(`key`, `language`): `Promise`\<`string`\>

Resolves content locally and then delegates to the parent if needed.
Missing content resolves to the key itself, matching the content
layer's fallback convention.

#### Parameters

##### key

`string`

The content key.

##### language

`string` \| `LanguageCode`

The language identifier.

#### Returns

`Promise`\<`string`\>

The resolved content.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getContent`](GenericApplicationContext.md#getcontent)

***

### getInstance()

> **getInstance**\<`T`\>(`name`, `argumentsList?`): `T`

Returns the value registered under `name`. Constructor-registered
values are constructed (and configured) through the internal
`_create` path; non-constructor values (instances, primitives) are
returned as-is, preserving identity (CF-12). An unregistered name
resolves to `undefined`.

#### Type Parameters

##### T

`T` = `unknown`

The type of the instance.

#### Parameters

##### name

`string`

The name of the value.

##### argumentsList?

`unknown`[]

(constructor arguments) Optional arguments to pass to the constructor if the value is a constructor.

#### Returns

`T`

An instance of the value.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getInstance`](GenericApplicationContext.md#getinstance)

***

### getMessage()

> **getMessage**(`key`, `params?`, `language?`): `Promise`\<`string`\>

Resolves and formats a message, delegating to the registered message
source when present, the content source otherwise, and the parent
context last.

#### Parameters

##### key

`string`

The message key to resolve.

##### params?

`MessageParams`

Optional formatting parameters.

##### language?

`string` \| `LanguageCode`

The language to use.

#### Returns

`Promise`\<`string`\>

The formatted message, or the key when nothing resolves it.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getMessage`](GenericApplicationContext.md#getmessage)

***

### getResource()

> **getResource**(`location`): `Promise`\<[`Resource`](../interfaces/Resource.md)\<`unknown`\>\>

#### Parameters

##### location

`string`

#### Returns

`Promise`\<[`Resource`](../interfaces/Resource.md)\<`unknown`\>\>

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getResource`](GenericApplicationContext.md#getresource)

***

### getScope()

> **getScope**(`name`): `Scope`

Retrieves a scope by its name.

#### Parameters

##### name

`string`

The name of the scope.

#### Returns

`Scope`

The Scope instance.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getScope`](GenericApplicationContext.md#getscope)

***

### getScopeNames()

> **getScopeNames**(): `string`[]

Returns an array of all registered scope names.

#### Returns

`string`[]

An array of PossibleScope names.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getScopeNames`](GenericApplicationContext.md#getscopenames)

***

### getTheme()

> **getTheme**(`name?`): `Theme`

Resolves a theme by name or the default theme.

#### Parameters

##### name?

`string`

Optional theme name.

#### Returns

`Theme`

The resolved theme.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getTheme`](GenericApplicationContext.md#gettheme)

***

### getValue()

#### Call Signature

> **getValue**\<`T`\>(`token`): `T`

Retrieves a value from the factory, creating it if necessary.

##### Type Parameters

###### T

`T` = `unknown`

The type of the value.

##### Parameters

###### token

[`ContextToken`](ContextToken.md)\<`T`\>

(the scope-entry key) The name or ContextToken of the value to retrieve.

##### Returns

`T`

The retrieved value.

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getValue`](GenericApplicationContext.md#getvalue)

#### Call Signature

> **getValue**\<`T`\>(`name`, `argumentsList?`): `T`

Retrieves a value from the factory, creating it if necessary.

##### Type Parameters

###### T

`T` = `unknown`

The type of the value.

##### Parameters

###### name

`string`

###### argumentsList?

`unknown`[]

##### Returns

`T`

The retrieved value.

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getValue`](GenericApplicationContext.md#getvalue)

***

### hasChild()

> **hasChild**(`node`): `boolean`

Returns whether the given context is a direct child.

#### Parameters

##### node

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The application context to check for.

#### Returns

`boolean`

`true` when the context is a child, false otherwise.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasChild`](GenericApplicationContext.md#haschild)

***

### hasConstructor()

> **hasConstructor**(`name`): `boolean`

Checks if the factory has a constructor registered under the given name.

#### Parameters

##### name

`string`

The name of the constructor.

#### Returns

`boolean`

`true` if a constructor is registered, `false` otherwise.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasConstructor`](GenericApplicationContext.md#hasconstructor)

***

### hasInstance()

> **hasInstance**(`name`): `boolean`

Checks if the factory has an instance registered under the given name.

#### Parameters

##### name

`string`

The name of the instance.

#### Returns

`boolean`

`true` if an instance is registered, `false` otherwise.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasInstance`](GenericApplicationContext.md#hasinstance)

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

Checks if the factory has its own value (either an instance or a constructor) registered under the given name.

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`boolean`

`true` if this factory has its own value, `false` otherwise.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasOwnValue`](GenericApplicationContext.md#hasownvalue)

***

### hasValue()

#### Call Signature

> **hasValue**\<`T`\>(`token`): `boolean`

Checks if the factory has a value (either an instance or a constructor) registered under the given name or token.

##### Type Parameters

###### T

`T` = `unknown`

The type of the value.

##### Parameters

###### token

[`ContextToken`](ContextToken.md)\<`T`\>

(the scope-entry key) The name or ContextToken of the value.

##### Returns

`boolean`

`true` if a value is registered, `false` otherwise.

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasValue`](GenericApplicationContext.md#hasvalue)

#### Call Signature

> **hasValue**(`name`): `boolean`

Checks if the factory has a value (either an instance or a constructor) registered under the given name or token.

##### Parameters

###### name

`string`

##### Returns

`boolean`

`true` if a value is registered, `false` otherwise.

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasValue`](GenericApplicationContext.md#hasvalue)

***

### listenerCount()

> **listenerCount**(`type`): `number`

Returns the number of listeners for a type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

#### Returns

`number`

The listener count.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`listenerCount`](GenericApplicationContext.md#listenercount)

***

### listeners()

> **listeners**(`type`): `Function`[]

Returns a snapshot of listeners for a type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

#### Returns

`Function`[]

The registered listeners.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`listeners`](GenericApplicationContext.md#listeners)

***

### newChild()

> **newChild**(`name?`, `data?`): [`ApplicationContext`](../interfaces/ApplicationContext.md)

Creates and attaches a child context.

#### Parameters

##### name?

`string`

The optional context name.

##### data?

`JSONObject`

Optional initial child data.

#### Returns

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The created child application context.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`newChild`](GenericApplicationContext.md#newchild)

***

### off()

> **off**(`type`, `listener`): `this`

Removes a listener for an event type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### listener

`Function`

The listener to remove.

#### Returns

`this`

This emitter.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`off`](GenericApplicationContext.md#off)

***

### on()

> **on**(`type`, `listener?`): `this`

Adds a listener for an event type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md) \| [`EventHandlers`](../type-aliases/EventHandlers.md)

The event type.

##### listener?

`Function`

The listener to register.

#### Returns

`this`

This emitter.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`on`](GenericApplicationContext.md#on)

***

### refresh()

> **refresh**(): `void`

Initializes the context lifecycle if it is not already active.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`refresh`](GenericApplicationContext.md#refresh)

***

### registerScope()

> **registerScope**(`name`, `scope`): `void`

Registers a new scope with the factory.

#### Parameters

##### name

`string`

The name of the scope.

##### scope

`Scope`

The Scope instance to register.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`registerScope`](GenericApplicationContext.md#registerscope)

***

### removeChild()

> **removeChild**(`node`): `boolean`

Removes a child from the direct child list.

#### Parameters

##### node

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The child application context to remove.

#### Returns

`boolean`

`true` when the child was successfully removed, false otherwise.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`removeChild`](GenericApplicationContext.md#removechild)

***

### setContentSource()

> **setContentSource**(`contentSource`): `void`

Replaces the content source used by this context.

#### Parameters

##### contentSource

[`ContentSource`](#)

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setContentSource`](GenericApplicationContext.md#setcontentsource)

***

### setEnvironment()

> **setEnvironment**(`environment`): `void`

Replaces the environment used by this context.

#### Parameters

##### environment

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md)

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setEnvironment`](GenericApplicationContext.md#setenvironment)

***

### setId()

> **setId**(`id`): `void`

Updates the identifier assigned to this context.

#### Parameters

##### id

`number`

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setId`](GenericApplicationContext.md#setid)

***

### setMessageSource()

> **setMessageSource**(`messageSource`): `void`

Replaces the message source used by message lookups.

#### Parameters

##### messageSource

[`MessageSource`](#)

The message source to attach.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setMessageSource`](GenericApplicationContext.md#setmessagesource)

***

### setName()

> **setName**(`name`): `void`

Updates the context name.

#### Parameters

##### name

`string`

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setName`](GenericApplicationContext.md#setname)

***

### setParent()

> **setParent**(`parent`): `void`

Reassigns the parent context and keeps the child list in sync.

#### Parameters

##### parent

[`ApplicationContext`](../interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setParent`](GenericApplicationContext.md#setparent)

***

### setThemeName()

> **setThemeName**(`themeName`): `void`

Updates the default theme name.

#### Parameters

##### themeName

`string`

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setThemeName`](GenericApplicationContext.md#setthemename)

***

### setThemeResolver()

> **setThemeResolver**(`themeResolver`): `void`

Overrides the theme resolver used by this context.

#### Parameters

##### themeResolver

`ThemeResolver`

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setThemeResolver`](GenericApplicationContext.md#setthemeresolver)

***

### setValue()

#### Call Signature

> **setValue**\<`T`\>(`token`, `value`): `void`

Sets a value (either a constructor or an instance) in the factory.

##### Type Parameters

###### T

`T` = `unknown`

The type of the value.

##### Parameters

###### token

[`ContextToken`](ContextToken.md)\<`T`\>

(the scope-entry key) The name or ContextToken under which to register the value.

###### value

`T`

The value to register.

##### Returns

`void`

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setValue`](GenericApplicationContext.md#setvalue)

#### Call Signature

> **setValue**\<`T`\>(`name`, `value`): `void`

Sets a value (either a constructor or an instance) in the factory.

##### Type Parameters

###### T

`T` = `unknown`

The type of the value.

##### Parameters

###### name

`string`

###### value

`T`

The value to register.

##### Returns

`void`

##### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setValue`](GenericApplicationContext.md#setvalue)

***

### shouldEagerlyInstantiate()

> **shouldEagerlyInstantiate**(`name`): `boolean`

Whether the constructor registered under `name` can be eagerly
instantiated by a boot-time "finish sweep" without side effects.

A sweep must skip non-caching scopes (KRN-REV-FACTORY-12): `prototype`
would build an instance that is discarded immediately, and `hash`/
`route` have no active scope key at boot, so `HashScope.getValue` throws
`IllegalStateError` and aborts the sweep. Caching scopes (`singleton`,
`refresh`) and custom scopes are instantiated as before. Unregistered
names return `false`.

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`boolean`

`true` when eager instantiation is safe and non-wasteful.

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`shouldEagerlyInstantiate`](GenericApplicationContext.md#shouldeagerlyinstantiate)

***

### typedConfig()

> **typedConfig**\<`S`\>(`prefix`, `schema`): `output`\<`S`\> \| `undefined`

Schema-typed configuration read off the context environment (AD-34 D3).

#### Type Parameters

##### S

`S` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

#### Parameters

##### prefix

`string`

##### schema

`S`

#### Returns

`output`\<`S`\> \| `undefined`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`typedConfig`](GenericApplicationContext.md#typedconfig)

***

### unsubscribeRefresh()

> **unsubscribeRefresh**(): `void`

Detaches the refresh listener and its fail-loud handler from the wired
environment (ARC-6): a closed context must not stay reachable through
the environment, and a later `refresh()` must not write into it.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`unsubscribeRefresh`](GenericApplicationContext.md#unsubscriberefresh)
