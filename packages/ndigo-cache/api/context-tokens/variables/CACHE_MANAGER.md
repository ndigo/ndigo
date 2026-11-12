[**@ndigo/cache v0.0.1**](../../README.md)

***

[@ndigo/cache](../../README.md) / [context-tokens](../README.md) / CACHE\_MANAGER

# Variable: CACHE\_MANAGER

> `const` **CACHE\_MANAGER**: [`ContextToken`](#)\<[`CacheManager`](../../cache-manager/interfaces/CacheManager.md)\>

Token for the shared [CacheManager](../../cache-manager/interfaces/CacheManager.md) entry. The Node platform
auto-configuration registers the entry; consumers resolve it without a
string: `context.getValue(CACHE_MANAGER)`.
