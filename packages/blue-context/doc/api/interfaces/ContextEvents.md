[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / ContextEvents

# Interface: ContextEvents

Application-context lifecycle events and their payloads.

## Properties

### context:close

> **context:close**: \[[`ApplicationContext`](ApplicationContext.md)\]

Emitted when the context starts closing.

***

### context:destroy

> **context:destroy**: \[[`ApplicationContext`](ApplicationContext.md)\]

Emitted when the context is fully destroyed.

***

### context:preparing

> **context:preparing**: \[[`ApplicationContext`](ApplicationContext.md)\]

Emitted at the start of `refresh()` before processors run.

***

### context:refresh

> **context:refresh**: \[[`ApplicationContext`](ApplicationContext.md)\]

Emitted when the context is fully active.
