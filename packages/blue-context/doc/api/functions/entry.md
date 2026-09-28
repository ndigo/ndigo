[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / entry

# Function: entry()

## Call Signature

> **entry**\<`M`\>(`nameOrTarget`, `maybeContext`): `M`

Marks a method as a configuration entry factory.

Can be used as `@entry()`, `@entry('customName')`, or legacy the `entry` decorator.

### Type Parameters

#### M

`M` *extends* `Function`

### Parameters

#### nameOrTarget

`M`

Entry name or the decorated method target.

#### maybeContext

`ClassMethodDecoratorContext`

Decorator context for legacy usage.

### Returns

`M`

A method decorator when called with a name, or the legacy decorator result.

## Call Signature

> **entry**(`nameOrTarget`): [`EntryDecorator`](#)

Marks a method as a configuration entry factory.

Can be used as `@entry()`, `@entry('customName')`, or legacy the `entry` decorator.

### Parameters

#### nameOrTarget

`string` \| [`ContextToken`](../classes/ContextToken.md)\<`unknown`\>

Entry name or the decorated method target.

### Returns

[`EntryDecorator`](#)

A method decorator when called with a name, or the legacy decorator result.

## Call Signature

> **entry**(): [`EntryDecorator`](#)

Marks a method as a configuration entry factory.

Can be used as `@entry()`, `@entry('customName')`, or legacy the `entry` decorator.

### Returns

[`EntryDecorator`](#)

A method decorator when called with a name, or the legacy decorator result.
