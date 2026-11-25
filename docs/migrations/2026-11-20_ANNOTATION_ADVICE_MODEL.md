# Annotation and advice model — `@ndigo/proxy` → `@ndigo/advice`

**Date:** 2026-11-20
**Affected packages:** `@ndigo/advice` (new), `@ndigo/core`, `@ndigo/proxy` (removed), `@ndigo/cache`, `@ndigo/telemetry`, `@ndigo/telemetry-node`, `@ndigo/orm`, `@ndigo/resilience`, `@ndigo/boot`, `@ndigo/test`
**Change type:** breaking

## Why

Annotations declared policy but four decorators (`@cached`, `@traced`,
`@counted`, `@transactional`) also wrapped the method, so the framework had two
models for the same idea. Selection lived inside each interceptor, so two
features could not advise the same method without one knowing about the other.
And `@ndigo/proxy` was Proxy-only, which meant an advised entry was a different
object from the one the factory built and `this.sibling()` bypassed advice.

The full reasoning and the vocabulary live in
[Annotation, Advice & Member Transformer](../architecture/annotation-and-transformer-model.md).

**There is no alias layer and no deprecation window.** Pre-1.0 renames are hard
cuts here; `@ndigo/proxy` is deleted.

## What changed

Four changes, in the order you will meet them.

### 1. Annotations declare; rules select; interceptors run

`MethodInterceptor.matches` is gone. A rule pairs a matcher with an
interceptor:

```ts
// before — selection inside the interceptor
import { interception, type MethodDescriptor, type MethodInterceptor } from '@ndigo/proxy';

class AuditInterceptor implements MethodInterceptor {
    matches(method: MethodDescriptor) {
        return method.annotation(audited) !== undefined;
    }
    invoke(invocation, next) {
        return next();
    }
}

builder.processors(interception([new AuditInterceptor()]));
```

```ts
// after — selection on the rule, one registry, one processor
import { hasAnnotation, interception, MethodInterceptorRegistry } from '@ndigo/advice';

const rules = new MethodInterceptorRegistry().add({
    when: hasAnnotation(audited),
    use: new AuditInterceptor(),
});

builder.processors(interception(rules));
```

Annotation keys move to the declaring package's namespace. `@retry` was
`proxy:retry`, now `resilience:retry`; `@cached` was `cache:<method>`, now
`cache:cached:<method>`. `methodAnnotation` and `annotationOf` now live in
`@ndigo/core`; `@ndigo/advice` adds `hasAnnotation`, `classAnnotation`,
`matchAll`, `matchAny`, and `matchNot`.

### 2. Weaving changed shape — read this one carefully

Shadow weaving is the default for objects: each advised method becomes a
non-enumerable own property on the instance. Three consequences:

- **Identity is preserved.** The container returns the object it constructed,
  so `===`, `instanceof`, and `WeakMap` keys behave as before.
- **Self-invocation is advised.** `this.helper()` now runs the helper's advice.
  `@retry` and `@transactional` change meaning on internal calls — a nested
  transactional call **joins** the open boundary instead of opening a second
  one (both transaction managers reject an already-active transaction, so
  nesting would have thrown).
- **A `Proxy` is still used** for frozen, sealed, non-extensible, and
  function-shaped targets (service clients). Those keep the old boundaries:
  identity is not preserved and self-invocation bypasses advice.

### 3. The four wrapping decorators became declarations

`@cached`, `@traced`, `@counted`, and `@transactional` no longer do anything on
their own. Each ships an interceptor that must be registered:

| Annotation       | Interceptor                | Band                        |
| ---------------- | -------------------------- | --------------------------- |
| `@cached`        | `CachedInterceptor`        | `AdviceOrder.Application`   |
| `@traced`        | `TracedInterceptor`        | `AdviceOrder.Observability` |
| `@counted`       | `CountedInterceptor`       | `AdviceOrder.Observability` |
| `@transactional` | `TransactionalInterceptor` | `AdviceOrder.Transaction`   |

`TracedInterceptor` and `CountedInterceptor` stay synchronous, so a sync method
stays sync. `CachedInterceptor` and `TransactionalInterceptor` are async and
make the advised method return a promise.

`@traced` no longer preserves an `:original` metadata entry — nothing wraps the
declared method any more, and advice wrappers are introspectively transparent
(`fn.length`, `fn.name`, and `fn.toString()` read the declared method), so
`@parameters` name resolution keeps working through advice.

### 4. An unregistered annotation is reported

An annotated method that no rule claims runs unadvised. The container processor
now warns once per class, naming the methods and the fix, instead of staying
silent.

## Migration steps

1. **Bump the package set.** `@ndigo/proxy` is gone; add `@ndigo/advice`. If a
   package of yours imports `MethodInterceptor`/`MethodDescriptor`/
   `MethodInvocation`, it imports them from `@ndigo/advice` now;
   `methodAnnotation`/`annotationOf` come from `@ndigo/core`.
2. **Replace `interception([...interceptors])` with a registry of rules.** One
   rule per annotation-to-interceptor pairing; see §1 above.
3. **Drop each interceptor's `matches`** and move the predicate to the rule's
   `when`. A spec check that threw at weave time becomes `validate(method)`.
4. **Register rules for the converted decorators** (§3). An app that used
   `@traced` on a controller will otherwise lose its spans silently — the
   startup warning is the only signal.
5. **Re-check anything that assumed non-advised self-invocation**, especially
   `@transactional` on a method that calls another transactional method, and
   `@retry` on a method that calls itself.
6. **Re-check `@parameters` on advised handlers.** Binding reads the declared
   signature, which advice now preserves — but verify, because a wrapper that
   dropped it was the previous behaviour.

## Verification

```bash
pnpm build
pnpm lint
pnpm test
pnpm docs:links
```

Exercise in the app surface:

- a method advised by two rules from different packages, confirming the order
  matches the bands;
- a `@transactional` method that calls another one, confirming one boundary;
- a `@traced` route handler carrying `@parameters`, confirming binding resolves
  argument names;
- a frozen instance, confirming it degrades to the `Proxy` strategy.

## Rollback

Revert the dependency bump; there is no data or config migration. Nothing here
writes persistent state, so a rollback is a code revert plus `pnpm install`.

## References

- [Annotation, advice, and member transformers](../architecture/annotation-and-transformer-model.md)
- [Guide 35 — Resilience & Retries](../guides/35-method-interception-and-resilience.md)
