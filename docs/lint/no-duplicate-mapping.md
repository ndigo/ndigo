---
rule: '@ndigo/no-duplicate-mapping'
severity: error
recommended: true
since: 0.0.1
---

# no-duplicate-mapping

Two mapping decorators on methods of one class resolve to the same route and
the same HTTP-method identity.

## What it reports

`duplicateMapping` — the later registration and the earlier one:

```ts
@requestMapping('/notes')
export class NoteController {
    @getMapping('/:id')
    findOne(@paramValue('id') id: string) {
        /* … */
    }

    @getMapping('/:id')
    findAgain(@paramValue('id') id: string) {
        /* … */
    }
}
```

HTTP verbs are distinct registrations, so `@getMapping('/:id')` and
`@postMapping('/:id')` coexist. Method-less decorators (`@routeMapping`,
`@requestMapping`, `@publicMapping`, `@privateMapping`, `@socketMapping`,
`@stompMapping`) all resolve to "any method" and therefore collide with each
other on the same path.

## Why

Every mapping lands in one radix tree keyed by `(normalized path, method)`. The
second registration shadows the first, so a route silently answers with the
wrong handler. The class-level prefix is part of the composed path, which is why
the rule merges it before comparing.

The scope is deliberately narrow: class-local, syntax-only, best-effort. Paths
composed dynamically, or contributed by a base class, are not seen — those
need an integration test, not a linter.

## How to fix

Remove one registration or give it a distinct path:

```ts
@getMapping('/:id')
findOne(@paramValue('id') id: string) {
    /* … */
}

@getMapping('/:id/detail')
findDetail(@paramValue('id') id: string) {
    /* … */
}
```

## Options

None.

## When to disable

Specs and fixtures legitimately register duplicates to exercise the
dispatcher; the `recommended` preset already turns the rule off for
`**/*.spec.ts`, `**/*.test.ts`, and `**/test/**`. Anywhere else a duplicate is
a bug — do not suppress it.
