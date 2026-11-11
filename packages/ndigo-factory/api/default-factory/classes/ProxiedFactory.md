[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [default-factory](../README.md) / ProxiedFactory

# Class: ProxiedFactory

A factory that uses a Proxy to allow direct property access for value manipulation.

## Example

```ts
const factory = new ProxiedFactory();
factory.foo = 123;
'foo' in factory; //=> true
delete factory.foo;
'foo' in factory; //=> false
```

## See

[DefaultFactory](DefaultFactory.md)

## Extends

- [`DefaultFactory`](DefaultFactory.md)

## Implements

- `Record`\<`string`, `unknown`\>

## Indexable

> \[`key`: `string`\]: `unknown`

Allows arbitrary properties to be added to the factory, which are then managed as values.

## Constructors

### Constructor

> **new ProxiedFactory**(): `ProxiedFactory`

Creates a new ProxiedFactory instance.

#### Returns

`ProxiedFactory`

A Proxy that wraps the factory, allowing direct property access.

#### Overrides

[`DefaultFactory`](DefaultFactory.md).[`constructor`](DefaultFactory.md#constructor)

## Properties

### hasConstructionAwareProcessors

> **hasConstructionAwareProcessors**: `boolean`

Indicates if there are any construction-aware processors.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasConstructionAwareProcessors`](DefaultFactory.md#hasconstructionawareprocessors)

***

### hasDestructionAwareProcessors

> **hasDestructionAwareProcessors**: `boolean`

Indicates if there are any destruction-aware processors.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasDestructionAwareProcessors`](DefaultFactory.md#hasdestructionawareprocessors)

***

### hasInitializationAwareProcessors

> **hasInitializationAwareProcessors**: `boolean`

Indicates if there are any initialization-aware processors.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasInitializationAwareProcessors`](DefaultFactory.md#hasinitializationawareprocessors)

***

### processors

> **processors**: [`EntryProcessor`](../../entry-processor/type-aliases/EntryProcessor.md)[]

A list of entry processors applied to instances.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`processors`](DefaultFactory.md#processors)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this factory.

##### Returns

`string`

Always 'Factory'.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`[toStringTag]`](DefaultFactory.md#tostringtag)

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

[`DefaultFactory`](DefaultFactory.md).[`parent`](DefaultFactory.md#parent)

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

The value name or token.

##### value

`T`

The resolved value.

#### Returns

`void`

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`_checkVersion`](DefaultFactory.md#_checkversion)

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

[`DefaultFactory`](DefaultFactory.md).[`addProcessor`](DefaultFactory.md#addprocessor)

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

[`DefaultFactory`](DefaultFactory.md).[`destroyScopedValue`](DefaultFactory.md#destroyscopedvalue)

***

### destroyValue()

Destroys a value managed by the factory.

#### Param

**nameOrToken**

The value name or token.

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

[`DefaultFactory`](DefaultFactory.md).[`destroyValue`](DefaultFactory.md#destroyvalue)

#### Call Signature

> **destroyValue**(`name`): `void`

Destroys a value managed by the factory by name.

##### Parameters

###### name

`string`

The value name.

##### Returns

`void`

##### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`destroyValue`](DefaultFactory.md#destroyvalue)

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

[`DefaultFactory`](DefaultFactory.md).[`getInstance`](DefaultFactory.md#getinstance)

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

[`DefaultFactory`](DefaultFactory.md).[`getScope`](DefaultFactory.md#getscope)

***

### getScopeNames()

> **getScopeNames**(): `string`[]

Returns an array of all registered scope names.

#### Returns

`string`[]

An array of PossibleScope names.

#### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`getScopeNames`](DefaultFactory.md#getscopenames)

***

### getValue()

Retrieves a value by name or token.

#### Param

**nameOrToken**

The value name or token.

#### Param

**argumentsList**

Constructor arguments.

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

[`DefaultFactory`](DefaultFactory.md).[`getValue`](DefaultFactory.md#getvalue)

#### Call Signature

> **getValue**\<`T`\>(`name`, `argumentsList?`): `T`

Retrieves a value by name, creating it when necessary.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### name

`string`

The value name.

###### argumentsList?

`unknown`[]

Constructor arguments.

##### Returns

`T`

The retrieved value.

##### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`getValue`](DefaultFactory.md#getvalue)

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

[`DefaultFactory`](DefaultFactory.md).[`hasConstructor`](DefaultFactory.md#hasconstructor)

***

### hasInstance()

> **hasInstance**(`name`): `boolean`

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

Checks whether a value is registered by name or token.

#### Param

**nameOrToken**

The value name or token.

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

[`DefaultFactory`](DefaultFactory.md).[`hasValue`](DefaultFactory.md#hasvalue)

#### Call Signature

> **hasValue**(`name`): `boolean`

Checks whether a value is registered by name.

##### Parameters

###### name

`string`

The value name.

##### Returns

`boolean`

Whether a value is registered.

##### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`hasValue`](DefaultFactory.md#hasvalue)

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

[`DefaultFactory`](DefaultFactory.md).[`registerScope`](DefaultFactory.md#registerscope)

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

[`DefaultFactory`](DefaultFactory.md).[`setParent`](DefaultFactory.md#setparent)

***

### setValue()

Sets a value by name or token.

#### Param

**nameOrToken**

The value name or token.

#### Param

**value**

The value to register.

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

[`DefaultFactory`](DefaultFactory.md).[`setValue`](DefaultFactory.md#setvalue)

#### Call Signature

> **setValue**\<`T`\>(`name`, `value`): `void`

Sets a value by name.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### name

`string`

The value name.

###### value

`T`

The value to register.

##### Returns

`void`

##### Inherited from

[`DefaultFactory`](DefaultFactory.md).[`setValue`](DefaultFactory.md#setvalue)

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

[`DefaultFactory`](DefaultFactory.md).[`shouldEagerlyInstantiate`](DefaultFactory.md#shouldeagerlyinstantiate)
