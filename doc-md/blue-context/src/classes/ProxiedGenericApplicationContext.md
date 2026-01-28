[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ProxiedGenericApplicationContext

# Class: ProxiedGenericApplicationContext

Defined in: packages/blue-context/src/context.ts:283

## Implements

external:Record

## Extends

- [`GenericApplicationContext`](GenericApplicationContext.md)

## Implements

- `Record`\<`string`, `any`\>

## Indexable

\[`key`: `string`\]: `any`

## Constructors

### Constructor

> **new ProxiedGenericApplicationContext**(`name`, `data?`): `ProxiedGenericApplicationContext`

Defined in: packages/blue-context/src/context.ts:286

#### Parameters

##### name

`string`

##### data?

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

#### Returns

`ProxiedGenericApplicationContext`

#### Overrides

[`GenericApplicationContext`](GenericApplicationContext.md).[`constructor`](GenericApplicationContext.md#constructor)

## Properties

### createdTimestamp

> **createdTimestamp**: `number`

Defined in: packages/blue-context/src/context.ts:146

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`createdTimestamp`](GenericApplicationContext.md#createdtimestamp)

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-context/src/context.ts:147

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroyed`](GenericApplicationContext.md#destroyed)

***

### destroyedTimestamp?

> `optional` **destroyedTimestamp**: `number`

Defined in: packages/blue-context/src/context.ts:148

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroyedTimestamp`](GenericApplicationContext.md#destroyedtimestamp)

***

### processors

> **processors**: [`EntryProcessor`](../../../blue-factory/src/type-aliases/EntryProcessor.md)[]

Defined in: packages/blue-factory/src/factory.ts:160

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`processors`](GenericApplicationContext.md#processors)

***

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:162

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasConstructionAwareProcessors`](GenericApplicationContext.md#hasconstructionawareprocessors)

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:163

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasDestructionAwareProcessors`](GenericApplicationContext.md#hasdestructionawareprocessors)

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:164

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasInitializationAwareProcessors`](GenericApplicationContext.md#hasinitializationawareprocessors)

## Accessors

### environment

#### Get Signature

> **get** **environment**(): [`Environment`](../interfaces/Environment.md)

Defined in: packages/blue-context/src/context.ts:150

##### Returns

[`Environment`](../interfaces/Environment.md)

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`environment`](GenericApplicationContext.md#environment)

***

### id

#### Get Signature

> **get** **id**(): `number`

Defined in: packages/blue-context/src/context.ts:157

##### Returns

`number`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`id`](GenericApplicationContext.md#id)

***

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: packages/blue-context/src/context.ts:161

##### Returns

`string`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`name`](GenericApplicationContext.md#name)

***

### parent

#### Get Signature

> **get** **parent**(): [`ApplicationContext`](../interfaces/ApplicationContext.md)

Defined in: packages/blue-context/src/context.ts:165

##### Returns

[`ApplicationContext`](../interfaces/ApplicationContext.md)

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`parent`](GenericApplicationContext.md#parent)

***

### path

#### Get Signature

> **get** **path**(): `string`

Defined in: packages/blue-context/src/context.ts:169

##### Returns

`string`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`path`](GenericApplicationContext.md#path)

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-factory/src/factory.ts:166

##### Returns

`string`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`[toStringTag]`](GenericApplicationContext.md#tostringtag)

## Methods

### bubble()

> **bubble**(`type`, ...`data`): `void`

Defined in: packages/blue-context/src/context.ts:231

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

##### data

...`any`[]

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`bubble`](GenericApplicationContext.md#bubble)

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-context/src/context.ts:235

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroy`](GenericApplicationContext.md#destroy)

***

### getContent()

> **getContent**(`key`, `language`): `string`

Defined in: packages/blue-context/src/context.ts:254

#### Parameters

##### key

`string`

##### language

`string`

#### Returns

`string`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getContent`](GenericApplicationContext.md#getcontent)

***

### setEnvironment()

> **setEnvironment**(`environment`): `void`

Defined in: packages/blue-context/src/context.ts:258

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

Defined in: packages/blue-context/src/context.ts:262

#### Parameters

##### id

`number`

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setId`](GenericApplicationContext.md#setid)

***

### setName()

> **setName**(`name`): `void`

Defined in: packages/blue-context/src/context.ts:266

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

Defined in: packages/blue-context/src/context.ts:270

#### Parameters

##### parent

[`ApplicationContext`](../interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`setParent`](GenericApplicationContext.md#setparent)

***

### \_createEnvironment()

> `protected` **\_createEnvironment**(): [`Environment`](../interfaces/Environment.md)

Defined in: packages/blue-context/src/context.ts:274

#### Returns

[`Environment`](../interfaces/Environment.md)

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_createEnvironment`](GenericApplicationContext.md#_createenvironment)

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

[`GenericApplicationContext`](GenericApplicationContext.md).[`emit`](GenericApplicationContext.md#emit)

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Defined in: packages/blue-context/src/event-emitter.ts:21

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`eventTypes`](GenericApplicationContext.md#eventtypes)

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

[`GenericApplicationContext`](GenericApplicationContext.md).[`listenerCount`](GenericApplicationContext.md#listenercount)

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

[`GenericApplicationContext`](GenericApplicationContext.md).[`listeners`](GenericApplicationContext.md#listeners)

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

[`GenericApplicationContext`](GenericApplicationContext.md).[`on`](GenericApplicationContext.md#on)

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

[`GenericApplicationContext`](GenericApplicationContext.md).[`off`](GenericApplicationContext.md#off)

***

### getResource()

> **getResource**(`location`): `Promise`\<[`Resource`](../interfaces/Resource.md)\<`any`\>\>

Defined in: packages/blue-context/src/resource.ts:16

#### Parameters

##### location

`string`

#### Returns

`Promise`\<[`Resource`](../interfaces/Resource.md)\<`any`\>\>

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getResource`](GenericApplicationContext.md#getresource)

***

### addProcessor()

> **addProcessor**(`processor`): `void`

Defined in: packages/blue-factory/src/factory.ts:196

#### Parameters

##### processor

[`EntryProcessor`](../../../blue-factory/src/type-aliases/EntryProcessor.md)

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`addProcessor`](GenericApplicationContext.md#addprocessor)

***

### destroyValue()

> **destroyValue**(`name`): `void`

Defined in: packages/blue-factory/src/factory.ts:228

#### Parameters

##### name

`string`

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`destroyValue`](GenericApplicationContext.md#destroyvalue)

***

### getInstance()

> **getInstance**\<`T`\>(`name`, `argumentsList`): `T`

Defined in: packages/blue-factory/src/factory.ts:239

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

##### argumentsList

`any`[] = `[]`

#### Returns

`T`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getInstance`](GenericApplicationContext.md#getinstance)

***

### getValue()

> **getValue**\<`T`\>(`name`, `argumentsList`): `T`

Defined in: packages/blue-factory/src/factory.ts:243

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

##### argumentsList

`any`[] = `[]`

#### Returns

`T`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`getValue`](GenericApplicationContext.md#getvalue)

***

### hasConstructor()

> **hasConstructor**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:256

#### Parameters

##### name

`string`

#### Returns

`boolean`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasConstructor`](GenericApplicationContext.md#hasconstructor)

***

### hasInstance()

> **hasInstance**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:260

#### Parameters

##### name

`string`

#### Returns

`boolean`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasInstance`](GenericApplicationContext.md#hasinstance)

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:264

#### Parameters

##### name

`string`

#### Returns

`boolean`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasOwnValue`](GenericApplicationContext.md#hasownvalue)

***

### hasValue()

> **hasValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:268

#### Parameters

##### name

`string`

#### Returns

`boolean`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`hasValue`](GenericApplicationContext.md#hasvalue)

***

### setValue()

> **setValue**\<`T`\>(`name`, `value`): `void`

Defined in: packages/blue-factory/src/factory.ts:276

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

[`GenericApplicationContext`](GenericApplicationContext.md).[`setValue`](GenericApplicationContext.md#setvalue)

***

### \_applyProcessorsAfterConstruction()

> `protected` **\_applyProcessorsAfterConstruction**\<`T`\>(`name`, `instance`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:322

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

##### instance

`T`

#### Returns

`boolean`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_applyProcessorsAfterConstruction`](GenericApplicationContext.md#_applyprocessorsafterconstruction)

***

### \_applyProcessorsAfterInitialization()

> `protected` **\_applyProcessorsAfterInitialization**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/src/factory.ts:342

#### Type Parameters

##### T

`T`

#### Parameters

##### name

`string`

##### instance

`T`

#### Returns

`T`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_applyProcessorsAfterInitialization`](GenericApplicationContext.md#_applyprocessorsafterinitialization)

***

### \_applyProcessorsBeforeConstruction()

> `protected` **\_applyProcessorsBeforeConstruction**\<`T`\>(`name`, `constructor`, `argumentsList`): `T`

Defined in: packages/blue-factory/src/factory.ts:363

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

##### constructor

`Function`

##### argumentsList

`any`[] = `[]`

#### Returns

`T`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_applyProcessorsBeforeConstruction`](GenericApplicationContext.md#_applyprocessorsbeforeconstruction)

***

### \_applyProcessorsBeforeDestruction()

> `protected` **\_applyProcessorsBeforeDestruction**(`name`, `instance`): `void`

Defined in: packages/blue-factory/src/factory.ts:387

#### Parameters

##### name

`string`

##### instance

[`Destroyable`](../../../blue-factory/src/interfaces/Destroyable.md)

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_applyProcessorsBeforeDestruction`](GenericApplicationContext.md#_applyprocessorsbeforedestruction)

***

### \_applyProcessorsBeforeInitialization()

> `protected` **\_applyProcessorsBeforeInitialization**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/src/factory.ts:400

#### Type Parameters

##### T

`T`

#### Parameters

##### name

`string`

##### instance

`T`

#### Returns

`T`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_applyProcessorsBeforeInitialization`](GenericApplicationContext.md#_applyprocessorsbeforeinitialization)

***

### \_configure()

> `protected` **\_configure**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/src/factory.ts:420

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

##### instance

`T`

#### Returns

`T`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_configure`](GenericApplicationContext.md#_configure)

***

### \_create()

> `protected` **\_create**\<`T`\>(`name`, `argumentsList`): `T`

Defined in: packages/blue-factory/src/factory.ts:435

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

##### argumentsList

`any`[] = `[]`

#### Returns

`T`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_create`](GenericApplicationContext.md#_create)

***

### \_initialize()

> `protected` **\_initialize**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/src/factory.ts:453

#### Type Parameters

##### T

`T`

#### Parameters

##### name

`string`

##### instance

`T`

#### Returns

`T`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_initialize`](GenericApplicationContext.md#_initialize)

***

### \_populate()

> `protected` **\_populate**\<`T`\>(`name`, `instance`, `properties`): `void`

Defined in: packages/blue-factory/src/factory.ts:467

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

##### instance

`T`

##### properties

`PropertyDescriptorMap` = `{}`

#### Returns

`void`

#### Inherited from

[`GenericApplicationContext`](GenericApplicationContext.md).[`_populate`](GenericApplicationContext.md#_populate)
