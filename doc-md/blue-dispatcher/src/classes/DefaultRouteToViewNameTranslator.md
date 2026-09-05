[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / DefaultRouteToViewNameTranslator

# Class: DefaultRouteToViewNameTranslator

Defined in: [packages/blue-dispatcher/src/route-to-view-name-translator.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-to-view-name-translator.ts#lines-22)

Translates a route into a view name.

## Implements

- [`RouteToViewNameTranslator`](../interfaces/RouteToViewNameTranslator.md)

## Constructors

### Constructor

> **new DefaultRouteToViewNameTranslator**(): `DefaultRouteToViewNameTranslator`

Defined in: [packages/blue-dispatcher/src/route-to-view-name-translator.ts:41](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-to-view-name-translator.ts#lines-41)

Create a translator with empty prefix and suffix.

#### Returns

`DefaultRouteToViewNameTranslator`

## Properties

### prefix

> **prefix**: `string`

Defined in: [packages/blue-dispatcher/src/route-to-view-name-translator.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-to-view-name-translator.ts#lines-26)

Prefix added to every translated view name.

***

### separator

> **separator**: `string`

Defined in: [packages/blue-dispatcher/src/route-to-view-name-translator.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-to-view-name-translator.ts#lines-31)

Separator used when rewriting the route path.

***

### suffix

> **suffix**: `string`

Defined in: [packages/blue-dispatcher/src/route-to-view-name-translator.ts:36](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-to-view-name-translator.ts#lines-36)

Suffix added to every translated view name.

## Methods

### getViewName()

> **getViewName**(`route`): `string`

Defined in: [packages/blue-dispatcher/src/route-to-view-name-translator.ts:53](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-to-view-name-translator.ts#lines-53)

Translate a route path into a view name.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`string`

The translated view name.

#### Implementation of

[`RouteToViewNameTranslator`](../interfaces/RouteToViewNameTranslator.md).[`getViewName`](../interfaces/RouteToViewNameTranslator.md#getviewname)
