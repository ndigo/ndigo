[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / ENTITY\_CLONE

# Variable: ENTITY\_CLONE

> `const` **ENTITY\_CLONE**: unique `symbol`

Well-known symbol an entity class implements to control how it is cloned for
[InMemoryDataSource.snapshot](../classes/InMemoryDataSource.md#snapshot) / `restore` (DAT-F7).

`snapshot()` clones own enumerable properties, so ECMAScript private fields
(`#field`) are not carried over — a restored instance lacks its private
brand and any access throws. An entity that owns private state implements
this hook to copy it explicitly:

```typescript
class ApiKey {
    #secret = '';
    [ENTITY_CLONE](): ApiKey {
        const copy = new ApiKey();
        copy.#secret = this.#secret;
        return copy;
    }
}
```

The hook owns its clone completely: it returns a fresh instance (or a plain
object) and is responsible for copying whatever state it holds.
