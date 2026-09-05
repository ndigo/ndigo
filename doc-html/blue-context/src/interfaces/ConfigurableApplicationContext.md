[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ConfigurableApplicationContext

# Interface: ConfigurableApplicationContext

Defined in: [packages/blue-context/src/context.ts:201](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-201)

Mutable application-context variant used during configuration.

## Extends

- [`ApplicationContext`](ApplicationContext.md)

## Properties

### createdTimestamp

> `readonly` **createdTimestamp**: `number`

Defined in: [packages/blue-context/src/context.ts:77](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-77)

The timestamp when this context was created.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`createdTimestamp`](ApplicationContext.md#createdtimestamp)

***

### children

> `readonly` **children**: readonly [`ApplicationContext`](ApplicationContext.md)[]

Defined in: [packages/blue-context/src/context.ts:81](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-81)

A read-only array of child contexts.

#### Inherited from

`ConfigurableApplicationContext`.[`children`](#children)

***

### id

> `readonly` **id**: `number`

Defined in: [packages/blue-context/src/context.ts:85](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-85)

The unique identifier for this context.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`id`](ApplicationContext.md#id)

***

### isActive

> `readonly` **isActive**: `boolean`

Defined in: [packages/blue-context/src/context.ts:89](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-89)

Indicates if the context is currently active.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`isActive`](ApplicationContext.md#isactive)

***

### name

> `readonly` **name**: `string`

Defined in: [packages/blue-context/src/context.ts:93](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-93)

The name of this context.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`name`](ApplicationContext.md#name)

***

### path

> `readonly` **path**: `string`

Defined in: [packages/blue-context/src/context.ts:97](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-97)

The hierarchical path of this context within the application context tree.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`path`](ApplicationContext.md#path)

***

### themeName

> `readonly` **themeName**: `string`

Defined in: [packages/blue-context/src/context.ts:101](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-101)

The name of the theme associated with this context.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`themeName`](ApplicationContext.md#themename)

***

### parent

> **parent**: [`ApplicationContext`](ApplicationContext.md) \| `null`

Defined in: [packages/blue-context/src/context.ts:106](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-106)

The parent context in the hierarchy.

#### Inherited from

`ConfigurableApplicationContext`.[`parent`](#parent)

***

### destroyedTimestamp?

> `optional` **destroyedTimestamp?**: `number`

Defined in: [packages/blue-context/src/context.ts:111](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-111)

The timestamp when this context was destroyed, if applicable.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`destroyedTimestamp`](ApplicationContext.md#destroyedtimestamp)

***

### environment

> `readonly` **environment**: [`Environment`](Environment.md)

Defined in: [packages/blue-context/src/environment.ts:56](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-56)

The environment associated with the component.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`environment`](ApplicationContext.md#environment)

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-factory/lib/lifecycle.d.ts:3

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`destroyed`](ApplicationContext.md#destroyed)

## Methods

### getContent()

> **getContent**(`key`, `language`): `string`

Defined in: packages/blue-content/lib/content.d.ts:17

Gets translated content for the requested key and language.

#### Parameters

##### key

`string`

The content key to resolve.

##### language

`string`

The requested language code.

#### Returns

`string`

The resolved content string.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getContent`](ApplicationContext.md#getcontent)

***

### broadcast()

> **broadcast**(`type`, ...`data`): `void`

Defined in: [packages/blue-context/src/context.ts:118](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-118)

Broadcasts an event to all direct and indirect children of this context.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The type of the event.

##### data

...`any`[]

The data associated with the event.

#### Returns

`void`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`broadcast`](ApplicationContext.md#broadcast)

***

### bubble()

> **bubble**(`type`, ...`data`): `void`

Defined in: [packages/blue-context/src/context.ts:124](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-124)

Bubbles an event up the context hierarchy to all parent contexts.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The type of the event.

##### data

...`any`[]

The data associated with the event.

#### Returns

`void`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`bubble`](ApplicationContext.md#bubble)

***

### close()

> **close**(): `void`

Defined in: [packages/blue-context/src/context.ts:138](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-138)

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

### getTheme()

> **getTheme**(`name?`): `Theme`

Defined in: [packages/blue-context/src/context.ts:144](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-144)

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

### hasChild()

> **hasChild**(`node`): `boolean`

Defined in: [packages/blue-context/src/context.ts:150](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-150)

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

### newChild()

> **newChild**(`name?`, `data?`): [`ApplicationContext`](ApplicationContext.md)

Defined in: [packages/blue-context/src/context.ts:157](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-157)

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

### refresh()

> **refresh**(): `void`

Defined in: [packages/blue-context/src/context.ts:169](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-169)

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

Defined in: [packages/blue-context/src/context.ts:175](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-175)

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

Defined in: [packages/blue-context/src/context.ts:205](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-205)

Replaces the content source used by this context.

#### Parameters

##### contentSource

[`ContentSource`](#)

#### Returns

`void`

***

### setEnvironment()

> **setEnvironment**(`environment`): `void`

Defined in: [packages/blue-context/src/context.ts:209](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-209)

Replaces the environment used by this context.

#### Parameters

##### environment

[`ConfigurableEnvironment`](ConfigurableEnvironment.md)

#### Returns

`void`

***

### setId()

> **setId**(`id`): `void`

Defined in: [packages/blue-context/src/context.ts:213](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-213)

Updates the context identifier.

#### Parameters

##### id

`number`

#### Returns

`void`

***

### setName()

> **setName**(`name`): `void`

Defined in: [packages/blue-context/src/context.ts:217](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-217)

Updates the context name.

#### Parameters

##### name

`string`

#### Returns

`void`

***

### setParent()

> **setParent**(`parent`): `void`

Defined in: [packages/blue-context/src/context.ts:221](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-221)

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

Defined in: [packages/blue-context/src/context.ts:225](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-225)

Updates the default theme name.

#### Parameters

##### themeName

`string`

#### Returns

`void`

***

### setThemeResolver()

> **setThemeResolver**(`themeResolver`): `void`

Defined in: [packages/blue-context/src/context.ts:229](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-229)

Overrides the theme resolver used by this context.

#### Parameters

##### themeResolver

`ThemeResolver`

#### Returns

`void`

***

### emit()

> **emit**(`type`, ...`data`): `boolean`

Defined in: [packages/blue-context/src/event-emitter.ts:59](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-59)

Emits an event to the listeners registered for the given type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### data

...`any`[]

Event payload values.

#### Returns

`boolean`

`true` when at least one listener ran.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`emit`](ApplicationContext.md#emit)

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Defined in: [packages/blue-context/src/event-emitter.ts:65](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-65)

Returns the event types with registered listeners.

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`eventTypes`](ApplicationContext.md#eventtypes)

***

### listenerCount()

> **listenerCount**(`type`): `number`

Defined in: [packages/blue-context/src/event-emitter.ts:72](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-72)

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

Defined in: [packages/blue-context/src/event-emitter.ts:79](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-79)

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

### on()

> **on**(`type`, `listener?`): `this`

Defined in: [packages/blue-context/src/event-emitter.ts:87](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-87)

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

[`ApplicationContext`](ApplicationContext.md).[`on`](ApplicationContext.md#on)

***

### off()

> **off**(`type`, `listener`): `this`

Defined in: [packages/blue-context/src/event-emitter.ts:95](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-95)

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

[`ApplicationContext`](ApplicationContext.md).[`off`](ApplicationContext.md#off)

***

### getResource()

> **getResource**(`location`): `Promise`\<[`Resource`](Resource.md)\<`any`\>\>

Defined in: [packages/blue-context/src/resource.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/resource.ts#lines-22)

#### Parameters

##### location

`string`

#### Returns

`Promise`\<[`Resource`](Resource.md)\<`any`\>\>

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getResource`](ApplicationContext.md#getresource)

***

### getInstance()

> **getInstance**\<`T`\>(`name`): `T`

Defined in: packages/blue-factory/lib/factory.d.ts:45

Return an instance of the specified value.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`T`

An instance of the value specified by the `name`.

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getInstance`](ApplicationContext.md#getinstance)

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

Defined in: packages/blue-factory/lib/factory.d.ts:60

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

### addProcessor()

> **addProcessor**(`processor`): `void`

Defined in: packages/blue-factory/lib/factory.d.ts:70

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

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-factory/lib/lifecycle.d.ts:4

#### Returns

`void`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`destroy`](ApplicationContext.md#destroy)

***

### destroyValue()

#### Call Signature

> **destroyValue**\<`T`\>(`token`): `void`

Defined in: packages/blue-factory/lib/registry.d.ts:6

##### Type Parameters

###### T

`T` = `any`

##### Parameters

###### token

[`ContextToken`](../classes/ContextToken.md)\<`T`\>

##### Returns

`void`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`destroyValue`](ApplicationContext.md#destroyvalue)

#### Call Signature

> **destroyValue**(`name`): `void`

Defined in: packages/blue-factory/lib/registry.d.ts:7

##### Parameters

###### name

`string`

##### Returns

`void`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`destroyValue`](ApplicationContext.md#destroyvalue)

***

### getValue()

#### Call Signature

> **getValue**\<`T`\>(`token`): `T`

Defined in: packages/blue-factory/lib/registry.d.ts:8

##### Type Parameters

###### T

`T` = `any`

##### Parameters

###### token

[`ContextToken`](../classes/ContextToken.md)\<`T`\>

##### Returns

`T`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getValue`](ApplicationContext.md#getvalue)

#### Call Signature

> **getValue**\<`T`\>(`name`): `T`

Defined in: packages/blue-factory/lib/registry.d.ts:9

##### Type Parameters

###### T

`T` = `any`

##### Parameters

###### name

`string`

##### Returns

`T`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getValue`](ApplicationContext.md#getvalue)

***

### hasValue()

#### Call Signature

> **hasValue**\<`T`\>(`token`): `boolean`

Defined in: packages/blue-factory/lib/registry.d.ts:10

##### Type Parameters

###### T

`T` = `any`

##### Parameters

###### token

[`ContextToken`](../classes/ContextToken.md)\<`T`\>

##### Returns

`boolean`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`hasValue`](ApplicationContext.md#hasvalue)

#### Call Signature

> **hasValue**(`name`): `boolean`

Defined in: packages/blue-factory/lib/registry.d.ts:11

##### Parameters

###### name

`string`

##### Returns

`boolean`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`hasValue`](ApplicationContext.md#hasvalue)

***

### setValue()

#### Call Signature

> **setValue**\<`T`\>(`token`, `value`): `void`

Defined in: packages/blue-factory/lib/registry.d.ts:12

##### Type Parameters

###### T

`T` = `any`

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

Defined in: packages/blue-factory/lib/registry.d.ts:13

##### Type Parameters

###### T

`T` = `any`

##### Parameters

###### name

`string`

###### value

`T`

##### Returns

`void`

##### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`setValue`](ApplicationContext.md#setvalue)
