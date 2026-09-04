[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / ProxiedFactory

# Class: ProxiedFactory

Defined in: packages/blue-factory/src/factory.ts:860

A factory that uses a Proxy to allow direct property access for value manipulation.

## Implements

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

> \[`key`: `string`\]: `any`

Allows arbitrary properties to be added to the factory, which are then managed as values.

## Constructors

### Constructor

> **new ProxiedFactory**(): `ProxiedFactory`

Defined in: packages/blue-factory/src/factory.ts:870

Creates a new ProxiedFactory instance.

#### Returns

`ProxiedFactory`

A Proxy that wraps the factory, allowing direct property access.

#### Overrides

[`DefaultFactory`](DefaultFactory.md).[`constructor`](DefaultFactory.md#constructor)

## Properties

### processors

> **processors**: [`EntryProcessor`](../type-aliases/EntryProcessor.md)[]

Defined in: packages/blue-factory/src/factory.ts:187

A list of entry processors applied to instances.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`processors`](DefaultFactory.md#processors)

***

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:192

Indicates if there are any construction-aware processors.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasConstructionAwareProcessors`](DefaultFactory.md#hasconstructionawareprocessors)

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:196

Indicates if there are any destruction-aware processors.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasDestructionAwareProcessors`](DefaultFactory.md#hasdestructionawareprocessors)

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:200

Indicates if there are any initialization-aware processors.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasInitializationAwareProcessors`](DefaultFactory.md#hasinitializationawareprocessors)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-factory/src/factory.ts:206

Returns the string tag for this factory.

##### Returns

`string`

Always 'Factory'.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`[toStringTag]`](DefaultFactory.md#tostringtag)

***

### parent

#### Get Signature

> **get** **parent**(): [`Factory`](../interfaces/Factory.md) \| `null`

Defined in: packages/blue-factory/src/factory.ts:214

Returns the parent factory.

##### Returns

[`Factory`](../interfaces/Factory.md) \| `null`

The parent factory.

The parent factory in the hierarchy.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`parent`](DefaultFactory.md#parent)

## Methods

### addProcessor()

> **addProcessor**(`processor`): `void`

Defined in: packages/blue-factory/src/factory.ts:259

Adds an entry processor to the factory.

#### Parameters

##### processor

[`EntryProcessor`](../type-aliases/EntryProcessor.md)

The entry processor to add.

#### Returns

`void`

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`addProcessor`](DefaultFactory.md#addprocessor)

***

### destroyValue()

#### Call Signature

> **destroyValue**\<`T`\>(`token`): `void`

Defined in: packages/blue-factory/src/factory.ts:296

Destroys a value managed by the factory.

##### Type Parameters

###### T

`T` = `any`

The type of the value.

##### Parameters

###### token

[`ContextToken`](ContextToken.md)\<`T`\>

##### Returns

`void`

##### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`destroyValue`](DefaultFactory.md#destroyvalue)

#### Call Signature

> **destroyValue**(`name`): `void`

Defined in: packages/blue-factory/src/factory.ts:297

Destroys a value managed by the factory.

##### Parameters

###### name

`string`

##### Returns

`void`

##### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`destroyValue`](DefaultFactory.md#destroyvalue)

***

### getInstance()

> **getInstance**\<`T`\>(`name`, `argumentsList?`): `T`

Defined in: packages/blue-factory/src/factory.ts:329

Returns an instance of the specified value.

#### Type Parameters

##### T

`T` = `any`

The type of the instance.

#### Parameters

##### name

`string`

The name of the value.

##### argumentsList?

`any`[] = `[]`

Optional arguments to pass to the constructor if the value is a constructor.

#### Returns

`T`

An instance of the value.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`getInstance`](DefaultFactory.md#getinstance)

***

### getValue()

#### Call Signature

> **getValue**\<`T`\>(`token`): `T`

Defined in: packages/blue-factory/src/factory.ts:340

Retrieves a value from the factory, creating it if necessary.

##### Type Parameters

###### T

`T` = `any`

The type of the value.

##### Parameters

###### token

[`ContextToken`](ContextToken.md)\<`T`\>

##### Returns

`T`

The retrieved value.

##### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`getValue`](DefaultFactory.md#getvalue)

#### Call Signature

> **getValue**\<`T`\>(`name`, `argumentsList?`): `T`

Defined in: packages/blue-factory/src/factory.ts:341

Retrieves a value from the factory, creating it if necessary.

##### Type Parameters

###### T

`T` = `any`

The type of the value.

##### Parameters

###### name

`string`

###### argumentsList?

`any`[]

Optional arguments to pass to the constructor if the value is a constructor.

##### Returns

`T`

The retrieved value.

##### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`getValue`](DefaultFactory.md#getvalue)

***

### \_checkVersion()

> **\_checkVersion**\<`T`\>(`nameOrToken`, `value`): `void`

Defined in: packages/blue-factory/src/factory.ts:381

Checks the resolved value's version against the token's requiredVersion and warns on mismatch.

#### Type Parameters

##### T

`T`

#### Parameters

##### nameOrToken

`string` \| [`ContextToken`](ContextToken.md)\<`T`\>

##### value

`T`

#### Returns

`void`

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`_checkVersion`](DefaultFactory.md#_checkversion)

***

### destroyScopedValue()

> **destroyScopedValue**(`scopeName`, `valueName`): `void`

Defined in: packages/blue-factory/src/factory.ts:411

Destroys a scoped value.

#### Parameters

##### scopeName

`string`

The name of the scope.

##### valueName

`string`

The name of the value within the scope.

#### Returns

`void`

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`destroyScopedValue`](DefaultFactory.md#destroyscopedvalue)

***

### getScope()

> **getScope**(`name`): [`Scope`](../interfaces/Scope.md)

Defined in: packages/blue-factory/src/factory.ts:420

Retrieves a scope by its name.

#### Parameters

##### name

`string`

The name of the scope.

#### Returns

[`Scope`](../interfaces/Scope.md)

The Scope instance.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`getScope`](DefaultFactory.md#getscope)

***

### getScopeNames()

> **getScopeNames**(): `string`[]

Defined in: packages/blue-factory/src/factory.ts:428

Returns an array of all registered scope names.

#### Returns

`string`[]

An array of PossibleScope names.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`getScopeNames`](DefaultFactory.md#getscopenames)

***

### hasConstructor()

> **hasConstructor**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:437

Checks if the factory has a constructor registered under the given name.

#### Parameters

##### name

`string`

The name of the constructor.

#### Returns

`boolean`

`true` if a constructor is registered, `false` otherwise.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasConstructor`](DefaultFactory.md#hasconstructor)

***

### hasInstance()

> **hasInstance**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:446

Checks if the factory has an instance registered under the given name.

#### Parameters

##### name

`string`

The name of the instance.

#### Returns

`boolean`

`true` if an instance is registered, `false` otherwise.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasInstance`](DefaultFactory.md#hasinstance)

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:455

Checks if the factory has its own value (either an instance or a constructor) registered under the given name.

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`boolean`

`true` if this factory has its own value, `false` otherwise.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasOwnValue`](DefaultFactory.md#hasownvalue)

***

### hasValue()

#### Call Signature

> **hasValue**\<`T`\>(`token`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:465

Checks if the factory has a value (either an instance or a constructor) registered under the given name or token.

##### Type Parameters

###### T

`T` = `any`

The type of the value.

##### Parameters

###### token

[`ContextToken`](ContextToken.md)\<`T`\>

##### Returns

`boolean`

`true` if a value is registered, `false` otherwise.

##### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasValue`](DefaultFactory.md#hasvalue)

#### Call Signature

> **hasValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:466

Checks if the factory has a value (either an instance or a constructor) registered under the given name or token.

##### Parameters

###### name

`string`

##### Returns

`boolean`

`true` if a value is registered, `false` otherwise.

##### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasValue`](DefaultFactory.md#hasvalue)

***

### registerScope()

> **registerScope**(`name`, `scope`): `void`

Defined in: packages/blue-factory/src/factory.ts:477

Registers a new scope with the factory.

#### Parameters

##### name

`string`

The name of the scope.

##### scope

[`Scope`](../interfaces/Scope.md)

The Scope instance to register.

#### Returns

`void`

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`registerScope`](DefaultFactory.md#registerscope)

***

### setParent()

> **setParent**(`parent`): `void`

Defined in: packages/blue-factory/src/factory.ts:485

Sets the parent factory for this hierarchical factory.

#### Parameters

##### parent

[`Factory`](../interfaces/Factory.md) \| `null`

The parent factory.

#### Returns

`void`

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`setParent`](DefaultFactory.md#setparent)

***

### setValue()

#### Call Signature

> **setValue**\<`T`\>(`token`, `value`): `void`

Defined in: packages/blue-factory/src/factory.ts:495

Sets a value (either a constructor or an instance) in the factory.

##### Type Parameters

###### T

`T` = `any`

The type of the value.

##### Parameters

###### token

[`ContextToken`](ContextToken.md)\<`T`\>

###### value

`T`

The value to register.

##### Returns

`void`

##### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`setValue`](DefaultFactory.md#setvalue)

#### Call Signature

> **setValue**\<`T`\>(`name`, `value`): `void`

Defined in: packages/blue-factory/src/factory.ts:496

Sets a value (either a constructor or an instance) in the factory.

##### Type Parameters

###### T

`T` = `any`

The type of the value.

##### Parameters

###### name

`string`

###### value

`T`

The value to register.

##### Returns

`void`

##### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`setValue`](DefaultFactory.md#setvalue)

***

### \_applyProcessorsAfterConstruction()

> `protected` **\_applyProcessorsAfterConstruction**\<`T`\>(`name`, `instance`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:561

Applies construction-aware processors after an instance has been constructed.

#### Type Parameters

##### T

`T` = `any`

The type of the instance.

#### Parameters

##### name

`string`

The name of the instance.

##### instance

`T`

The constructed instance.

#### Returns

`boolean`

`true` if properties should be populated, `false` otherwise.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`_applyProcessorsAfterConstruction`](DefaultFactory.md#_applyprocessorsafterconstruction)

***

### \_applyProcessorsAfterInitialization()

> `protected` **\_applyProcessorsAfterInitialization**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/src/factory.ts:588

Applies initialization-aware processors after an instance has been initialized.

#### Type Parameters

##### T

`T`

The type of the instance.

#### Parameters

##### name

`string`

The name of the instance.

##### instance

`T`

The initialized instance.

#### Returns

`T`

The processed instance.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`_applyProcessorsAfterInitialization`](DefaultFactory.md#_applyprocessorsafterinitialization)

***

### \_applyProcessorsBeforeConstruction()

> `protected` **\_applyProcessorsBeforeConstruction**\<`T`\>(`name`, `constructor`, `argumentsList?`): `T` \| `null`

Defined in: packages/blue-factory/src/factory.ts:617

Applies construction-aware processors before an instance is constructed.

#### Type Parameters

##### T

`T` = `any`

The type of the instance.

#### Parameters

##### name

`string`

The name of the instance.

##### constructor

`Function`

The constructor function.

##### argumentsList?

`any`[] = `[]`

Optional arguments to pass to the constructor.

#### Returns

`T` \| `null`

The instance to use, or `null` to proceed with default construction.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`_applyProcessorsBeforeConstruction`](DefaultFactory.md#_applyprocessorsbeforeconstruction)

***

### \_applyProcessorsBeforeDestruction()

> `protected` **\_applyProcessorsBeforeDestruction**(`name`, `instance`): `void`

Defined in: packages/blue-factory/src/factory.ts:646

Applies destruction-aware processors before an instance is destroyed.

#### Parameters

##### name

`string`

The name of the instance.

##### instance

[`Destroyable`](../interfaces/Destroyable.md)

The instance to be destroyed.

#### Returns

`void`

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`_applyProcessorsBeforeDestruction`](DefaultFactory.md#_applyprocessorsbeforedestruction)

***

### \_applyProcessorsBeforeInitialization()

> `protected` **\_applyProcessorsBeforeInitialization**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/src/factory.ts:666

Applies initialization-aware processors before an instance is initialized.

#### Type Parameters

##### T

`T`

The type of the instance.

#### Parameters

##### name

`string`

The name of the instance.

##### instance

`T`

The instance to be initialized.

#### Returns

`T`

The processed instance.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`_applyProcessorsBeforeInitialization`](DefaultFactory.md#_applyprocessorsbeforeinitialization)

***

### \_configure()

> `protected` **\_configure**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/src/factory.ts:694

Configures an instance by populating properties, invoking aware callbacks, and initializing.

#### Type Parameters

##### T

`T` = `any`

The type of the instance.

#### Parameters

##### name

`string`

The name of the instance.

##### instance

`T`

The instance to configure.

#### Returns

`T`

The configured instance.

#### Throws

If configuration fails.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`_configure`](DefaultFactory.md#_configure)

***

### \_create()

> `protected` **\_create**\<`T`\>(`name`, `argumentsList?`): `T`

Defined in: packages/blue-factory/src/factory.ts:716

Creates a new instance from a registered constructor.

#### Type Parameters

##### T

`T` = `any`

The type of the instance.

#### Parameters

##### name

`string`

The name of the constructor.

##### argumentsList?

`any`[] = `[]`

Optional arguments to pass to the constructor.

#### Returns

`T`

The newly created instance.

#### Throws

If instance creation fails.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`_create`](DefaultFactory.md#_create)

***

### \_initialize()

> `protected` **\_initialize**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/src/factory.ts:740

Initializes an instance by applying initialization processors and invoking the `init` method if available.

#### Type Parameters

##### T

`T`

The type of the instance.

#### Parameters

##### name

`string`

The name of the instance.

##### instance

`T`

The instance to initialize.

#### Returns

`T`

The initialized instance.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`_initialize`](DefaultFactory.md#_initialize)

***

### \_populate()

> `protected` **\_populate**\<`T`\>(`name`, `instance`, `properties?`): `void`

Defined in: packages/blue-factory/src/factory.ts:763

Populates properties of an instance, applying construction-aware processors.

#### Type Parameters

##### T

`T` = `any`

The type of the instance.

#### Parameters

##### name

`string`

The name of the instance.

##### instance

`T`

The instance to populate.

##### properties?

`PropertyDescriptorMap` = `{}`

Optional property descriptor map to apply.

#### Returns

`void`

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`_populate`](DefaultFactory.md#_populate)
