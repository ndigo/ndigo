[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [view-resolver](../README.md) / ViewResolverComposite

# Class: ViewResolverComposite

A [\`ViewResolver\`](../interfaces/ViewResolver.md) that delegates to others.

## Extends

- `ApplicationContextAware` & `Null`\<`this`\>

## Implements

- [`Initializable`](#)
- [`ViewResolver`](../interfaces/ViewResolver.md)

## Constructors

### Constructor

> **new ViewResolverComposite**(`viewResolvers?`): `ViewResolverComposite`

Creates a composite resolver with the given delegate list.

#### Parameters

##### viewResolvers?

[`ViewResolver`](../interfaces/ViewResolver.md)[] = `[]`

The resolvers to query in order.

#### Returns

`ViewResolverComposite`

#### Overrides

`AsApplicationContextAware(Null).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### viewResolvers

> `readonly` **viewResolvers**: [`ViewResolver`](../interfaces/ViewResolver.md)[]

The ordered resolver chain consulted during lookup.

## Methods

### init()

> **init**(...`args`): `void`

Initializes any delegates that expose the [Initializable](#) contract.

#### Parameters

##### args

...`unknown`[]

Initialization arguments forwarded to delegates.

#### Returns

`void`

#### Implementation of

`Initializable.init`

***

### resolveViewName()

> **resolveViewName**(`name`, `language?`, `request?`): `Promise`\<[`View`](../../view/interfaces/View.md) \| `null`\>

Resolves the requested view by querying delegates in order.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`unknown`

Optional locale or language hint.

##### request?

`unknown`

Optional per-call request forwarded to delegates that
  negotiate by request data.

#### Returns

`Promise`\<[`View`](../../view/interfaces/View.md) \| `null`\>

A promise that resolves to the first matching view, or `null` when none resolve.

#### Implementation of

[`ViewResolver`](../interfaces/ViewResolver.md).[`resolveViewName`](../interfaces/ViewResolver.md#resolveviewname)

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Propagates the application context to context-aware delegates.

#### Parameters

##### applicationContext

`ApplicationContext`

The application context to share.

#### Returns

`void`

#### Overrides

`AsApplicationContextAware(Null).setApplicationContext`
