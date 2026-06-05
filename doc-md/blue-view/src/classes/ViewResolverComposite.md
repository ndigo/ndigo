[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / ViewResolverComposite

# Class: ViewResolverComposite

Defined in: packages/blue-view/src/view-resolver.ts:258

A [\`ViewResolver\`](../interfaces/ViewResolver.md) that delegates to others.

## Implements

module:core.Initializable

## Implements

module:core.ViewResolver

## See

module:context.AsApplicationContextAware

## Extends

- `ApplicationContextAware` & `Null`\<`this`\>

## Implements

- `Initializable`
- [`ViewResolver`](../interfaces/ViewResolver.md)

## Constructors

### Constructor

> **new ViewResolverComposite**(`viewResolvers?`): `ViewResolverComposite`

Defined in: packages/blue-view/src/view-resolver.ts:269

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

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### viewResolvers

> `readonly` **viewResolvers**: [`ViewResolver`](../interfaces/ViewResolver.md)[]

Defined in: packages/blue-view/src/view-resolver.ts:262

The ordered resolver chain consulted during lookup.

## Methods

### init()

> **init**(...`args`): `void`

Defined in: packages/blue-view/src/view-resolver.ts:285

Initializes any delegates that expose the Initializable contract.

#### Parameters

##### args

...`any`[]

Initialization arguments forwarded to delegates.

#### Returns

`void`

#### Implementation of

`Initializable.init`

***

### resolveViewName()

> **resolveViewName**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md)\>

Defined in: packages/blue-view/src/view-resolver.ts:305

Resolves the requested view by querying delegates in order.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`any`

Optional locale or language hint.

#### Returns

`Promise`\<[`View`](../interfaces/View.md)\>

A promise that resolves to the first matching view, or `null` when none resolve.

#### Implementation of

[`ViewResolver`](../interfaces/ViewResolver.md).[`resolveViewName`](../interfaces/ViewResolver.md#resolveviewname)

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-view/src/view-resolver.ts:325

Propagates the application context to context-aware delegates.

#### Parameters

##### applicationContext

`ApplicationContext`

The application context to share.

#### Returns

`void`

#### Overrides

`AsApplicationContextAware(Null).setApplicationContext`
