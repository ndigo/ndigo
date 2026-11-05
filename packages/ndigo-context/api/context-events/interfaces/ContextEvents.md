[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [context-events](../README.md) / ContextEvents

# Interface: ContextEvents

Application-context lifecycle events and their payloads.

## Properties

### context:close

> **context:close**: \[`context`: [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)\]

Emitted when the context starts closing.

***

### context:destroy

> **context:destroy**: \[`context`: [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)\]

Emitted when the context is fully destroyed.

***

### context:preparing

> **context:preparing**: \[`context`: [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)\]

Emitted at the start of `refresh()` before processors run.

***

### context:refresh

> **context:refresh**: \[`context`: [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)\]

Emitted when the context is fully active.
