[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [generic-application-context](../README.md) / GenericApplicationContext

# Class: GenericApplicationContext

Default application context implementation used throughout the package.

## Example

```ts
const context = new GenericApplicationContext('app');
context.register(AppConfig);
context.refresh();
const service = context.getValue<GreetingService>('greetingService');
```

## Extends

- [`EventEmitter`](../../event-emitter/interfaces/EventEmitter.md)\<`this`\> & [`ResourceLoader`](../../resource/interfaces/ResourceLoader.md) & `DefaultFactory`\<`this`\>

## Extended by

- [`MetadataConfigApplicationContext`](../../configuration/classes/MetadataConfigApplicationContext.md)
- [`ProxiedGenericApplicationContext`](../../proxied-application-context/classes/ProxiedGenericApplicationContext.md)

## Indexable

> \[`key`: `string`\]: `unknown`

Allows arbitrary properties to be added to the factory, which are then managed as values.

## Constructors

### Constructor

> **new GenericApplicationContext**(`name?`, `data?`): `GenericApplicationContext`

Creates a new application context.

#### Parameters

##### name?

`string`

The optional context name.

##### data?

`JSONObject`

Optional initial values to register.

#### Returns

`GenericApplicationContext`

#### Overrides

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).constructor`

## Properties

### createdTimestamp

> **createdTimestamp**: `number`

Timestamp when the context was created.

***

### destroyed

> **destroyed**: `boolean`

Whether the context has been destroyed.

***

### destroyedTimestamp?

> `optional` **destroyedTimestamp?**: `number`

Timestamp when the context was destroyed.

***

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Indicates if there are any construction-aware processors.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasConstructionAwareProcessors`

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Indicates if there are any destruction-aware processors.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasDestructionAwareProcessors`

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Indicates if there are any initialization-aware processors.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasInitializationAwareProcessors`

***

### processors

> **processors**: `EntryProcessor`[]

A list of entry processors applied to instances.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).processors`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this factory.

##### Returns

`string`

Always 'Factory'.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).[toStringTag]`

***

### children

#### Get Signature

> **get** **children**(): readonly [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)[]

The direct child contexts.

##### Returns

readonly [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)[]

***

### contentSource

#### Get Signature

> **get** **contentSource**(): [`ContentSource`](#)

The content source used to resolve theme content.

##### Returns

[`ContentSource`](#)

***

### environment

#### Get Signature

> **get** **environment**(): [`Environment`](../../environment/interfaces/Environment.md)

The lazily created environment for this context.

##### Returns

[`Environment`](../../environment/interfaces/Environment.md)

***

### id

#### Get Signature

> **get** **id**(): `number`

The stable identifier assigned at construction.

##### Returns

`number`

***

### isActive

#### Get Signature

> **get** **isActive**(): `boolean`

Indicates whether the context has been refreshed and not yet closed.

##### Returns

`boolean`

***

### name

#### Get Signature

> **get** **name**(): `string`

The configured context name.

##### Returns

`string`

***

### parent

#### Get Signature

> **get** **parent**(): [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md) \| `null`

The current parent context.

##### Returns

[`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md) \| `null`

#### Overrides

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).parent`

***

### path

#### Get Signature

> **get** **path**(): `string`

The slash-delimited hierarchy path from the root to this context.

##### Returns

`string`

***

### themeName

#### Get Signature

> **get** **themeName**(): `string`

The default theme name associated with this context.

##### Returns

`string`

## Methods

### \_checkVersion()

> **\_checkVersion**\<`T`\>(`nameOrToken`, `value`): `void`

Checks the resolved value's version against the token's requiredVersion and warns on mismatch.

#### Type Parameters

##### T

`T`

#### Parameters

##### nameOrToken

`string` \| [`ContextToken`](../../index/classes/ContextToken.md)\<`T`\>

The value name or token.

##### value

`T`

The resolved value.

#### Returns

`void`

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._checkVersion`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).addProcessor`

***

### broadcast()

> **broadcast**(`type`, ...`data`): `void`

Broadcasts an event to all descendants.

#### Parameters

##### type

[`EventType`](../../event-emitter/type-aliases/EventType.md)

The event type.

##### data

...`unknown`[]

Event payload values.

#### Returns

`void`

***

### bubble()

> **bubble**(`type`, ...`data`): `void`

Emits an event to parent contexts.

#### Parameters

##### type

[`EventType`](../../event-emitter/type-aliases/EventType.md)

The event type.

##### data

...`unknown`[]

Event payload values.

#### Returns

`void`

***

### close()

> **close**(): `void`

Closes the context and all descendants.

Teardown sequence: emit `context:close`, close each child, run the
lifecycle processor's `onClose`, destroy managed values, detach the
environment refresh subscription ([unsubscribeRefresh](#unsubscriberefresh)), unhook
from the parent, mark `destroyed`/`destroyedTimestamp`, emit
`context:destroy`, then remove every listener.

Exception-safe (CTX-06): a throwing listener or teardown hook is
reported and swallowed so the remaining steps still run — `destroyed`
is always set and children/beans are still torn down. Exceptions from
`context:close`/`context:destroy` listeners otherwise abort teardown
mid-way (the emitter re-throws when no `error` listener is attached).

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Releases this context's resources.

#### Returns

`void`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).destroyScopedValue`

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

[`ContextToken`](../../index/classes/ContextToken.md)\<`T`\>

(the scope-entry key) The name or ContextToken of the value to destroy.

##### Returns

`void`

##### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).destroyValue`

#### Call Signature

> **destroyValue**(`name`): `void`

Destroys a value managed by the factory by name.

##### Parameters

###### name

`string`

The value name.

##### Returns

`void`

##### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).destroyValue`

***

### emit()

> **emit**(`type`, ...`data`): `boolean`

Emits an event to the listeners registered for the given type.

#### Parameters

##### type

[`EventType`](../../event-emitter/type-aliases/EventType.md)

The event type.

##### data

...`unknown`[]

Event payload values.

#### Returns

`boolean`

`true` when at least one listener ran.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).emit`

***

### eventTypes()

> **eventTypes**(): [`EventType`](../../event-emitter/type-aliases/EventType.md)[]

Returns the event types with registered listeners.

#### Returns

[`EventType`](../../event-emitter/type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).eventTypes`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getInstance`

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

***

### getResource()

> **getResource**(`location`): `Promise`\<[`Resource`](../../resource/interfaces/Resource.md)\<`unknown`\>\>

Returns a resource handle for the location.

#### Parameters

##### location

`string`

The resource location.

#### Returns

`Promise`\<[`Resource`](../../resource/interfaces/Resource.md)\<`unknown`\>\>

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getResource`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getScope`

***

### getScopeNames()

> **getScopeNames**(): `string`[]

Returns an array of all registered scope names.

#### Returns

`string`[]

An array of PossibleScope names.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getScopeNames`

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

[`ContextToken`](../../index/classes/ContextToken.md)\<`T`\>

(the scope-entry key) The name or ContextToken of the value to retrieve.

##### Returns

`T`

The retrieved value.

##### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getValue`

#### Call Signature

> **getValue**\<`T`\>(`name`, `argumentsList?`): `T`

Retrieves a value by name, creating it when necessary.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### name

`string`

The value name.

###### argumentsList?

`unknown`[]

Constructor arguments.

##### Returns

`T`

The retrieved value.

##### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getValue`

***

### hasChild()

> **hasChild**(`node`): `boolean`

Returns whether the given context is a direct child.

#### Parameters

##### node

[`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)

The application context to check for.

#### Returns

`boolean`

`true` when the context is a child, false otherwise.

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasConstructor`

***

### hasInstance()

> **hasInstance**(`name`): `boolean`

#### Parameters

##### name

`string`

#### Returns

`boolean`

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasInstance`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasOwnValue`

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

[`ContextToken`](../../index/classes/ContextToken.md)\<`T`\>

(the scope-entry key) The name or ContextToken of the value.

##### Returns

`boolean`

`true` if a value is registered, `false` otherwise.

##### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasValue`

#### Call Signature

> **hasValue**(`name`): `boolean`

Checks whether a value is registered by name.

##### Parameters

###### name

`string`

The value name.

##### Returns

`boolean`

Whether a value is registered.

##### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasValue`

***

### listenerCount()

> **listenerCount**(`type`): `number`

Returns the number of listeners for a type.

#### Parameters

##### type

[`EventType`](../../event-emitter/type-aliases/EventType.md)

The event type.

#### Returns

`number`

The listener count.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).listenerCount`

***

### listeners()

> **listeners**(`type`): `Function`[]

Returns a snapshot of listeners for a type.

#### Parameters

##### type

[`EventType`](../../event-emitter/type-aliases/EventType.md)

The event type.

#### Returns

`Function`[]

The registered listeners.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).listeners`

***

### newChild()

> **newChild**(`name?`, `data?`): [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)

Creates and attaches a child context.

#### Parameters

##### name?

`string`

The optional context name.

##### data?

`JSONObject`

Optional initial child data.

#### Returns

[`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)

The created child application context.

***

### off()

> **off**(`type`, `listener`): `this`

Removes a listener for an event type.

#### Parameters

##### type

[`EventType`](../../event-emitter/type-aliases/EventType.md)

The event type.

##### listener

`Function`

The listener to remove.

#### Returns

`this`

This emitter.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).off`

***

### on()

> **on**(`type`, `listener?`): `this`

Adds a listener for an event type.

#### Parameters

##### type

[`EventType`](../../event-emitter/type-aliases/EventType.md) \| [`EventHandlers`](../../event-emitter/type-aliases/EventHandlers.md)

The event type.

##### listener?

`Function`

The listener to register.

#### Returns

`this`

This emitter.

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).on`

***

### refresh()

> **refresh**(): `void`

Initializes the context lifecycle if it is not already active.

#### Returns

`void`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).registerScope`

***

### removeChild()

> **removeChild**(`node`): `boolean`

Removes a child from the direct child list.

#### Parameters

##### node

[`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)

The child application context to remove.

#### Returns

`boolean`

`true` when the child was successfully removed, false otherwise.

***

### setContentSource()

> **setContentSource**(`contentSource`): `void`

Replaces the content source used by this context.

#### Parameters

##### contentSource

[`ContentSource`](#)

The content source.

#### Returns

`void`

***

### setEnvironment()

> **setEnvironment**(`environment`): `void`

Replaces the environment used by this context.

#### Parameters

##### environment

[`ConfigurableEnvironment`](../../environment/interfaces/ConfigurableEnvironment.md)

The environment.

#### Returns

`void`

***

### setId()

> **setId**(`id`): `void`

Updates the identifier assigned to this context.

#### Parameters

##### id

`number`

The id.

#### Returns

`void`

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

***

### setName()

> **setName**(`name`): `void`

Updates the context name.

#### Parameters

##### name

`string`

The name.

#### Returns

`void`

***

### setParent()

> **setParent**(`parent`): `void`

Reassigns the parent context and keeps the child list in sync.

#### Parameters

##### parent

[`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)

The parent context.

#### Returns

`void`

#### Overrides

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).setParent`

***

### setThemeName()

> **setThemeName**(`themeName`): `void`

Updates the default theme name.

#### Parameters

##### themeName

`string`

The theme name.

#### Returns

`void`

***

### setThemeResolver()

> **setThemeResolver**(`themeResolver`): `void`

Overrides the theme resolver used by this context.

#### Parameters

##### themeResolver

`ThemeResolver`

The theme resolver.

#### Returns

`void`

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

[`ContextToken`](../../index/classes/ContextToken.md)\<`T`\>

(the scope-entry key) The name or ContextToken under which to register the value.

###### value

`T`

The value to register.

##### Returns

`void`

##### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).setValue`

#### Call Signature

> **setValue**\<`T`\>(`name`, `value`): `void`

Sets a value by name.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### name

`string`

The value name.

###### value

`T`

The value to register.

##### Returns

`void`

##### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).setValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).shouldEagerlyInstantiate`

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

The prefix.

##### schema

`S`

The schema.

#### Returns

`output`\<`S`\> \| `undefined`

The value.

***

### unsubscribeRefresh()

> **unsubscribeRefresh**(): `void`

Detaches the refresh listener and its fail-loud handler from the wired
environment (ARC-6): a closed context must not stay reachable through
the environment, and a later `refresh()` must not write into it.

#### Returns

`void`
