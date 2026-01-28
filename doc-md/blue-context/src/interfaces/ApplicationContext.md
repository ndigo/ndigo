[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ApplicationContext

# Interface: ApplicationContext

Defined in: packages/blue-context/src/context.ts:39

## Extends

- [`ConfigurableFactory`](../../../blue-factory/src/interfaces/ConfigurableFactory.md).[`ContentSource`](../../../blue-content/src/interfaces/ContentSource.md).[`Destroyable`](../../../blue-factory/src/interfaces/Destroyable.md).[`EventEmitter`](EventEmitter.md).[`EnvironmentSource`](EnvironmentSource.md).[`ResourceLoader`](ResourceLoader.md)

## Extended by

- [`ConfigurableApplicationContext`](ConfigurableApplicationContext.md)

## Properties

### createdTimestamp

> `readonly` **createdTimestamp**: `number`

Defined in: packages/blue-context/src/context.ts:46

***

### id

> `readonly` **id**: `number`

Defined in: packages/blue-context/src/context.ts:47

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-context/src/context.ts:48

***

### path

> `readonly` **path**: `string`

Defined in: packages/blue-context/src/context.ts:49

***

### parent

> **parent**: `ApplicationContext`

Defined in: packages/blue-context/src/context.ts:51

#### Overrides

[`ConfigurableFactory`](../../../blue-factory/src/interfaces/ConfigurableFactory.md).[`parent`](../../../blue-factory/src/interfaces/ConfigurableFactory.md#parent)

***

### destroyedTimestamp?

> `optional` **destroyedTimestamp**: `number`

Defined in: packages/blue-context/src/context.ts:53

***

### environment

> `readonly` **environment**: [`Environment`](Environment.md)

Defined in: packages/blue-context/src/environment.ts:27

#### Inherited from

[`EnvironmentSource`](EnvironmentSource.md).[`environment`](EnvironmentSource.md#environment)

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-factory/src/lifecycle.ts:7

#### Inherited from

[`Destroyable`](../../../blue-factory/src/interfaces/Destroyable.md).[`destroyed`](../../../blue-factory/src/interfaces/Destroyable.md#destroyed)

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

[`ContentSource`](../../../blue-content/src/interfaces/ContentSource.md).[`getContent`](../../../blue-content/src/interfaces/ContentSource.md#getcontent)

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

[`EventEmitter`](EventEmitter.md).[`emit`](EventEmitter.md#emit)

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Defined in: packages/blue-context/src/event-emitter.ts:21

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`eventTypes`](EventEmitter.md#eventtypes)

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

[`EventEmitter`](EventEmitter.md).[`listenerCount`](EventEmitter.md#listenercount)

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

[`EventEmitter`](EventEmitter.md).[`listeners`](EventEmitter.md#listeners)

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

[`EventEmitter`](EventEmitter.md).[`on`](EventEmitter.md#on)

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

[`EventEmitter`](EventEmitter.md).[`off`](EventEmitter.md#off)

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

[`ResourceLoader`](ResourceLoader.md).[`getResource`](ResourceLoader.md#getresource)

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

[`ConfigurableFactory`](../../../blue-factory/src/interfaces/ConfigurableFactory.md).[`getInstance`](../../../blue-factory/src/interfaces/ConfigurableFactory.md#getinstance)

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

[`ConfigurableFactory`](../../../blue-factory/src/interfaces/ConfigurableFactory.md).[`hasOwnValue`](../../../blue-factory/src/interfaces/ConfigurableFactory.md#hasownvalue)

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

[`ConfigurableFactory`](../../../blue-factory/src/interfaces/ConfigurableFactory.md).[`addProcessor`](../../../blue-factory/src/interfaces/ConfigurableFactory.md#addprocessor)

***

### setParent()

> **setParent**(`parent`): `void`

Defined in: packages/blue-factory/src/factory.ts:43

#### Parameters

##### parent

[`Factory`](../../../blue-factory/src/interfaces/Factory.md)

#### Returns

`void`

#### Inherited from

[`ConfigurableFactory`](../../../blue-factory/src/interfaces/ConfigurableFactory.md).[`setParent`](../../../blue-factory/src/interfaces/ConfigurableFactory.md#setparent)

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-factory/src/lifecycle.ts:8

#### Returns

`void`

#### Inherited from

[`Destroyable`](../../../blue-factory/src/interfaces/Destroyable.md).[`destroy`](../../../blue-factory/src/interfaces/Destroyable.md#destroy)

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

[`ConfigurableFactory`](../../../blue-factory/src/interfaces/ConfigurableFactory.md).[`destroyValue`](../../../blue-factory/src/interfaces/ConfigurableFactory.md#destroyvalue)

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

[`ConfigurableFactory`](../../../blue-factory/src/interfaces/ConfigurableFactory.md).[`getValue`](../../../blue-factory/src/interfaces/ConfigurableFactory.md#getvalue)

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

[`ConfigurableFactory`](../../../blue-factory/src/interfaces/ConfigurableFactory.md).[`hasValue`](../../../blue-factory/src/interfaces/ConfigurableFactory.md#hasvalue)

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

[`ConfigurableFactory`](../../../blue-factory/src/interfaces/ConfigurableFactory.md).[`setValue`](../../../blue-factory/src/interfaces/ConfigurableFactory.md#setvalue)
