**@blue/socket v0.0.1**

***

# @blue/socket v0.0.1

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
- [StompBroker](classes/StompBroker.md)
- [StompClient](classes/StompClient.md)
- [StompProtocolError](classes/StompProtocolError.md)
- [WebSocketClient](classes/WebSocketClient.md)

## Interfaces

- [InMemoryQueueStoreOptions](interfaces/InMemoryQueueStoreOptions.md)
- [InMemoryQueueStoreStats](interfaces/InMemoryQueueStoreStats.md)
- [QueueMessageStore](interfaces/QueueMessageStore.md)
- [QueueStoreRetention](interfaces/QueueStoreRetention.md)
- [ReconnectPolicy](interfaces/ReconnectPolicy.md)
- [ReconnectTrigger](interfaces/ReconnectTrigger.md)
- [SocketClient](interfaces/SocketClient.md)
- [SocketRequestSources](interfaces/SocketRequestSources.md)
- [SocketSession](interfaces/SocketSession.md)
- [SocketSessionRegistry](interfaces/SocketSessionRegistry.md)
- [SocketTransport](interfaces/SocketTransport.md)
- [StompBrokerOptions](interfaces/StompBrokerOptions.md)
- [StompClientOptions](interfaces/StompClientOptions.md)
- [StompFrame](interfaces/StompFrame.md)
- [StompMessage](interfaces/StompMessage.md)
- [StompSubscription](interfaces/StompSubscription.md)
- [StoredQueueMessage](interfaces/StoredQueueMessage.md)
- [WebSocketClientOptions](interfaces/WebSocketClientOptions.md)

## Type Aliases

- [SocketStatus](type-aliases/SocketStatus.md)
- [StompAckMode](type-aliases/StompAckMode.md)
- [StompBody](type-aliases/StompBody.md)
- [StompWireInput](type-aliases/StompWireInput.md)

## Functions

- [bodyAsText](functions/bodyAsText.md)
- [materialOctets](functions/materialOctets.md)
- [parseStompFrame](functions/parseStompFrame.md)
- [parseTextFrame](functions/parseTextFrame.md)
- [serializeStompFrame](functions/serializeStompFrame.md)
