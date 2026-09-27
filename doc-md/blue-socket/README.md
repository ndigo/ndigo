[**BlueJS Framework v0.0.1**](../README.md)

***

[BlueJS Framework](../modules.md) / blue-socket

# blue-socket

Blue Socket — isomorphic WebSocket domain (AD-22).

Owns the socket contracts (`SocketSession`, `SocketSessionRegistry` —
moved from `blue-dispatcher`, which re-exports them for handler
signatures) and the client story: `SocketClient`/`WebSocketClient` on
the WHATWG `WebSocket` global, with signal-based status and reconnect.
*

## Since

1.0.0

## Author

Jeff Rose

## Classes

- [AsyncReader](classes/AsyncReader.md)
- [InMemoryQueueMessageStore](classes/InMemoryQueueMessageStore.md)
- [WebSocketClient](classes/WebSocketClient.md)
- [StompBroker](classes/StompBroker.md)
- [StompClient](classes/StompClient.md)
- [StompProtocolError](classes/StompProtocolError.md)

## Interfaces

- [StoredQueueMessage](interfaces/StoredQueueMessage.md)
- [QueueStoreRetention](interfaces/QueueStoreRetention.md)
- [QueueMessageStore](interfaces/QueueMessageStore.md)
- [InMemoryQueueStoreOptions](interfaces/InMemoryQueueStoreOptions.md)
- [InMemoryQueueStoreStats](interfaces/InMemoryQueueStoreStats.md)
- [SocketTransport](interfaces/SocketTransport.md)
- [ReconnectPolicy](interfaces/ReconnectPolicy.md)
- [ReconnectTrigger](interfaces/ReconnectTrigger.md)
- [WebSocketClientOptions](interfaces/WebSocketClientOptions.md)
- [SocketClient](interfaces/SocketClient.md)
- [SocketSessionRegistry](interfaces/SocketSessionRegistry.md)
- [SocketRequestSources](interfaces/SocketRequestSources.md)
- [SocketSession](interfaces/SocketSession.md)
- [StompBrokerOptions](interfaces/StompBrokerOptions.md)
- [StompMessage](interfaces/StompMessage.md)
- [StompClientOptions](interfaces/StompClientOptions.md)
- [StompSubscription](interfaces/StompSubscription.md)
- [StompFrame](interfaces/StompFrame.md)

## Type Aliases

- [SocketStatus](type-aliases/SocketStatus.md)
- [StompAckMode](type-aliases/StompAckMode.md)
- [StompBody](type-aliases/StompBody.md)
- [StompWireInput](type-aliases/StompWireInput.md)

## Functions

- [materialOctets](functions/materialOctets.md)
- [parseStompFrame](functions/parseStompFrame.md)
- [parseTextFrame](functions/parseTextFrame.md)
- [serializeStompFrame](functions/serializeStompFrame.md)
- [bodyAsText](functions/bodyAsText.md)
