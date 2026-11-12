[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [configuration](../README.md) / MetadataConfigApplicationContext

# Class: MetadataConfigApplicationContext

Application context that parses `@configuration` classes and registers
their `@entry` values.

## Extends

- [`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md)

## Indexable

> \[`key`: `string`\]: `unknown`

Allows arbitrary properties to be added to the factory, which are then managed as values.

## Constructors

### Constructor

> **new MetadataConfigApplicationContext**(`name?`): `MetadataConfigApplicationContext`

#### Parameters

##### name?

`string`

#### Returns

`MetadataConfigApplicationContext`

#### Overrides

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`constructor`](../../generic-application-context/classes/GenericApplicationContext.md#constructor)

## Properties

### createdTimestamp

> **createdTimestamp**: `number`

Timestamp when the context was created.

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`createdTimestamp`](../../generic-application-context/classes/GenericApplicationContext.md#createdtimestamp)

***

### destroyed

> **destroyed**: `boolean`

Whether the context has been destroyed.

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`destroyed`](../../generic-application-context/classes/GenericApplicationContext.md#destroyed)

***

### destroyedTimestamp?

> `optional` **destroyedTimestamp?**: `number`

Timestamp when the context was destroyed.

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`destroyedTimestamp`](../../generic-application-context/classes/GenericApplicationContext.md#destroyedtimestamp)

***

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Indicates if there are any construction-aware processors.

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`hasConstructionAwareProcessors`](../../generic-application-context/classes/GenericApplicationContext.md#hasconstructionawareprocessors)

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Indicates if there are any destruction-aware processors.

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`hasDestructionAwareProcessors`](../../generic-application-context/classes/GenericApplicationContext.md#hasdestructionawareprocessors)

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Indicates if there are any initialization-aware processors.

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`hasInitializationAwareProcessors`](../../generic-application-context/classes/GenericApplicationContext.md#hasinitializationawareprocessors)

***

### processors

> **processors**: `EntryProcessor`[]

A list of entry processors applied to instances.

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`processors`](../../generic-application-context/classes/GenericApplicationContext.md#processors)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this factory.

##### Returns

`string`

Always 'Factory'.

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`[toStringTag]`](../../generic-application-context/classes/GenericApplicationContext.md#tostringtag)

***

### children

#### Get Signature

> **get** **children**(): readonly [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)[]

The direct child contexts.

##### Returns

readonly [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)[]

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`children`](../../generic-application-context/classes/GenericApplicationContext.md#children)

***

### contentSource

#### Get Signature

> **get** **contentSource**(): [`ContentSource`](#)

The content source used to resolve theme content.

##### Returns

[`ContentSource`](#)

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`contentSource`](../../generic-application-context/classes/GenericApplicationContext.md#contentsource)

***

### environment

#### Get Signature

> **get** **environment**(): [`Environment`](../../environment/interfaces/Environment.md)

The lazily created environment for this context.

##### Returns

[`Environment`](../../environment/interfaces/Environment.md)

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`environment`](../../generic-application-context/classes/GenericApplicationContext.md#environment)

***

### id

#### Get Signature

> **get** **id**(): `number`

The stable identifier assigned at construction.

##### Returns

`number`

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`id`](../../generic-application-context/classes/GenericApplicationContext.md#id)

***

### isActive

#### Get Signature

> **get** **isActive**(): `boolean`

Indicates whether the context has been refreshed and not yet closed.

##### Returns

`boolean`

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`isActive`](../../generic-application-context/classes/GenericApplicationContext.md#isactive)

***

### name

#### Get Signature

> **get** **name**(): `string`

The configured context name.

##### Returns

`string`

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`name`](../../generic-application-context/classes/GenericApplicationContext.md#name)

***

### parent

#### Get Signature

> **get** **parent**(): [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md) \| `null`

The current parent context.

##### Returns

[`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md) \| `null`

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`parent`](../../generic-application-context/classes/GenericApplicationContext.md#parent)

***

### path

#### Get Signature

> **get** **path**(): `string`

The slash-delimited hierarchy path from the root to this context.

##### Returns

`string`

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`path`](../../generic-application-context/classes/GenericApplicationContext.md#path)

***

### themeName

#### Get Signature

> **get** **themeName**(): `string`

The default theme name associated with this context.

##### Returns

`string`

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`themeName`](../../generic-application-context/classes/GenericApplicationContext.md#themename)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`_checkVersion`](../../generic-application-context/classes/GenericApplicationContext.md#_checkversion)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`addProcessor`](../../generic-application-context/classes/GenericApplicationContext.md#addprocessor)

***

### close()

> **close**(): `void`

Closes the context and all descendants.

Teardown sequence: emit `context:close`, close each child, run the
lifecycle processor's `onClose`, destroy managed values, detach the
environment refresh subscription ([unsubscribeRefresh](../../generic-application-context/classes/GenericApplicationContext.md#unsubscriberefresh)), unhook
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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`close`](../../generic-application-context/classes/GenericApplicationContext.md#close)

***

### destroy()

> **destroy**(): `void`

Releases this context's resources.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`destroy`](../../generic-application-context/classes/GenericApplicationContext.md#destroy)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`destroyScopedValue`](../../generic-application-context/classes/GenericApplicationContext.md#destroyscopedvalue)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`destroyValue`](../../generic-application-context/classes/GenericApplicationContext.md#destroyvalue)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`destroyValue`](../../generic-application-context/classes/GenericApplicationContext.md#destroyvalue)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`emit`](../../generic-application-context/classes/GenericApplicationContext.md#emit)

***

### eventTypes()

> **eventTypes**(): [`EventType`](../../event-emitter/type-aliases/EventType.md)[]

Returns the event types with registered listeners.

#### Returns

[`EventType`](../../event-emitter/type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`eventTypes`](../../generic-application-context/classes/GenericApplicationContext.md#eventtypes)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`getContent`](../../generic-application-context/classes/GenericApplicationContext.md#getcontent)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`getInstance`](../../generic-application-context/classes/GenericApplicationContext.md#getinstance)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`getMessage`](../../generic-application-context/classes/GenericApplicationContext.md#getmessage)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`getResource`](../../generic-application-context/classes/GenericApplicationContext.md#getresource)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`getScope`](../../generic-application-context/classes/GenericApplicationContext.md#getscope)

***

### getScopeNames()

> **getScopeNames**(): `string`[]

Returns an array of all registered scope names.

#### Returns

`string`[]

An array of PossibleScope names.

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`getScopeNames`](../../generic-application-context/classes/GenericApplicationContext.md#getscopenames)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`getTheme`](../../generic-application-context/classes/GenericApplicationContext.md#gettheme)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`getValue`](../../generic-application-context/classes/GenericApplicationContext.md#getvalue)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`getValue`](../../generic-application-context/classes/GenericApplicationContext.md#getvalue)

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

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`hasChild`](../../generic-application-context/classes/GenericApplicationContext.md#haschild)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`hasConstructor`](../../generic-application-context/classes/GenericApplicationContext.md#hasconstructor)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`hasInstance`](../../generic-application-context/classes/GenericApplicationContext.md#hasinstance)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`hasOwnValue`](../../generic-application-context/classes/GenericApplicationContext.md#hasownvalue)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`hasValue`](../../generic-application-context/classes/GenericApplicationContext.md#hasvalue)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`hasValue`](../../generic-application-context/classes/GenericApplicationContext.md#hasvalue)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`listenerCount`](../../generic-application-context/classes/GenericApplicationContext.md#listenercount)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`listeners`](../../generic-application-context/classes/GenericApplicationContext.md#listeners)

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

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`newChild`](../../generic-application-context/classes/GenericApplicationContext.md#newchild)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`off`](../../generic-application-context/classes/GenericApplicationContext.md#off)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`on`](../../generic-application-context/classes/GenericApplicationContext.md#on)

***

### refresh()

> **refresh**(): `void`

Initializes the context lifecycle if it is not already active.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`refresh`](../../generic-application-context/classes/GenericApplicationContext.md#refresh)

***

### register()

> **register**(`configClass`): `void`

Registers a configuration class for metadata-driven initialization.

Parsing runs against the environment current at this call: a fresh
`ConfigurationParser` is created per registration. Callers may replace
the environment between registrations (`setEnvironment`), so a memoized
parser would evaluate `@whenProfile` gates, `@propertySource` and
`@property` binding against a stale environment (CF-9).

#### Parameters

##### configClass

`unknown`

The configuration class to parse.

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`registerScope`](../../generic-application-context/classes/GenericApplicationContext.md#registerscope)

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

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`removeChild`](../../generic-application-context/classes/GenericApplicationContext.md#removechild)

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

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`setContentSource`](../../generic-application-context/classes/GenericApplicationContext.md#setcontentsource)

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

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`setEnvironment`](../../generic-application-context/classes/GenericApplicationContext.md#setenvironment)

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

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`setId`](../../generic-application-context/classes/GenericApplicationContext.md#setid)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`setMessageSource`](../../generic-application-context/classes/GenericApplicationContext.md#setmessagesource)

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

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`setName`](../../generic-application-context/classes/GenericApplicationContext.md#setname)

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

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`setParent`](../../generic-application-context/classes/GenericApplicationContext.md#setparent)

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

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`setThemeName`](../../generic-application-context/classes/GenericApplicationContext.md#setthemename)

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

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`setThemeResolver`](../../generic-application-context/classes/GenericApplicationContext.md#setthemeresolver)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`setValue`](../../generic-application-context/classes/GenericApplicationContext.md#setvalue)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`setValue`](../../generic-application-context/classes/GenericApplicationContext.md#setvalue)

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

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`shouldEagerlyInstantiate`](../../generic-application-context/classes/GenericApplicationContext.md#shouldeagerlyinstantiate)

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

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`typedConfig`](../../generic-application-context/classes/GenericApplicationContext.md#typedconfig)

***

### unsubscribeRefresh()

> **unsubscribeRefresh**(): `void`

Detaches the refresh listener and its fail-loud handler from the wired
environment (ARC-6): a closed context must not stay reachable through
the environment, and a later `refresh()` must not write into it.

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](../../generic-application-context/classes/GenericApplicationContext.md).[`unsubscribeRefresh`](../../generic-application-context/classes/GenericApplicationContext.md#unsubscriberefresh)
