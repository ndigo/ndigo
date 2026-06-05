[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / DefaultFactory

# Class: DefaultFactory

Defined in: packages/blue-factory/src/factory.ts:798

A default implementation of [AbstractFactory](AbstractFactory.md).

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

Defined in: packages/blue-factory/src/factory.ts:220

Creates a new AbstractFactory instance and initializes its scope registry and default scopes.

#### Returns

`DefaultFactory`

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`constructor`](AbstractFactory.md#constructor)

## Properties

### processors

> **processors**: [`EntryProcessor`](../type-aliases/EntryProcessor.md)[]

Defined in: packages/blue-factory/src/factory.ts:186

A list of entry processors applied to instances.

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`processors`](AbstractFactory.md#processors)

***

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:191

Indicates if there are any construction-aware processors.

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`hasConstructionAwareProcessors`](AbstractFactory.md#hasconstructionawareprocessors)

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:195

Indicates if there are any destruction-aware processors.

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`hasDestructionAwareProcessors`](AbstractFactory.md#hasdestructionawareprocessors)

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:199

Indicates if there are any initialization-aware processors.

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`hasInitializationAwareProcessors`](AbstractFactory.md#hasinitializationawareprocessors)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-factory/src/factory.ts:205

Returns the string tag for this factory.

##### Returns

`string`

Always 'Factory'.

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`[toStringTag]`](AbstractFactory.md#tostringtag)

***

### parent

#### Get Signature

> **get** **parent**(): [`Factory`](../interfaces/Factory.md)

Defined in: packages/blue-factory/src/factory.ts:213

Returns the parent factory.

##### Returns

[`Factory`](../interfaces/Factory.md)

The parent factory.

The parent factory in the hierarchy.

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`parent`](AbstractFactory.md#parent)

## Methods

### addProcessor()

> **addProcessor**(`processor`): `void`

Defined in: packages/blue-factory/src/factory.ts:253

Adds an entry processor to the factory.

#### Parameters

##### processor

[`EntryProcessor`](../type-aliases/EntryProcessor.md)

The entry processor to add.

#### Returns

`void`

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`addProcessor`](AbstractFactory.md#addprocessor)

***

### destroyValue()

#### Call Signature

> **destroyValue**\<`T`\>(`token`): `void`

Defined in: packages/blue-factory/src/factory.ts:290

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

[`AbstractFactory`](AbstractFactory.md).[`destroyValue`](AbstractFactory.md#destroyvalue)

#### Call Signature

> **destroyValue**(`name`): `void`

Defined in: packages/blue-factory/src/factory.ts:291

Destroys a value managed by the factory.

##### Parameters

###### name

`string`

##### Returns

`void`

##### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`destroyValue`](AbstractFactory.md#destroyvalue)

***

### getInstance()

> **getInstance**\<`T`\>(`name`, `argumentsList?`): `T`

Defined in: packages/blue-factory/src/factory.ts:323

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

[`AbstractFactory`](AbstractFactory.md).[`getInstance`](AbstractFactory.md#getinstance)

***

### getValue()

#### Call Signature

> **getValue**\<`T`\>(`token`): `T`

Defined in: packages/blue-factory/src/factory.ts:334

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

[`AbstractFactory`](AbstractFactory.md).[`getValue`](AbstractFactory.md#getvalue)

#### Call Signature

> **getValue**\<`T`\>(`name`, `argumentsList?`): `T`

Defined in: packages/blue-factory/src/factory.ts:335

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

[`AbstractFactory`](AbstractFactory.md).[`getValue`](AbstractFactory.md#getvalue)

***

### destroyScopedValue()

> **destroyScopedValue**(`scopeName`, `valueName`): `void`

Defined in: packages/blue-factory/src/factory.ts:370

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

[`AbstractFactory`](AbstractFactory.md).[`destroyScopedValue`](AbstractFactory.md#destroyscopedvalue)

***

### getScope()

> **getScope**(`name`): [`Scope`](../interfaces/Scope.md)

Defined in: packages/blue-factory/src/factory.ts:379

Retrieves a scope by its name.

#### Parameters

##### name

`string`

The name of the scope.

#### Returns

[`Scope`](../interfaces/Scope.md)

The Scope instance.

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`getScope`](AbstractFactory.md#getscope)

***

### getScopeNames()

> **getScopeNames**(): `string`[]

Defined in: packages/blue-factory/src/factory.ts:387

Returns an array of all registered scope names.

#### Returns

`string`[]

An array of PossibleScope names.

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`getScopeNames`](AbstractFactory.md#getscopenames)

***

### hasConstructor()

> **hasConstructor**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:396

Checks if the factory has a constructor registered under the given name.

#### Parameters

##### name

`string`

The name of the constructor.

#### Returns

`boolean`

`true` if a constructor is registered, `false` otherwise.

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`hasConstructor`](AbstractFactory.md#hasconstructor)

***

### hasInstance()

> **hasInstance**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:405

Checks if the factory has an instance registered under the given name.

#### Parameters

##### name

`string`

The name of the instance.

#### Returns

`boolean`

`true` if an instance is registered, `false` otherwise.

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`hasInstance`](AbstractFactory.md#hasinstance)

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:414

Checks if the factory has its own value (either an instance or a constructor) registered under the given name.

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`boolean`

`true` if this factory has its own value, `false` otherwise.

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`hasOwnValue`](AbstractFactory.md#hasownvalue)

***

### hasValue()

#### Call Signature

> **hasValue**\<`T`\>(`token`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:424

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

[`AbstractFactory`](AbstractFactory.md).[`hasValue`](AbstractFactory.md#hasvalue)

#### Call Signature

> **hasValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:425

Checks if the factory has a value (either an instance or a constructor) registered under the given name or token.

##### Parameters

###### name

`string`

##### Returns

`boolean`

`true` if a value is registered, `false` otherwise.

##### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`hasValue`](AbstractFactory.md#hasvalue)

***

### registerScope()

> **registerScope**(`name`, `scope`): `void`

Defined in: packages/blue-factory/src/factory.ts:436

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

[`AbstractFactory`](AbstractFactory.md).[`registerScope`](AbstractFactory.md#registerscope)

***

### setParent()

> **setParent**(`parent`): `void`

Defined in: packages/blue-factory/src/factory.ts:444

Sets the parent factory for this hierarchical factory.

#### Parameters

##### parent

[`Factory`](../interfaces/Factory.md)

The parent factory.

#### Returns

`void`

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`setParent`](AbstractFactory.md#setparent)

***

### setValue()

#### Call Signature

> **setValue**\<`T`\>(`token`, `value`): `void`

Defined in: packages/blue-factory/src/factory.ts:454

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

[`AbstractFactory`](AbstractFactory.md).[`setValue`](AbstractFactory.md#setvalue)

#### Call Signature

> **setValue**\<`T`\>(`name`, `value`): `void`

Defined in: packages/blue-factory/src/factory.ts:455

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

[`AbstractFactory`](AbstractFactory.md).[`setValue`](AbstractFactory.md#setvalue)

***

### \_applyProcessorsAfterConstruction()

> `protected` **\_applyProcessorsAfterConstruction**\<`T`\>(`name`, `instance`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:515

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

[`AbstractFactory`](AbstractFactory.md).[`_applyProcessorsAfterConstruction`](AbstractFactory.md#_applyprocessorsafterconstruction)

***

### \_applyProcessorsAfterInitialization()

> `protected` **\_applyProcessorsAfterInitialization**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/src/factory.ts:542

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

[`AbstractFactory`](AbstractFactory.md).[`_applyProcessorsAfterInitialization`](AbstractFactory.md#_applyprocessorsafterinitialization)

***

### \_applyProcessorsBeforeConstruction()

> `protected` **\_applyProcessorsBeforeConstruction**\<`T`\>(`name`, `constructor`, `argumentsList?`): `T`

Defined in: packages/blue-factory/src/factory.ts:571

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

`T`

The instance to use, or `null` to proceed with default construction.

#### Inherited from

[`AbstractFactory`](AbstractFactory.md).[`_applyProcessorsBeforeConstruction`](AbstractFactory.md#_applyprocessorsbeforeconstruction)

***

### \_applyProcessorsBeforeDestruction()

> `protected` **\_applyProcessorsBeforeDestruction**(`name`, `instance`): `void`

Defined in: packages/blue-factory/src/factory.ts:600

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

[`AbstractFactory`](AbstractFactory.md).[`_applyProcessorsBeforeDestruction`](AbstractFactory.md#_applyprocessorsbeforedestruction)

***

### \_applyProcessorsBeforeInitialization()

> `protected` **\_applyProcessorsBeforeInitialization**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/src/factory.ts:620

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

[`AbstractFactory`](AbstractFactory.md).[`_applyProcessorsBeforeInitialization`](AbstractFactory.md#_applyprocessorsbeforeinitialization)

***

### \_configure()

> `protected` **\_configure**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/src/factory.ts:648

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

[`AbstractFactory`](AbstractFactory.md).[`_configure`](AbstractFactory.md#_configure)

***

### \_create()

> `protected` **\_create**\<`T`\>(`name`, `argumentsList?`): `T`

Defined in: packages/blue-factory/src/factory.ts:670

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

[`AbstractFactory`](AbstractFactory.md).[`_create`](AbstractFactory.md#_create)

***

### \_initialize()

> `protected` **\_initialize**\<`T`\>(`name`, `instance`): `T`

Defined in: packages/blue-factory/src/factory.ts:694

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

[`AbstractFactory`](AbstractFactory.md).[`_initialize`](AbstractFactory.md#_initialize)

***

### \_populate()

> `protected` **\_populate**\<`T`\>(`name`, `instance`, `properties?`): `void`

Defined in: packages/blue-factory/src/factory.ts:717

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

[`AbstractFactory`](AbstractFactory.md).[`_populate`](AbstractFactory.md#_populate)
