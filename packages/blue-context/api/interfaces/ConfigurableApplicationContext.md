[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / ConfigurableApplicationContext

# Interface: ConfigurableApplicationContext

Mutable application-context variant used during configuration.

## Extends

- [`ApplicationContext`](ApplicationContext.md)

## Properties

### children

> `readonly` **children**: readonly [`ApplicationContext`](ApplicationContext.md)[]

A read-only array of child contexts.

#### Inherited from

`ConfigurableApplicationContext`.[`children`](#children)

***

### createdTimestamp

> `readonly` **createdTimestamp**: `number`

The timestamp when this context was created.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`createdTimestamp`](ApplicationContext.md#createdtimestamp)

***

### destroyed

> **destroyed**: `boolean`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`destroyed`](ApplicationContext.md#destroyed)

***

### destroyedTimestamp?

> `optional` **destroyedTimestamp?**: `number`

The timestamp when this context was destroyed, if applicable.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`destroyedTimestamp`](ApplicationContext.md#destroyedtimestamp)

***

### environment

> `readonly` **environment**: [`Environment`](Environment.md)

The environment associated with the component.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`environment`](ApplicationContext.md#environment)

***

### id

> `readonly` **id**: `number`

The unique identifier for this context.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`id`](ApplicationContext.md#id)

***

### isActive

> `readonly` **isActive**: `boolean`

Indicates if the context is currently active.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`isActive`](ApplicationContext.md#isactive)

***

### name

> `readonly` **name**: `string`

The name of this context.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`name`](ApplicationContext.md#name)

***

### parent

> **parent**: [`ApplicationContext`](ApplicationContext.md) \| `null`

The parent context in the hierarchy.

#### Inherited from

`ConfigurableApplicationContext`.[`parent`](#parent)

***

### path

> `readonly` **path**: `string`

The hierarchical path of this context within the application context tree.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`path`](ApplicationContext.md#path)

***

### themeName

> `readonly` **themeName**: `string`

The name of the theme associated with this context.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`themeName`](ApplicationContext.md#themename)

## Methods

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

[`ApplicationContext`](ApplicationContext.md).[`addProcessor`](ApplicationContext.md#addprocessor)

***

### broadcast()

> **broadcast**(`type`, ...`data`): `void`

Broadcasts an event to all direct and indirect children of this context.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The type of the event.

##### data

...`unknown`[]

The data associated with the event.

#### Returns

`void`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`broadcast`](ApplicationContext.md#broadcast)

***

### bubble()

> **bubble**(`type`, ...`data`): `void`

Bubbles an event up the context hierarchy to all parent contexts.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The type of the event.

##### data

...`unknown`[]

The data associated with the event.

#### Returns

`void`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`bubble`](ApplicationContext.md#bubble)

***

### close()

> **close**(): `void`

Closes this application context and all of its descendants, then destroys associated resources.

**Sequence:**
1. Emits `'context:close'` on the closing context.
2. Recursively calls `close()` on each direct child (depth-first).
3. Invokes `onClose()` on the lifecycle processor, if one is configured.
4. Destroys all registered factory values via `_destroyValues()`.
5. Removes this context from its parent's children list.
6. Emits `'context:destroy'` and marks `destroyed = true`.

Calling `close()` on an already-destroyed context is a safe no-op.

#### Returns

`void`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`close`](ApplicationContext.md#close)

***

### destroy()

> **destroy**(): `void`

#### Returns

`void`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`destroy`](ApplicationContext.md#destroy)

***

### destroyValue()

#### Call Signature

> **destroyValue**\<`T`\>(`token`): `void`

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../classes/ContextToken.md)\<`T`\>

##### Returns

`void`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`destroyValue`](ApplicationContext.md#destroyvalue)

#### Call Signature

> **destroyValue**(`name`): `void`

##### Parameters

###### name

`string`

##### Returns

`void`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`destroyValue`](ApplicationContext.md#destroyvalue)

***

### emit()

#### Call Signature

> **emit**\<`K`\>(`type`, ...`payload`): `boolean`

Emits an event to the listeners registered for the given type.

##### Type Parameters

###### K

`K` *extends* keyof [`ContextEvents`](ContextEvents.md)

##### Parameters

###### type

`K`

The event type.

###### payload

...[`ContextEvents`](ContextEvents.md)\[`K`\]

##### Returns

`boolean`

`true` when at least one listener ran.

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`emit`](ApplicationContext.md#emit)

#### Call Signature

> **emit**(`type`, ...`data`): `boolean`

Emits an event to the listeners registered for the given type.

##### Parameters

###### type

[`EventType`](../type-aliases/EventType.md)

The event type.

###### data

...`unknown`[]

Event payload values.

##### Returns

`boolean`

`true` when at least one listener ran.

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`emit`](ApplicationContext.md#emit)

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Returns the event types with registered listeners.

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`eventTypes`](ApplicationContext.md#eventtypes)

***

### getContent()

> **getContent**(`key`, `language`): `Promise`\<`string`\>

Gets translated content for the requested key and language.

Methods are async by default; implementations may be synchronous
under the hood. Resolves to the content string, or the key itself
when no translation exists.

#### Parameters

##### key

`string`

The content key to resolve.

##### language

`string` \| `LanguageCode`

The requested language code.

#### Returns

`Promise`\<`string`\>

A promise of the resolved content string.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getContent`](ApplicationContext.md#getcontent)

***

### getInstance()

> **getInstance**\<`T`\>(`name`): `T`

Returns the value registered under `name`: constructor-registered
values are instantiated, while values registered as instances (or
primitives) are returned as-is, preserving identity (CF-12).

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`T`

The instance (or registered value) specified by the `name`.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getInstance`](ApplicationContext.md#getinstance)

***

### getMessage()

> **getMessage**(`key`, `params?`, `language?`): `Promise`\<`string`\>

Resolves and formats the message for the requested key.

Methods are async by default; implementations may be synchronous
under the hood.

#### Parameters

##### key

`string`

The message key to resolve.

##### params?

`MessageParams`

Optional formatting parameters (interpolation values, plural count, variant).

##### language?

`string` \| `LanguageCode`

The language to use; the source's active language when omitted.

#### Returns

`Promise`\<`string`\>

A promise of the formatted message, or the key itself when no translation exists.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getMessage`](ApplicationContext.md#getmessage)

***

### getResource()

> **getResource**(`location`): `Promise`\<[`Resource`](Resource.md)\<`unknown`\>\>

#### Parameters

##### location

`string`

#### Returns

`Promise`\<[`Resource`](Resource.md)\<`unknown`\>\>

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getResource`](ApplicationContext.md#getresource)

***

### getTheme()

> **getTheme**(`name?`): `Theme`

Retrieves a theme by name.

#### Parameters

##### name?

`string`

The optional name of the theme to retrieve. If not provided, the context's default theme is used.

#### Returns

`Theme`

The requested theme.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getTheme`](ApplicationContext.md#gettheme)

***

### getValue()

#### Call Signature

> **getValue**\<`T`\>(`token`): `T`

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../classes/ContextToken.md)\<`T`\>

##### Returns

`T`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getValue`](ApplicationContext.md#getvalue)

#### Call Signature

> **getValue**\<`T`\>(`name`): `T`

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### name

`string`

##### Returns

`T`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getValue`](ApplicationContext.md#getvalue)

***

### hasChild()

> **hasChild**(`node`): `boolean`

Checks if this context has a specific child context.

#### Parameters

##### node

[`ApplicationContext`](ApplicationContext.md)

The application context to check for.

#### Returns

`boolean`

True if the context is a child, false otherwise.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`hasChild`](ApplicationContext.md#haschild)

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

Determines whether this factory contains a value with the given name.

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`boolean`

`true` if this factory contains the value, `false` otherwise.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`hasOwnValue`](ApplicationContext.md#hasownvalue)

***

### hasValue()

#### Call Signature

> **hasValue**\<`T`\>(`token`): `boolean`

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../classes/ContextToken.md)\<`T`\>

##### Returns

`boolean`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`hasValue`](ApplicationContext.md#hasvalue)

#### Call Signature

> **hasValue**(`name`): `boolean`

##### Parameters

###### name

`string`

##### Returns

`boolean`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`hasValue`](ApplicationContext.md#hasvalue)

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

[`ApplicationContext`](ApplicationContext.md).[`listenerCount`](ApplicationContext.md#listenercount)

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

[`ApplicationContext`](ApplicationContext.md).[`listeners`](ApplicationContext.md#listeners)

***

### newChild()

> **newChild**(`name?`, `data?`): [`ApplicationContext`](ApplicationContext.md)

Creates a new child application context.

#### Parameters

##### name?

`string`

The optional name for the new child context.

##### data?

`JSONObject`

Optional initial data for the child context.

#### Returns

[`ApplicationContext`](ApplicationContext.md)

The newly created child application context.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`newChild`](ApplicationContext.md#newchild)

***

### off()

#### Call Signature

> **off**\<`K`\>(`type`, `listener`): `this`

Removes a listener for an event type.

##### Type Parameters

###### K

`K` *extends* keyof [`ContextEvents`](ContextEvents.md)

##### Parameters

###### type

`K`

The event type.

###### listener

(...`payload`) => `void`

The listener to remove.

##### Returns

`this`

This emitter.

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`off`](ApplicationContext.md#off)

#### Call Signature

> **off**(`type`, `listener`): `this`

Removes a listener for an event type.

##### Parameters

###### type

[`EventType`](../type-aliases/EventType.md)

The event type.

###### listener

`Function`

The listener to remove.

##### Returns

`this`

This emitter.

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`off`](ApplicationContext.md#off)

***

### on()

#### Call Signature

> **on**\<`K`\>(`type`, `listener`): `this`

Typed event overloads (AD-34 D2): lifecycle events deliver their
[ContextEvents](ContextEvents.md) payloads to the listener; any other event type
falls through to the raw `EventEmitter` surface.

##### Type Parameters

###### K

`K` *extends* keyof [`ContextEvents`](ContextEvents.md)

##### Parameters

###### type

`K`

###### listener

(...`payload`) => `void`

##### Returns

`this`

##### Example

```ts
context.on('context:refresh', (refreshed) => refreshed.isActive); // typed
context.on('custom:event', (...data: unknown[]) => {});            // raw
```

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`on`](ApplicationContext.md#on)

#### Call Signature

> **on**(`type`, `listener?`): `this`

Adds a listener for an event type.

##### Parameters

###### type

[`EventType`](../type-aliases/EventType.md) \| [`EventHandlers`](../type-aliases/EventHandlers.md)

The event type.

###### listener?

`Function`

The listener to register.

##### Returns

`this`

This emitter.

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`on`](ApplicationContext.md#on)

***

### refresh()

> **refresh**(): `void`

Activates the application context and runs the full initialization lifecycle.

**Sequence:**
1. Emits `'context:preparing'` — processors may register additional entries.
2. Runs all registered `LifecycleProcessor` and `EntryRegistryProcessor` instances.
3. Emits `'context:refresh'` — signals that the context is fully active.
4. Sets `isActive` to `true`.

Calling `refresh()` on an already-active context is a safe no-op.

#### Returns

`void`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`refresh`](ApplicationContext.md#refresh)

***

### removeChild()

> **removeChild**(`node`): `boolean`

Removes a child context from this context.

#### Parameters

##### node

[`ApplicationContext`](ApplicationContext.md)

The child application context to remove.

#### Returns

`boolean`

True if the child was successfully removed, false otherwise.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`removeChild`](ApplicationContext.md#removechild)

***

### setContentSource()

> **setContentSource**(`contentSource`): `void`

Replaces the content source used by this context.

#### Parameters

##### contentSource

[`ContentSource`](#)

#### Returns

`void`

***

### setEnvironment()

> **setEnvironment**(`environment`): `void`

Replaces the environment used by this context.

#### Parameters

##### environment

[`ConfigurableEnvironment`](ConfigurableEnvironment.md)

#### Returns

`void`

***

### setId()

> **setId**(`id`): `void`

Updates the context identifier.

#### Parameters

##### id

`number`

#### Returns

`void`

***

### setMessageSource()

> **setMessageSource**(`messageSource`): `void`

Replaces the message source used by this context.

#### Parameters

##### messageSource

[`MessageSource`](#)

#### Returns

`void`

***

### setName()

> **setName**(`name`): `void`

Updates the context name.

#### Parameters

##### name

`string`

#### Returns

`void`

***

### setParent()

> **setParent**(`parent`): `void`

Reassigns the parent context and keeps the child list in sync.

#### Parameters

##### parent

[`ApplicationContext`](ApplicationContext.md)

#### Returns

`void`

#### Overrides

[`ApplicationContext`](ApplicationContext.md).[`setParent`](ApplicationContext.md#setparent)

***

### setThemeName()

> **setThemeName**(`themeName`): `void`

Updates the default theme name.

#### Parameters

##### themeName

`string`

#### Returns

`void`

***

### setThemeResolver()

> **setThemeResolver**(`themeResolver`): `void`

Overrides the theme resolver used by this context.

#### Parameters

##### themeResolver

`ThemeResolver`

#### Returns

`void`

***

### setValue()

#### Call Signature

> **setValue**\<`T`\>(`token`, `value`): `void`

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../classes/ContextToken.md)\<`T`\>

###### value

`T`

##### Returns

`void`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`setValue`](ApplicationContext.md#setvalue)

#### Call Signature

> **setValue**\<`T`\>(`name`, `value`): `void`

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### name

`string`

###### value

`T`

##### Returns

`void`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`setValue`](ApplicationContext.md#setvalue)

***

### typedConfig()

> **typedConfig**\<`S`\>(`prefix`, `schema`): `output`\<`S`\> \| `undefined`

Resolves a schema-typed configuration value from the context's
environment (AD-34 D3) — convenience mirror of
`Environment.typedConfig` for context-held callers.

#### Type Parameters

##### S

`S` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

#### Parameters

##### prefix

`string`

Property prefix (a keypath for scalar schemas).

##### schema

`S`

The zod schema describing the value.

#### Returns

`output`\<`S`\> \| `undefined`

The parsed typed value, or `undefined` when absent.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`typedConfig`](ApplicationContext.md#typedconfig)
