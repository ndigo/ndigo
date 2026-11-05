[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [factory-shared](../README.md) / construct

# Variable: construct

> **construct**: \{\<`A`, `R`\>(`target`, `argumentsList`, `newTarget?`): `R`; (`target`, `argumentsList`, `newTarget?`): `any`; \}

## Call Signature

> \<`A`, `R`\>(`target`, `argumentsList`, `newTarget?`): `R`

Constructs the target with the elements of specified array as the arguments
and the specified constructor as the `new.target` value.

### Type Parameters

#### A

`A` *extends* readonly `any`[]

#### R

`R`

### Parameters

#### target

new (...`args`) => `R`

The constructor to invoke.

#### argumentsList

`Readonly`\<`A`\>

An array of argument values to be passed to the constructor.

#### newTarget?

new (...`args`) => `any`

The constructor to be used as the `new.target` object.

### Returns

`R`

## Call Signature

> (`target`, `argumentsList`, `newTarget?`): `any`

Constructs the target with the elements of specified array as the arguments
and the specified constructor as the `new.target` value.

### Parameters

#### target

`Function`

The constructor to invoke.

#### argumentsList

`ArrayLike`\<`any`\>

An array of argument values to be passed to the constructor.

#### newTarget?

`Function`

The constructor to be used as the `new.target` object.

### Returns

`any`
