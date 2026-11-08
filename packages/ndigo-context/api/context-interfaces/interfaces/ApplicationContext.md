[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [context-interfaces](../README.md) / ApplicationContext

# Interface: ApplicationContext

Central application context: a hierarchical, configurable factory and event emitter.

## Extends

- `ChildNode`\<`ApplicationContext`\>
- `ParentNode`\<`ApplicationContext`\>
- `ConfigurableFactory`
- [`ContentSource`](#)
- [`MessageSource`](#)
- `Destroyable`
- [`EventEmitter`](../../event-emitter/interfaces/EventEmitter.md)
- [`EnvironmentSource`](../../environment/interfaces/EnvironmentSource.md)
- [`ResourceLoader`](../../resource/interfaces/ResourceLoader.md)

## Extended by

- [`ConfigurableApplicationContext`](ConfigurableApplicationContext.md)

## Properties

### children

> `readonly` **children**: readonly `ApplicationContext`[]

A read-only array of child contexts.

#### Overrides

`ParentNode.children`

***

### createdTimestamp

> `readonly` **createdTimestamp**: `number`

The timestamp when this context was created.

***

### destroyed

> **destroyed**: `boolean`

Whether the value has been destroyed.

#### Inherited from

`Destroyable.destroyed`

***

### destroyedTimestamp?

> `optional` **destroyedTimestamp?**: `number`

The timestamp when this context was destroyed, if applicable.

***

### environment

> `readonly` **environment**: [`Environment`](../../environment/interfaces/Environment.md)

The environment associated with the component.

#### Inherited from

[`EnvironmentSource`](../../environment/interfaces/EnvironmentSource.md).[`environment`](../../environment/interfaces/EnvironmentSource.md#environment)

***

### id

> `readonly` **id**: `number`

The unique identifier for this context.

***

### isActive

> `readonly` **isActive**: `boolean`

Indicates if the context is currently active.

***

### name

> `readonly` **name**: `string`

The name of this context.

***

### parent

> **parent**: `ApplicationContext` \| `null`

The parent context in the hierarchy.

#### Overrides

`ChildNode.parent`

***

### path

> `readonly` **path**: `string`

The hierarchical path of this context within the application context tree.

***

### themeName

> `readonly` **themeName**: `string`

The name of the theme associated with this context.

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

`ConfigurableFactory.addProcessor`

***

### broadcast()

> **broadcast**(`type`, ...`data`): `void`

Broadcasts an event to all direct and indirect children of this context.

#### Parameters

##### type

[`EventType`](../../event-emitter/type-aliases/EventType.md)

The type of the event.

##### data

...`unknown`[]

The data associated with the event.

#### Returns

`void`

***

### bubble()

> **bubble**(`type`, ...`data`): `void`

Bubbles an event up the context hierarchy to all parent contexts.

#### Parameters

##### type

[`EventType`](../../event-emitter/type-aliases/EventType.md)

The type of the event.

##### data

...`unknown`[]

The data associated with the event.

#### Returns

`void`

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

***

### destroy()

> **destroy**(): `void`

Releases the value's resources.

#### Returns

`void`

#### Inherited from

`Destroyable.destroy`

***

### destroyValue()

#### Call Signature

> **destroyValue**\<`T`\>(`token`): `void`

Destroys a value by token.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../../index/classes/ContextToken.md)\<`T`\>

The value token.

##### Returns

`void`

##### Inherited from

`ConfigurableFactory.destroyValue`

#### Call Signature

> **destroyValue**(`name`): `void`

Destroys a value by name.

##### Parameters

###### name

`string`

The value name.

##### Returns

`void`

##### Inherited from

`ConfigurableFactory.destroyValue`

***

### emit()

#### Call Signature

> **emit**\<`K`\>(`type`, ...`payload`): `boolean`

Emits a typed event.

##### Type Parameters

###### K

`K` *extends* keyof [`ContextEvents`](../../context-events/interfaces/ContextEvents.md)

##### Parameters

###### type

`K`

Event type.

###### payload

...[`ContextEvents`](../../context-events/interfaces/ContextEvents.md)\[`K`\]

Payload.

##### Returns

`boolean`

Whether a listener ran.

##### Overrides

[`EventEmitter`](../../event-emitter/interfaces/EventEmitter.md).[`emit`](../../event-emitter/interfaces/EventEmitter.md#emit)

#### Call Signature

> **emit**(`type`, ...`data`): `boolean`

Emits an event.

##### Parameters

###### type

[`EventType`](../../event-emitter/type-aliases/EventType.md)

Event type.

###### data

...`unknown`[]

Data.

##### Returns

`boolean`

Whether a listener ran.

##### Overrides

`EventEmitter.emit`

***

### eventTypes()

> **eventTypes**(): [`EventType`](../../event-emitter/type-aliases/EventType.md)[]

Returns the event types with registered listeners.

#### Returns

[`EventType`](../../event-emitter/type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

[`EventEmitter`](../../event-emitter/interfaces/EventEmitter.md).[`eventTypes`](../../event-emitter/interfaces/EventEmitter.md#eventtypes)

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

`ContentSource.getContent`

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

`ConfigurableFactory.getInstance`

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

`MessageSource.getMessage`

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

[`ResourceLoader`](../../resource/interfaces/ResourceLoader.md).[`getResource`](../../resource/interfaces/ResourceLoader.md#getresource)

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

***

### getValue()

#### Call Signature

> **getValue**\<`T`\>(`token`): `T`

Retrieves a value by token.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../../index/classes/ContextToken.md)\<`T`\>

The value token.

##### Returns

`T`

##### Inherited from

`ConfigurableFactory.getValue`

#### Call Signature

> **getValue**\<`T`\>(`name`): `T`

Retrieves a value by name.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### name

`string`

The value name.

##### Returns

`T`

##### Inherited from

`ConfigurableFactory.getValue`

***

### hasChild()

> **hasChild**(`node`): `boolean`

Checks if this context has a specific child context.

#### Parameters

##### node

`ApplicationContext`

The application context to check for.

#### Returns

`boolean`

True if the context is a child, false otherwise.

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

`ConfigurableFactory.hasOwnValue`

***

### hasValue()

#### Call Signature

> **hasValue**\<`T`\>(`token`): `boolean`

Checks for a value by token.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../../index/classes/ContextToken.md)\<`T`\>

The value token.

##### Returns

`boolean`

##### Inherited from

`ConfigurableFactory.hasValue`

#### Call Signature

> **hasValue**(`name`): `boolean`

Checks for a value by name.

##### Parameters

###### name

`string`

The value name.

##### Returns

`boolean`

##### Inherited from

`ConfigurableFactory.hasValue`

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

[`EventEmitter`](../../event-emitter/interfaces/EventEmitter.md).[`listenerCount`](../../event-emitter/interfaces/EventEmitter.md#listenercount)

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

[`EventEmitter`](../../event-emitter/interfaces/EventEmitter.md).[`listeners`](../../event-emitter/interfaces/EventEmitter.md#listeners)

***

### newChild()

> **newChild**(`name?`, `data?`): `ApplicationContext`

Creates a new child application context.

#### Parameters

##### name?

`string`

The optional name for the new child context.

##### data?

`JSONObject`

Optional initial data for the child context.

#### Returns

`ApplicationContext`

The newly created child application context.

***

### off()

#### Call Signature

> **off**\<`K`\>(`type`, `listener`): `this`

Removes a typed listener.

##### Type Parameters

###### K

`K` *extends* keyof [`ContextEvents`](../../context-events/interfaces/ContextEvents.md)

##### Parameters

###### type

`K`

Event type.

###### listener

(...`payload`) => `void`

Listener.

##### Returns

`this`

This.

##### Overrides

[`EventEmitter`](../../event-emitter/interfaces/EventEmitter.md).[`off`](../../event-emitter/interfaces/EventEmitter.md#off)

#### Call Signature

> **off**(`type`, `listener`): `this`

Removes a listener.

##### Parameters

###### type

[`EventType`](../../event-emitter/type-aliases/EventType.md)

Event type.

###### listener

`Function`

Listener.

##### Returns

`this`

This.

##### Overrides

`EventEmitter.off`

***

### on()

#### Call Signature

> **on**\<`K`\>(`type`, `listener`): `this`

Registers a typed listener.

##### Type Parameters

###### K

`K` *extends* keyof [`ContextEvents`](../../context-events/interfaces/ContextEvents.md)

##### Parameters

###### type

`K`

Event type.

###### listener

(...`payload`) => `void`

Listener.

##### Returns

`this`

This.

##### Overrides

[`EventEmitter`](../../event-emitter/interfaces/EventEmitter.md).[`on`](../../event-emitter/interfaces/EventEmitter.md#on)

#### Call Signature

> **on**(`type`, `listener?`): `this`

Registers a listener.

##### Parameters

###### type

[`EventType`](../../event-emitter/type-aliases/EventType.md) \| [`EventHandlers`](../../event-emitter/type-aliases/EventHandlers.md)

Event type.

###### listener?

`Function`

Listener.

##### Returns

`this`

This.

##### Overrides

`EventEmitter.on`

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

***

### removeChild()

> **removeChild**(`node`): `boolean`

Removes a child context from this context.

#### Parameters

##### node

`ApplicationContext`

The child application context to remove.

#### Returns

`boolean`

True if the child was successfully removed, false otherwise.

***

### setParent()

> **setParent**(`parent`): `void`

Sets the parent factory.

#### Parameters

##### parent

[`Factory`](#) \| `null`

The parent factory.

#### Returns

`void`

#### Inherited from

`ConfigurableFactory.setParent`

***

### setValue()

#### Call Signature

> **setValue**\<`T`\>(`token`, `value`): `void`

Sets a value by token.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../../index/classes/ContextToken.md)\<`T`\>

The value token.

###### value

`T`

The value.

##### Returns

`void`

##### Inherited from

`ConfigurableFactory.setValue`

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

The value.

##### Returns

`void`

##### Inherited from

`ConfigurableFactory.setValue`

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
