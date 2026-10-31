[**@blue/telemetry-node v0.0.1**](../README.md)

***

[@blue/telemetry-node](../README.md) / WebSocketServerInstrumentationOptions

# Interface: WebSocketServerInstrumentationOptions

Options for [WebSocketServerInstrumentation](../classes/WebSocketServerInstrumentation.md).

## Properties

### roomAttribute?

> `optional` **roomAttribute?**: `boolean`

Record the `socket.room` attribute on room fan-out series
(`blue.socket.messages.sent` / `.bytes` for
[NodeSocketSessionRegistry.broadcastTo](#)).

**Off by default.** Room names are arbitrary application strings, so
a per-entity room (a user id, a document id, a tenant) mints one
metric series per entity — unbounded cardinality from data the
application controls. Rooms are not path-scoped either (`broadcastTo`
receives the room name alone, and members may span paths), so there is
no bounded path dimension to attribute them with: off, room fan-out is
counted on the attribute-free series, which stays bounded. The
per-`broadcast` `socket.path` series remains the per-destination
dimension. Enable only when the room vocabulary is a known, small set —
a genuine dimension rather than an entity id.
