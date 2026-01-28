[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / DefaultFactory

# Class: DefaultFactory

Defined in: packages/blue-factory/src/factory.ts:548

## Example

```ts
const factory = new DefaultFactory();
factory.setValue( 'foo', 123 );
factory.getValue( 'foo' );
//=> 123
factory.hasValue( 'foo' );
//=> true
factory.deleteValue( 'foo' );
factory.hasValue( 'foo' );
//=> false
```

## Extends

- [`AbstractFactory`](AbstractFactory.md)

## Extended by

- [`ProxiedFactory`](ProxiedFactory.md)

## Constructors

### Constructor

> **new DefaultFactory**(): `DefaultFactory`

Defined in: packages/blue-factory/src/factory.ts:174

#### Returns

`DefaultFactory`

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`constructor`](AbstractFactory.md#constructor)

## Properties

### processors

> **processors**: [`EntryProcessor`](../type-aliases/EntryProcessor.md)[]

Defined in: packages/blue-factory/src/factory.ts:160

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`processors`](AbstractFactory.md#processors)

***

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:162

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`hasConstructionAwareProcessors`](AbstractFactory.md#hasconstructionawareprocessors)

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:163

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`hasDestructionAwareProcessors`](AbstractFactory.md#hasdestructionawareprocessors)

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:164

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`hasInitializationAwareProcessors`](AbstractFactory.md#hasinitializationawareprocessors)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-factory/src/factory.ts:166

##### Returns

`string`

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`[toStringTag]`](AbstractFactory.md#tostringtag)

***

### parent

#### Get Signature

> **get** **parent**(): [`Factory`](../interfaces/Factory.md)

Defined in: packages/blue-factory/src/factory.ts:170

##### Returns

[`Factory`](../interfaces/Factory.md)

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`parent`](AbstractFactory.md#parent)

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

[`AbstractFactory`](AbstractFactory.md).[`addProcessor`](AbstractFactory.md#addprocessor)

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

[`AbstractFactory`](AbstractFactory.md).[`destroyValue`](AbstractFactory.md#destroyvalue)

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

[`AbstractFactory`](AbstractFactory.md).[`getInstance`](AbstractFactory.md#getinstance)

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

[`AbstractFactory`](AbstractFactory.md).[`getValue`](AbstractFactory.md#getvalue)

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

[`AbstractFactory`](AbstractFactory.md).[`hasConstructor`](AbstractFactory.md#hasconstructor)

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

[`AbstractFactory`](AbstractFactory.md).[`hasInstance`](AbstractFactory.md#hasinstance)

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

[`AbstractFactory`](AbstractFactory.md).[`hasOwnValue`](AbstractFactory.md#hasownvalue)

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

[`AbstractFactory`](AbstractFactory.md).[`hasValue`](AbstractFactory.md#hasvalue)

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

[`AbstractFactory`](AbstractFactory.md).[`setParent`](AbstractFactory.md#setparent)

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

[`AbstractFactory`](AbstractFactory.md).[`setValue`](AbstractFactory.md#setvalue)

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

[`AbstractFactory`](AbstractFactory.md).[`_applyProcessorsAfterConstruction`](AbstractFactory.md#_applyprocessorsafterconstruction)

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

[`AbstractFactory`](AbstractFactory.md).[`_applyProcessorsAfterInitialization`](AbstractFactory.md#_applyprocessorsafterinitialization)

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

[`AbstractFactory`](AbstractFactory.md).[`_applyProcessorsBeforeConstruction`](AbstractFactory.md#_applyprocessorsbeforeconstruction)

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

[`AbstractFactory`](AbstractFactory.md).[`_applyProcessorsBeforeDestruction`](AbstractFactory.md#_applyprocessorsbeforedestruction)

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

[`AbstractFactory`](AbstractFactory.md).[`_applyProcessorsBeforeInitialization`](AbstractFactory.md#_applyprocessorsbeforeinitialization)

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

[`AbstractFactory`](AbstractFactory.md).[`_configure`](AbstractFactory.md#_configure)

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

[`AbstractFactory`](AbstractFactory.md).[`_create`](AbstractFactory.md#_create)

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

[`AbstractFactory`](AbstractFactory.md).[`_initialize`](AbstractFactory.md#_initialize)

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

[`AbstractFactory`](AbstractFactory.md).[`_populate`](AbstractFactory.md#_populate)
