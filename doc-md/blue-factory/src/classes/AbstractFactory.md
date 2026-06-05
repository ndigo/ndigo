[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / AbstractFactory

# Abstract Class: AbstractFactory

Defined in: packages/blue-factory/src/factory.ts:173

An abstract base class for implementing a [ConfigurableFactory](../interfaces/ConfigurableFactory.md) and [ScopedFactory](../interfaces/ScopedFactory.md).

## Extended by

- [`DefaultFactory`](DefaultFactory.md)

## Implements

- [`ConfigurableFactory`](../interfaces/ConfigurableFactory.md)
- [`ScopedFactory`](../interfaces/ScopedFactory.md)

## Constructors

### Constructor

> **new AbstractFactory**(): `AbstractFactory`

Defined in: packages/blue-factory/src/factory.ts:220

Creates a new AbstractFactory instance and initializes its scope registry and default scopes.

#### Returns

`AbstractFactory`

## Properties

### processors

> **processors**: [`EntryProcessor`](../type-aliases/EntryProcessor.md)[]

Defined in: packages/blue-factory/src/factory.ts:186

A list of entry processors applied to instances.

***

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:191

Indicates if there are any construction-aware processors.

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:195

Indicates if there are any destruction-aware processors.

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Defined in: packages/blue-factory/src/factory.ts:199

Indicates if there are any initialization-aware processors.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-factory/src/factory.ts:205

Returns the string tag for this factory.

##### Returns

`string`

Always 'Factory'.

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

#### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`parent`](../interfaces/ConfigurableFactory.md#parent)

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

#### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`addProcessor`](../interfaces/ConfigurableFactory.md#addprocessor)

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

##### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`destroyValue`](../interfaces/ConfigurableFactory.md#destroyvalue)

#### Call Signature

> **destroyValue**(`name`): `void`

Defined in: packages/blue-factory/src/factory.ts:291

Destroys a value managed by the factory.

##### Parameters

###### name

`string`

##### Returns

`void`

##### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`destroyValue`](../interfaces/ConfigurableFactory.md#destroyvalue)

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

#### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`getInstance`](../interfaces/ConfigurableFactory.md#getinstance)

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

##### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`getValue`](../interfaces/ConfigurableFactory.md#getvalue)

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

##### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`getValue`](../interfaces/ConfigurableFactory.md#getvalue)

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

#### Implementation of

[`ScopedFactory`](../interfaces/ScopedFactory.md).[`destroyScopedValue`](../interfaces/ScopedFactory.md#destroyscopedvalue)

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

#### Implementation of

[`ScopedFactory`](../interfaces/ScopedFactory.md).[`getScope`](../interfaces/ScopedFactory.md#getscope)

***

### getScopeNames()

> **getScopeNames**(): `string`[]

Defined in: packages/blue-factory/src/factory.ts:387

Returns an array of all registered scope names.

#### Returns

`string`[]

An array of PossibleScope names.

#### Implementation of

[`ScopedFactory`](../interfaces/ScopedFactory.md).[`getScopeNames`](../interfaces/ScopedFactory.md#getscopenames)

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

#### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`hasOwnValue`](../interfaces/ConfigurableFactory.md#hasownvalue)

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

##### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`hasValue`](../interfaces/ConfigurableFactory.md#hasvalue)

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

##### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`hasValue`](../interfaces/ConfigurableFactory.md#hasvalue)

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

#### Implementation of

[`ScopedFactory`](../interfaces/ScopedFactory.md).[`registerScope`](../interfaces/ScopedFactory.md#registerscope)

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

#### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`setParent`](../interfaces/ConfigurableFactory.md#setparent)

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

##### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`setValue`](../interfaces/ConfigurableFactory.md#setvalue)

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

##### Implementation of

[`ConfigurableFactory`](../interfaces/ConfigurableFactory.md).[`setValue`](../interfaces/ConfigurableFactory.md#setvalue)

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
