[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [response-entity-view](../README.md) / ResponseEntityView

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

> **renderTo**(`entity`, `route`): `Promise`\<[`RenderResult`](#)\>

#### Parameters

##### entity

[`ResponseEntity`](../../response-entity/classes/ResponseEntity.md)\<`unknown`\>

##### route

[`Route`](#)

#### Returns

`Promise`\<[`RenderResult`](#)\>

#### Implementation of

`ProducerView.renderTo`
