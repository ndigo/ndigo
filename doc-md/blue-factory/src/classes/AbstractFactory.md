[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / AbstractFactory

# Abstract Class: AbstractFactory

Defined in: packages/blue-factory/src/factory.ts:157

## Extended by

- [`DefaultFactory`](DefaultFactory.md)

## Implements

- [`ConfigurableFactory`](../interfaces/ConfigurableFactory.md)

## Constructors

### Constructor

> **new AbstractFactory**(): `AbstractFactory`

Defined in: packages/blue-factory/src/factory.ts:174

#### Returns

`AbstractFactory`

## Properties

### processors

> **processors**: [`EntryProcessor`](../type-aliases/EntryProcessor.md)[]

Defined in: packages/blue-factory/src/factory.ts:160

***

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:162

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:163

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:164

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-factory/src/factory.ts:166

##### Returns

`string`

***

### parent

#### Get Signature

> **get** **parent**(): [`Factory`](../interfaces/Factory.md)

Defined in: packages/blue-factory/src/factory.ts:170

##### Returns

[`Factory`](../interfaces/Factory.md)

#### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`parent`](../interfaces/ConfigurableFactory.md#parent)

## Methods

### addProcessor()

> **addProcessor**(`processor`): `void`

Defined in: packages/blue-factory/src/factory.ts:196

#### Parameters

##### processor

[`EntryProcessor`](../type-aliases/EntryProcessor.md)

#### Returns

`void`

#### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`addProcessor`](../interfaces/ConfigurableFactory.md#addprocessor)

***

### destroyValue()

> **destroyValue**(`name`): `void`

Defined in: packages/blue-factory/src/factory.ts:228

#### Parameters

##### name

`string`

#### Returns

`void`

#### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`destroyValue`](../interfaces/ConfigurableFactory.md#destroyvalue)

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

#### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`getInstance`](../interfaces/ConfigurableFactory.md#getinstance)

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

#### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`getValue`](../interfaces/ConfigurableFactory.md#getvalue)

***

### hasConstructor()

> **hasConstructor**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:256

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### hasInstance()

> **hasInstance**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:260

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:264

#### Parameters

##### name

`string`

#### Returns

`boolean`

#### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`hasOwnValue`](../interfaces/ConfigurableFactory.md#hasownvalue)

***

### hasValue()

> **hasValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:268

#### Parameters

##### name

`string`

#### Returns

`boolean`

#### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`hasValue`](../interfaces/ConfigurableFactory.md#hasvalue)

***

### setParent()

> **setParent**(`parent`): `void`

Defined in: packages/blue-factory/src/factory.ts:272

#### Parameters

##### parent

[`Factory`](../interfaces/Factory.md)

#### Returns

`void`

#### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`setParent`](../interfaces/ConfigurableFactory.md#setparent)

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

#### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`setValue`](../interfaces/ConfigurableFactory.md#setvalue)

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

***

### \_applyProcessorsBeforeDestruction()

> `protected` **\_applyProcessorsBeforeDestruction**(`name`, `instance`): `void`

Defined in: packages/blue-factory/src/factory.ts:387

#### Parameters

##### name

`string`

##### instance

[`Destroyable`](../interfaces/Destroyable.md)

#### Returns

`void`

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
