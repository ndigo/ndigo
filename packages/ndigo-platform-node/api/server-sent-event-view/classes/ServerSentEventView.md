[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [server-sent-event-view](../README.md) / ServerSentEventView

# Class: ServerSentEventView

A producing view that streams an async-iterable event source as
`text/event-stream`, one SSE frame per yielded value.

## Implements

- [`ProducerView`](#)

## Constructors

### Constructor

> **new ServerSentEventView**(`source`): `ServerSentEventView`

Creates a view for the given event source.

#### Parameters

##### source

`AsyncIterable`\<`unknown`\>

The async iterable of events to push.

#### Returns

`ServerSentEventView`

## Properties

### clientDisconnected

> **clientDisconnected**: `boolean` = `false`

Set when the stream ends because the client disconnected (the write
failed or the response was destroyed mid-stream). Observable for
telemetry.

***

### destroyed

> **destroyed**: `boolean` = `false`

Indicates if the view has been destroyed.

***

### frameCount

> **frameCount**: `number` = `0`

Number of frames written to the response. Observable (public) so
telemetry instrumentations can report streaming totals without hooks
in the hot write path.

***

### mediaType

> **mediaType**: `MediaType` = `MediaTypes.TEXT_EVENT_STREAM`

The media type of the streamed response.

## Methods

### destroy()

> **destroy**(): `void`

Destroys the view; renders after destruction produce an empty stream.

#### Returns

`void`

***

### renderTo()

> **renderTo**(`_model`, `route`): `Promise`\<[`RenderResult`](#)\>

#### Parameters

##### \_model

`unknown`

##### route

[`Route`](#)

#### Returns

`Promise`\<[`RenderResult`](#)\>

#### Implementation of

`ProducerView.renderTo`
