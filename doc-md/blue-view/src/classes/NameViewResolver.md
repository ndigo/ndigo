[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / NameViewResolver

# Class: NameViewResolver

Defined in: packages/blue-view/src/view-resolver.ts:221

A simple implementation of [\`ViewResolver\`](../interfaces/ViewResolver.md) that interprets a view name as a value in the current application context.

This resolver can be handy for small applications, keeping all definitions ranging from controllers to views in the same place.

## Implements

module:view.ViewResolver

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

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### applicationContext

> `readonly` **applicationContext**: `ApplicationContext`

Defined in: packages/blue-view/src/view-resolver.ts:225

The application context used as the view registry.

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-context/lib/context.d.ts:145

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

***

### resolveViewName()

> **resolveViewName**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md) \| `null`\>

Defined in: packages/blue-view/src/view-resolver.ts:234

Resolves a view from the application context by name.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`any`

Optional locale or language hint.

#### Returns

`Promise`\<[`View`](../interfaces/View.md) \| `null`\>

A promise that resolves to the matching view, or `null` when none is available.

#### Implementation of

[`ViewResolver`](../interfaces/ViewResolver.md).[`resolveViewName`](../interfaces/ViewResolver.md#resolveviewname)
