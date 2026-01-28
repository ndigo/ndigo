[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / GenericApplicationContext

# Class: GenericApplicationContext

Defined in: packages/blue-context/src/context.ts:140

## See

 - module:context.AsEventEmitter
 - module:context.AsModuleResourceLoader

## Extends

- [`EventEmitter`](../interfaces/EventEmitter.md)\<`this`\> & [`ResourceLoader`](../interfaces/ResourceLoader.md) & [`DefaultFactory`](../../../blue-factory/src/classes/DefaultFactory.md)\<`this`\>

## Extended by

- [`ProxiedGenericApplicationContext`](ProxiedGenericApplicationContext.md)
- [`MetadataConfigApplicationContext`](MetadataConfigApplicationContext.md)

## Constructors

### Constructor

> **new GenericApplicationContext**(`name?`, `data?`): `GenericApplicationContext`

Defined in: packages/blue-context/src/context.ts:183

#### Parameters

##### name?

`string`

##### data?

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

#### Returns

`GenericApplicationContext`

#### Overrides

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).constructor`

## Properties

### createdTimestamp

> **createdTimestamp**: `number`

Defined in: packages/blue-context/src/context.ts:146

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-context/src/context.ts:147

***

### destroyedTimestamp?

> `optional` **destroyedTimestamp**: `number`

Defined in: packages/blue-context/src/context.ts:148

***

### processors

> **processors**: [`EntryProcessor`](../../../blue-factory/src/type-aliases/EntryProcessor.md)[]

Defined in: packages/blue-factory/src/factory.ts:160

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).processors`

***

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:162

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasConstructionAwareProcessors`

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:163

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasDestructionAwareProcessors`

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:164

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasInitializationAwareProcessors`

## Accessors

### environment

#### Get Signature

> **get** **environment**(): [`Environment`](../interfaces/Environment.md)

Defined in: packages/blue-context/src/context.ts:150

##### Returns

[`Environment`](../interfaces/Environment.md)

***

### id

#### Get Signature

> **get** **id**(): `number`

Defined in: packages/blue-context/src/context.ts:157

##### Returns

`number`

***

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: packages/blue-context/src/context.ts:161

##### Returns

`string`

***

### parent

#### Get Signature

> **get** **parent**(): [`ApplicationContext`](../interfaces/ApplicationContext.md)

Defined in: packages/blue-context/src/context.ts:165

##### Returns

[`ApplicationContext`](../interfaces/ApplicationContext.md)

#### Overrides

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).parent`

***

### path

#### Get Signature

> **get** **path**(): `string`

Defined in: packages/blue-context/src/context.ts:169

##### Returns

`string`

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-factory/src/factory.ts:166

##### Returns

`string`

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).[toStringTag]`

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

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-context/src/context.ts:235

#### Returns

`void`

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

***

### setEnvironment()

> **setEnvironment**(`environment`): `void`

Defined in: packages/blue-context/src/context.ts:258

#### Parameters

##### environment

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md)

#### Returns

`void`

***

### setId()

> **setId**(`id`): `void`

Defined in: packages/blue-context/src/context.ts:262

#### Parameters

##### id

`number`

#### Returns

`void`

***

### setName()

> **setName**(`name`): `void`

Defined in: packages/blue-context/src/context.ts:266

#### Parameters

##### name

`string`

#### Returns

`void`

***

### setParent()

> **setParent**(`parent`): `void`

Defined in: packages/blue-context/src/context.ts:270

#### Parameters

##### parent

[`ApplicationContext`](../interfaces/ApplicationContext.md)

#### Returns

`void`

#### Overrides

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).setParent`

***

### \_createEnvironment()

> `protected` **\_createEnvironment**(): [`Environment`](../interfaces/Environment.md)

Defined in: packages/blue-context/src/context.ts:274

#### Returns

[`Environment`](../interfaces/Environment.md)

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).emit`

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Defined in: packages/blue-context/src/event-emitter.ts:21

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

#### Inherited from

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).eventTypes`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).listenerCount`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).listeners`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).on`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).off`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getResource`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).addProcessor`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).destroyValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getInstance`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).getValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasConstructor`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasInstance`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasOwnValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).hasValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory)).setValue`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._applyProcessorsAfterConstruction`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._applyProcessorsAfterInitialization`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._applyProcessorsBeforeConstruction`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._applyProcessorsBeforeDestruction`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._applyProcessorsBeforeInitialization`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._configure`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._create`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._initialize`

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

`AsEventEmitter(AsModuleResourceLoader(DefaultFactory))._populate`
