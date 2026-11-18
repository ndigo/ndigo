---
rule: '@ndigo/no-mixed-decorator-paradigms'
severity: error
recommended: true
since: 0.0.1
---

# no-mixed-decorator-paradigms

A class carries both a **client-call** decorator and a **route-mapping**
decorator. The rule looks at the class and every method on it.

## What it reports

`mixedParadigms` — the class names the two decorators that collide:

```ts
@service()
@requestMapping('/orders')
export class OrderGateway {
    @getCall('/orders/:id')
    @getMapping('/orders/:id')
    async find(id: string) {
        /* … */
    }
}
```

## Why

The two families mean opposite things. `@service` and `@*Call` make the class a
**client proxy**: the dispatcher builds a caller that sends requests somewhere
else. `@routeMapping` and `@*Mapping` make it a **server handler**: the
dispatcher registers routes that this process answers.

One class cannot be both, and the failure is silent — a method decorated with
both is registered as a handler and wrapped as a call. Keeping the families
apart is the "Paradigm Selection Rules" section of
[ARCHITECTURE.md](https://github.com/ndigo/ndigo/blob/main/ARCHITECTURE.md).

## How to fix

Split the class:

```ts
@service()
export class OrderClient {
    @getCall('/orders/:id')
    async find(id: string) {
        /* … */
    }
}

@requestMapping('/orders')
export class OrderController {
    @getMapping('/orders/:id')
    async find(id: string) {
        /* … */
    }
}
```

## Options

None.

## When to disable

Do not. A class that needs both is two classes; splitting it is the fix, not a
suppression. If you are mid-migration, disable the rule in an `overrides` block
scoped to that file and link the migration issue in the reason.
