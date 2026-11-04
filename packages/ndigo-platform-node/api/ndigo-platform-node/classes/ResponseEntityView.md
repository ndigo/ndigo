[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / ResponseEntityView

# Class: ResponseEntityView

A view that produces a `ResponseEntity` (status, headers, body) as a
complete response document.

## Implements

- [`ProducerView`](#)

## Constructors

### Constructor

> **new ResponseEntityView**(): `ResponseEntityView`

#### Returns

`ResponseEntityView`

## Methods

### renderTo()

> **renderTo**(`entity`, `route`): `Promise`\<`RenderResult`\>

#### Parameters

##### entity

[`ResponseEntity`](ResponseEntity.md)\<`unknown`\>

##### route

[`Route`](#)

#### Returns

`Promise`\<`RenderResult`\>

#### Inherit Doc

#### Implementation of

`ProducerView.renderTo`
