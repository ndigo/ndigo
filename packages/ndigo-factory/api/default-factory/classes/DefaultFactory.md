[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [default-factory](../README.md) / DefaultFactory

# Class: DefaultFactory

An abstract base class for implementing a [ConfigurableFactory](../../factory-contract/interfaces/ConfigurableFactory.md) and [ScopedFactory](../../scope/interfaces/ScopedFactory.md).

## Extends

- [`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md)

## Extended by

- [`ProxiedFactory`](ProxiedFactory.md)

## Indexable

> \[`key`: `string`\]: `unknown`

Allows arbitrary properties to be added to the factory, which are then managed as values.

## Constructors

### Constructor

> **new DefaultFactory**(): `DefaultFactory`

Creates a new AbstractFactory instance and initializes its scope registry and default scopes.

#### Returns

`DefaultFactory`

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`constructor`](../../abstract-factory/classes/AbstractFactory.md#constructor)

## Properties

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Indicates if there are any construction-aware processors.

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`hasConstructionAwareProcessors`](../../abstract-factory/classes/AbstractFactory.md#hasconstructionawareprocessors)

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Indicates if there are any destruction-aware processors.

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`hasDestructionAwareProcessors`](../../abstract-factory/classes/AbstractFactory.md#hasdestructionawareprocessors)

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Indicates if there are any initialization-aware processors.

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`hasInitializationAwareProcessors`](../../abstract-factory/classes/AbstractFactory.md#hasinitializationawareprocessors)

***

### processors

> **processors**: [`EntryProcessor`](../../entry-processor/type-aliases/EntryProcessor.md)[]

A list of entry processors applied to instances.

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`processors`](../../abstract-factory/classes/AbstractFactory.md#processors)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this factory.

##### Returns

`string`

Always 'Factory'.

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`[toStringTag]`](../../abstract-factory/classes/AbstractFactory.md#tostringtag)

***

### parent

#### Get Signature

> **get** **parent**(): [`Factory`](../../factory-contract/interfaces/Factory.md) \| `null`

Returns the parent factory.

##### Returns

[`Factory`](../../factory-contract/interfaces/Factory.md) \| `null`

The parent factory.

The parent factory in the hierarchy.

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`parent`](../../abstract-factory/classes/AbstractFactory.md#parent)

## Methods

### \_checkVersion()

> **\_checkVersion**\<`T`\>(`nameOrToken`, `value`): `void`

Checks the resolved value's version against the token's requiredVersion and warns on mismatch.

#### Type Parameters

##### T

`T`

#### Parameters

##### nameOrToken

`string` \| [`ContextToken`](../../context-tokens/classes/ContextToken.md)\<`T`\>

##### value

`T`

#### Returns

`void`

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`_checkVersion`](../../abstract-factory/classes/AbstractFactory.md#_checkversion)

***

### addProcessor()

> **addProcessor**(`processor`): `void`

Adds an entry processor to the factory.

#### Parameters

##### processor

[`EntryProcessor`](../../entry-processor/type-aliases/EntryProcessor.md)

The entry processor to add.

#### Returns

`void`

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`addProcessor`](../../abstract-factory/classes/AbstractFactory.md#addprocessor)

***

### destroyScopedValue()

> **destroyScopedValue**(`scopeName`, `valueName`): `void`

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

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`destroyScopedValue`](../../abstract-factory/classes/AbstractFactory.md#destroyscopedvalue)

***

### destroyValue()

#### Call Signature

> **destroyValue**\<`T`\>(`token`): `void`

Destroys a value managed by the factory.

##### Type Parameters

###### T

`T` = `unknown`

The type of the value.

##### Parameters

###### token

[`ContextToken`](../../context-tokens/classes/ContextToken.md)\<`T`\>

(the scope-entry key) The name or ContextToken of the value to destroy.

##### Returns

`void`

##### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`destroyValue`](../../abstract-factory/classes/AbstractFactory.md#destroyvalue)

#### Call Signature

> **destroyValue**(`name`): `void`

Destroys a value managed by the factory.

##### Parameters

###### name

`string`

##### Returns

`void`

##### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`destroyValue`](../../abstract-factory/classes/AbstractFactory.md#destroyvalue)

***

### getInstance()

> **getInstance**\<`T`\>(`name`, `argumentsList?`): `T`

Returns the value registered under `name`. Constructor-registered
values are constructed (and configured) through the internal
`_create` path; non-constructor values (instances, primitives) are
returned as-is, preserving identity (CF-12). An unregistered name
resolves to `undefined`.

#### Type Parameters

##### T

`T` = `unknown`

The type of the instance.

#### Parameters

##### name

`string`

The name of the value.

##### argumentsList?

`unknown`[] = `[]`

(constructor arguments) Optional arguments to pass to the constructor if the value is a constructor.

#### Returns

`T`

An instance of the value.

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`getInstance`](../../abstract-factory/classes/AbstractFactory.md#getinstance)

***

### getScope()

> **getScope**(`name`): [`Scope`](../../scope/interfaces/Scope.md)

Retrieves a scope by its name.

#### Parameters

##### name

`string`

The name of the scope.

#### Returns

[`Scope`](../../scope/interfaces/Scope.md)

The Scope instance.

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`getScope`](../../abstract-factory/classes/AbstractFactory.md#getscope)

***

### getScopeNames()

> **getScopeNames**(): `string`[]

Returns an array of all registered scope names.

#### Returns

`string`[]

An array of PossibleScope names.

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`getScopeNames`](../../abstract-factory/classes/AbstractFactory.md#getscopenames)

***

### getValue()

#### Call Signature

> **getValue**\<`T`\>(`token`): `T`

Retrieves a value from the factory, creating it if necessary.

##### Type Parameters

###### T

`T` = `unknown`

The type of the value.

##### Parameters

###### token

[`ContextToken`](../../context-tokens/classes/ContextToken.md)\<`T`\>

(the scope-entry key) The name or ContextToken of the value to retrieve.

##### Returns

`T`

The retrieved value.

##### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`getValue`](../../abstract-factory/classes/AbstractFactory.md#getvalue)

#### Call Signature

> **getValue**\<`T`\>(`name`, `argumentsList?`): `T`

Retrieves a value from the factory, creating it if necessary.

##### Type Parameters

###### T

`T` = `unknown`

The type of the value.

##### Parameters

###### name

`string`

###### argumentsList?

`unknown`[]

##### Returns

`T`

The retrieved value.

##### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`getValue`](../../abstract-factory/classes/AbstractFactory.md#getvalue)

***

### hasConstructor()

> **hasConstructor**(`name`): `boolean`

Checks if the factory has a constructor registered under the given name.

#### Parameters

##### name

`string`

The name of the constructor.

#### Returns

`boolean`

`true` if a constructor is registered, `false` otherwise.

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`hasConstructor`](../../abstract-factory/classes/AbstractFactory.md#hasconstructor)

***

### hasInstance()

> **hasInstance**(`name`): `boolean`

Checks if the factory has an instance registered under the given name.

#### Parameters

##### name

`string`

The name of the instance.

#### Returns

`boolean`

`true` if an instance is registered, `false` otherwise.

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`hasInstance`](../../abstract-factory/classes/AbstractFactory.md#hasinstance)

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

Checks if the factory has its own value (either an instance or a constructor) registered under the given name.

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`boolean`

`true` if this factory has its own value, `false` otherwise.

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`hasOwnValue`](../../abstract-factory/classes/AbstractFactory.md#hasownvalue)

***

### hasValue()

#### Call Signature

> **hasValue**\<`T`\>(`token`): `boolean`

Checks if the factory has a value (either an instance or a constructor) registered under the given name or token.

##### Type Parameters

###### T

`T` = `unknown`

The type of the value.

##### Parameters

###### token

[`ContextToken`](../../context-tokens/classes/ContextToken.md)\<`T`\>

(the scope-entry key) The name or ContextToken of the value.

##### Returns

`boolean`

`true` if a value is registered, `false` otherwise.

##### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`hasValue`](../../abstract-factory/classes/AbstractFactory.md#hasvalue)

#### Call Signature

> **hasValue**(`name`): `boolean`

Checks if the factory has a value (either an instance or a constructor) registered under the given name or token.

##### Parameters

###### name

`string`

##### Returns

`boolean`

`true` if a value is registered, `false` otherwise.

##### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`hasValue`](../../abstract-factory/classes/AbstractFactory.md#hasvalue)

***

### registerScope()

> **registerScope**(`name`, `scope`): `void`

Registers a new scope with the factory.

#### Parameters

##### name

`string`

The name of the scope.

##### scope

[`Scope`](../../scope/interfaces/Scope.md)

The Scope instance to register.

#### Returns

`void`

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`registerScope`](../../abstract-factory/classes/AbstractFactory.md#registerscope)

***

### setParent()

> **setParent**(`parent`): `void`

Sets the parent factory for this hierarchical factory.

#### Parameters

##### parent

[`Factory`](../../factory-contract/interfaces/Factory.md) \| `null`

The parent factory.

#### Returns

`void`

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`setParent`](../../abstract-factory/classes/AbstractFactory.md#setparent)

***

### setValue()

#### Call Signature

> **setValue**\<`T`\>(`token`, `value`): `void`

Sets a value (either a constructor or an instance) in the factory.

##### Type Parameters

###### T

`T` = `unknown`

The type of the value.

##### Parameters

###### token

[`ContextToken`](../../context-tokens/classes/ContextToken.md)\<`T`\>

(the scope-entry key) The name or ContextToken under which to register the value.

###### value

`T`

The value to register.

##### Returns

`void`

##### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`setValue`](../../abstract-factory/classes/AbstractFactory.md#setvalue)

#### Call Signature

> **setValue**\<`T`\>(`name`, `value`): `void`

Sets a value (either a constructor or an instance) in the factory.

##### Type Parameters

###### T

`T` = `unknown`

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

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`setValue`](../../abstract-factory/classes/AbstractFactory.md#setvalue)

***

### shouldEagerlyInstantiate()

> **shouldEagerlyInstantiate**(`name`): `boolean`

Whether the constructor registered under `name` can be eagerly
instantiated by a boot-time "finish sweep" without side effects.

A sweep must skip non-caching scopes (KRN-REV-FACTORY-12): `prototype`
would build an instance that is discarded immediately, and `hash`/
`route` have no active scope key at boot, so `HashScope.getValue` throws
`IllegalStateError` and aborts the sweep. Caching scopes (`singleton`,
`refresh`) and custom scopes are instantiated as before. Unregistered
names return `false`.

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`boolean`

`true` when eager instantiation is safe and non-wasteful.

#### Inherited from

[`AbstractFactory`](../../abstract-factory/classes/AbstractFactory.md).[`shouldEagerlyInstantiate`](../../abstract-factory/classes/AbstractFactory.md#shouldeagerlyinstantiate)
