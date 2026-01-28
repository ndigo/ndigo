[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / ProxiedFactory

# Class: ProxiedFactory

Defined in: packages/blue-factory/src/factory.ts:563

## Implements

external:Record

## Example

```ts
const factory = new ProxiedFactory();
factory.foo = 123;
'foo' in factory;
//=> true
delete factory.foo
'foo' in factory;
//=> false
```

## See

[DefaultFactory](DefaultFactory.md)

## Extends

- [`DefaultFactory`](DefaultFactory.md)

## Implements

- `Record`\<`string`, `any`\>

## Indexable

\[`key`: `string`\]: `any`

## Constructors

### Constructor

> **new ProxiedFactory**(): `ProxiedFactory`

Defined in: packages/blue-factory/src/factory.ts:566

#### Returns

`ProxiedFactory`

#### Overrides

[`DefaultFactory`](DefaultFactory.md).[`constructor`](DefaultFactory.md#constructor)

## Properties

### processors

> **processors**: [`EntryProcessor`](../type-aliases/EntryProcessor.md)[]

Defined in: packages/blue-factory/src/factory.ts:160

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`processors`](DefaultFactory.md#processors)

***

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:162

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasConstructionAwareProcessors`](DefaultFactory.md#hasconstructionawareprocessors)

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:163

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasDestructionAwareProcessors`](DefaultFactory.md#hasdestructionawareprocessors)

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:164

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasInitializationAwareProcessors`](DefaultFactory.md#hasinitializationawareprocessors)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-factory/src/factory.ts:166

##### Returns

`string`

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`[toStringTag]`](DefaultFactory.md#tostringtag)

***

### parent

#### Get Signature

> **get** **parent**(): [`Factory`](../interfaces/Factory.md)

Defined in: packages/blue-factory/src/factory.ts:170

##### Returns

[`Factory`](../interfaces/Factory.md)

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`parent`](DefaultFactory.md#parent)

## Methods

### addProcessor()

> **addProcessor**(`processor`): `void`

Defined in: packages/blue-factory/src/factory.ts:196

#### Parameters

##### processor

[`EntryProcessor`](../type-aliases/EntryProcessor.md)

#### Returns

`void`

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`addProcessor`](DefaultFactory.md#addprocessor)

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

[`DefaultFactory`](DefaultFactory.md).[`destroyValue`](DefaultFactory.md#destroyvalue)

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

[`DefaultFactory`](DefaultFactory.md).[`getInstance`](DefaultFactory.md#getinstance)

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

[`DefaultFactory`](DefaultFactory.md).[`getValue`](DefaultFactory.md#getvalue)

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

[`DefaultFactory`](DefaultFactory.md).[`hasConstructor`](DefaultFactory.md#hasconstructor)

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

[`DefaultFactory`](DefaultFactory.md).[`hasInstance`](DefaultFactory.md#hasinstance)

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

[`DefaultFactory`](DefaultFactory.md).[`hasOwnValue`](DefaultFactory.md#hasownvalue)

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

[`DefaultFactory`](DefaultFactory.md).[`hasValue`](DefaultFactory.md#hasvalue)

***

### setParent()

> **setParent**(`parent`): `void`

Defined in: packages/blue-factory/src/factory.ts:272

#### Parameters

##### parent

[`Factory`](../interfaces/Factory.md)

#### Returns

`void`

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`setParent`](DefaultFactory.md#setparent)

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

[`DefaultFactory`](DefaultFactory.md).[`setValue`](DefaultFactory.md#setvalue)

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

[`DefaultFactory`](DefaultFactory.md).[`_applyProcessorsAfterConstruction`](DefaultFactory.md#_applyprocessorsafterconstruction)

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

[`DefaultFactory`](DefaultFactory.md).[`_applyProcessorsAfterInitialization`](DefaultFactory.md#_applyprocessorsafterinitialization)

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

[`DefaultFactory`](DefaultFactory.md).[`_applyProcessorsBeforeConstruction`](DefaultFactory.md#_applyprocessorsbeforeconstruction)

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

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`_applyProcessorsBeforeDestruction`](DefaultFactory.md#_applyprocessorsbeforedestruction)

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

[`DefaultFactory`](DefaultFactory.md).[`_applyProcessorsBeforeInitialization`](DefaultFactory.md#_applyprocessorsbeforeinitialization)

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

[`DefaultFactory`](DefaultFactory.md).[`_configure`](DefaultFactory.md#_configure)

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

[`DefaultFactory`](DefaultFactory.md).[`_create`](DefaultFactory.md#_create)

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

[`DefaultFactory`](DefaultFactory.md).[`_initialize`](DefaultFactory.md#_initialize)

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

[`DefaultFactory`](DefaultFactory.md).[`_populate`](DefaultFactory.md#_populate)
