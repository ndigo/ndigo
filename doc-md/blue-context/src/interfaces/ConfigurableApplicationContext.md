[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ConfigurableApplicationContext

# Interface: ConfigurableApplicationContext

Defined in: packages/blue-context/src/context.ts:60

## Extends

- [`ApplicationContext`](ApplicationContext.md)

## Properties

### createdTimestamp

> `readonly` **createdTimestamp**: `number`

Defined in: packages/blue-context/src/context.ts:46

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`createdTimestamp`](ApplicationContext.md#createdtimestamp)

***

### id

> `readonly` **id**: `number`

Defined in: packages/blue-context/src/context.ts:47

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`id`](ApplicationContext.md#id)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-context/src/context.ts:48

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`name`](ApplicationContext.md#name)

***

### path

> `readonly` **path**: `string`

Defined in: packages/blue-context/src/context.ts:49

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`path`](ApplicationContext.md#path)

***

### parent

> **parent**: [`ApplicationContext`](ApplicationContext.md)

Defined in: packages/blue-context/src/context.ts:51

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`parent`](ApplicationContext.md#parent)

***

### destroyedTimestamp?

> `optional` **destroyedTimestamp**: `number`

Defined in: packages/blue-context/src/context.ts:53

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`destroyedTimestamp`](ApplicationContext.md#destroyedtimestamp)

***

### environment

> `readonly` **environment**: [`Environment`](Environment.md)

Defined in: packages/blue-context/src/environment.ts:27

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`environment`](ApplicationContext.md#environment)

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-factory/src/lifecycle.ts:7

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`destroyed`](ApplicationContext.md#destroyed)

## Methods

### getContent()

> **getContent**(`key`, `language`): `string`

Defined in: packages/blue-content/src/content.ts:10

#### Parameters

##### key

`string`

##### language

`string`

#### Returns

`string`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getContent`](ApplicationContext.md#getcontent)

***

### setEnvironment()

> **setEnvironment**(`environment`): `void`

Defined in: packages/blue-context/src/context.ts:61

#### Parameters

##### environment

[`ConfigurableEnvironment`](ConfigurableEnvironment.md)

#### Returns

`void`

***

### setId()

> **setId**(`id`): `void`

Defined in: packages/blue-context/src/context.ts:62

#### Parameters

##### id

`number`

#### Returns

`void`

***

### setName()

> **setName**(`name`): `void`

Defined in: packages/blue-context/src/context.ts:63

#### Parameters

##### name

`string`

#### Returns

`void`

***

### setParent()

> **setParent**(`parent`): `void`

Defined in: packages/blue-context/src/context.ts:64

#### Parameters

##### parent

[`ApplicationContext`](ApplicationContext.md)

#### Returns

`void`

#### Overrides

[`ApplicationContext`](ApplicationContext.md).[`setParent`](ApplicationContext.md#setparent)

***

### emit()

> **emit**(`type`, ...`data`): `boolean`

Defined in: packages/blue-context/src/event-emitter.ts:20

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

##### data

...`any`[]

#### Returns

`boolean`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`emit`](ApplicationContext.md#emit)

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Defined in: packages/blue-context/src/event-emitter.ts:21

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`eventTypes`](ApplicationContext.md#eventtypes)

***

### listenerCount()

> **listenerCount**(`type`): `number`

Defined in: packages/blue-context/src/event-emitter.ts:22

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

#### Returns

`number`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`listenerCount`](ApplicationContext.md#listenercount)

***

### listeners()

> **listeners**(`type`): `Function`[]

Defined in: packages/blue-context/src/event-emitter.ts:23

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

#### Returns

`Function`[]

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`listeners`](ApplicationContext.md#listeners)

***

### on()

> **on**(`type`, `listener`): `this`

Defined in: packages/blue-context/src/event-emitter.ts:24

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

##### listener

`Function`

#### Returns

`this`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`on`](ApplicationContext.md#on)

***

### off()

> **off**(`type`, `listener`): `this`

Defined in: packages/blue-context/src/event-emitter.ts:25

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

##### listener

`Function`

#### Returns

`this`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`off`](ApplicationContext.md#off)

***

### getResource()

> **getResource**(`location`): `Promise`\<[`Resource`](Resource.md)\<`any`\>\>

Defined in: packages/blue-context/src/resource.ts:16

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

Defined in: packages/blue-factory/src/factory.ts:33

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

#### Returns

`T`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getInstance`](ApplicationContext.md#getinstance)

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:38

#### Parameters

##### name

`string`

#### Returns

`boolean`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`hasOwnValue`](ApplicationContext.md#hasownvalue)

***

### addProcessor()

> **addProcessor**(`processor`): `void`

Defined in: packages/blue-factory/src/factory.ts:42

#### Parameters

##### processor

[`EntryProcessor`](../../../blue-factory/src/type-aliases/EntryProcessor.md)

#### Returns

`void`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`addProcessor`](ApplicationContext.md#addprocessor)

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-factory/src/lifecycle.ts:8

#### Returns

`void`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`destroy`](ApplicationContext.md#destroy)

***

### destroyValue()

> **destroyValue**(`name`): `void`

Defined in: packages/blue-factory/src/registry.ts:8

#### Parameters

##### name

`string`

#### Returns

`void`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`destroyValue`](ApplicationContext.md#destroyvalue)

***

### getValue()

> **getValue**\<`T`\>(`name`): `T`

Defined in: packages/blue-factory/src/registry.ts:9

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

#### Returns

`T`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`getValue`](ApplicationContext.md#getvalue)

***

### hasValue()

> **hasValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/registry.ts:10

#### Parameters

##### name

`string`

#### Returns

`boolean`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`hasValue`](ApplicationContext.md#hasvalue)

***

### setValue()

> **setValue**\<`T`\>(`name`, `value`): `void`

Defined in: packages/blue-factory/src/registry.ts:11

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

##### value

`T`

#### Returns

`void`

#### Inherited from

[`ApplicationContext`](ApplicationContext.md).[`setValue`](ApplicationContext.md#setvalue)
