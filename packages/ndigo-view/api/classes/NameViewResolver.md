[**@ndigo/view v0.0.1**](../README.md)

***

[@ndigo/view](../README.md) / NameViewResolver

# Class: NameViewResolver

A simple implementation of [\`ViewResolver\`](../interfaces/ViewResolver.md) that interprets a view name as a value in the current application context.

This resolver can be handy for small applications, keeping all definitions ranging from controllers to views in the same place.

## Extends

- `ApplicationContextAware` & `Null`\<`this`\>

## Implements

- [`ViewResolver`](../interfaces/ViewResolver.md)

## Constructors

### Constructor

> **new NameViewResolver**(): `NameViewResolver`

#### Returns

`NameViewResolver`

#### Inherited from

`AsApplicationContextAware(Null).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### applicationContext

> `readonly` **applicationContext**: `ApplicationContext`

The application context used as the view registry.

## Methods

### resolveViewName()

> **resolveViewName**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md) \| `null`\>

Resolves a view from the application context by name.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`unknown`

Optional locale or language hint.

#### Returns

`Promise`\<[`View`](../interfaces/View.md) \| `null`\>

A promise that resolves to the matching view, or `null` when none is available.

#### Implementation of

[`ViewResolver`](../interfaces/ViewResolver.md).[`resolveViewName`](../interfaces/ViewResolver.md#resolveviewname)

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

`ApplicationContext`

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Inherited from

`AsApplicationContextAware(Null).setApplicationContext`
