[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / ViewResolverComposite

# Class: ViewResolverComposite

Defined in: packages/blue-view/src/view-resolver.ts:193

A [\`ViewResolver\`](../interfaces/ViewResolver.md) that delegates to others.

## Extends

- [`ApplicationContextAware`](../../../blue-context/src/interfaces/ApplicationContextAware.md) & [`Null`](../../../blue-core/src/classes/Null.md)\<`this`\>

## Implements

- [`Initializable`](../../../blue-factory/src/interfaces/Initializable.md)
- [`ViewResolver`](../interfaces/ViewResolver.md)

## Constructors

### Constructor

> **new ViewResolverComposite**(`viewResolvers`): `ViewResolverComposite`

Defined in: packages/blue-view/src/view-resolver.ts:196

#### Parameters

##### viewResolvers

[`ViewResolver`](../interfaces/ViewResolver.md)[] = `[]`

#### Returns

`ViewResolverComposite`

#### Overrides

`AsApplicationContextAware(Null).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/src/aware.ts:16

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### viewResolvers

> `readonly` **viewResolvers**: [`ViewResolver`](../interfaces/ViewResolver.md)[]

Defined in: packages/blue-view/src/view-resolver.ts:194

## Methods

### init()

> **init**(...`args`): `void`

Defined in: packages/blue-view/src/view-resolver.ts:207

#### Parameters

##### args

...`any`[]

#### Returns

`void`

#### Implementation of

[`Initializable`](../../../blue-factory/src/interfaces/Initializable.md).[`init`](../../../blue-factory/src/interfaces/Initializable.md#init)

***

### resolveViewName()

> **resolveViewName**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md)\>

Defined in: packages/blue-view/src/view-resolver.ts:221

#### Parameters

##### name

`string`

##### language?

`any`

#### Returns

`Promise`\<[`View`](../interfaces/View.md)\>

#### Implementation of

[`ViewResolver`](../interfaces/ViewResolver.md).[`resolveViewName`](../interfaces/ViewResolver.md#resolveviewname)

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-view/src/view-resolver.ts:237

#### Parameters

##### applicationContext

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

#### Returns

`void`

#### Overrides

`AsApplicationContextAware(Null).setApplicationContext`
