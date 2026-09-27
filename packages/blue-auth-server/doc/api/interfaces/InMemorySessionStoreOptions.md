[**@blue/auth-server v0.0.1**](../README.md)

***

[@blue/auth-server](../README.md) / InMemorySessionStoreOptions

# Interface: InMemorySessionStoreOptions

Options for the in-memory session store.

## Properties

### maxSessions?

> `optional` **maxSessions?**: `number`

Hard cap on concurrently stored sessions (default 512). The
opportunistic sweep reclaims expired entries at the cap; a create
that still finds the store full after sweeping throws.
