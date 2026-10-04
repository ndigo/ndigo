[**@blue/cache v0.0.1**](../README.md)

***

[@blue/cache](../README.md) / CACHE\_MANAGER

# Variable: CACHE\_MANAGER

> `const` **CACHE\_MANAGER**: `ContextToken`\<[`CacheManager`](../interfaces/CacheManager.md)\>

Token for the shared [CacheManager](../interfaces/CacheManager.md) bean. The Node platform
auto-configuration registers the entry; consumers resolve it without a
string: `context.getValue(CACHE_MANAGER)`.
