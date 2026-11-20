# @ndigo/advice

> Runs the advice declared by annotations: compile rules into per-method chains, then weave them onto instances the framework manages or onto objects you build yourself.

A decoration that only writes metadata cannot change how a method runs. `@ndigo/advice`
supplies the missing half: a rule pairs a matcher with an interceptor, the plan
compiler selects the methods each rule applies to, and the weaver installs the
resulting chain around those methods. Selection and validation happen once at plan
time, so a bad declaration fails at startup instead of on the first call.

Weaving prefers _shadow weaving_ — a non-enumerable own property per advised method —
because it leaves the object's identity intact and lets a method's call to a sibling
method run that sibling's advice too. Frozen, sealed, and function-shaped targets
cannot accept own properties, so those fall back to a `Proxy`; the fallback is
documented per capability, because it gives up both of those properties.

## Installation

```bash
pnpm add @ndigo/advice
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

An annotation describes a method; a rule says what runs around it.

```ts
import { methodAnnotation } from '@ndigo/core';
import { hasAnnotation, interceptMethods, type MethodInterceptor } from '@ndigo/advice';

const audited = methodAnnotation<{ action: string }>('orders:audited');

const audit: MethodInterceptor = {
    invoke(invocation, next) {
        console.log(invocation.annotation(audited)?.action);
        return next();
    },
};

class OrderService {
    @audited({ action: 'order.place' })
    place(order: string): string {
        return `ok:${order}`;
    }
}

const service = interceptMethods(new OrderService(), [{ when: hasAnnotation(audited), use: audit }]);
service.place('widget'); // logs "order.place", returns "ok:widget"
```

## Usage

### Rules

A rule binds advice to the methods it applies to. Omit `when` to advise every
method on the woven surface.

```ts
const rule: MethodInterceptorRule = {
    when: hasAnnotation(audited),
    use: audit,
};
```

`hasAnnotation` matches a method that carries the annotation — or whose class
does, so a blanket `@audited` on a class covers every method of it. Pass a
second argument to narrow by value:

```ts
when: hasAnnotation(audited, (spec) => spec.action.startsWith('order.'));
```

`matchAll`, `matchAny`, and `matchNot` from `@ndigo/core` compose matchers, and
`when` is any `Matchable<MethodDescriptor>` — a plain object with a `matches`
method works too.

### Ordering

Lower numbers run closer to the caller. `AdviceOrder` names the bands so
independently authored rules interleave predictably instead of guessing numbers:

| Band            | Value | Concern                                                                            |
| --------------- | ----- | ---------------------------------------------------------------------------------- |
| `Observability` | 100   | Traces, metrics, logging — must observe retries, not be re-run by them             |
| `Resilience`    | 200   | Retry and circuit breaking                                                         |
| `Transaction`   | 300   | Transaction boundaries — inside resilience, so each retry gets a fresh transaction |
| `Application`   | 400   | Feature-specific policy                                                            |
| `Innermost`     | 500   | Closest to the method                                                              |

The rule's own `order` wins; when it names none, the interceptor's band
applies; when neither does, the rule lands in `AdviceOrder.Application`. Equal
orders keep registration order, so a later registration nests inside an earlier
one.

The shipped capabilities name their own band rather than relying on the default:
the telemetry advisories sit in `Observability`, resilience in `Resilience`, the
transaction boundary in `Transaction`, and caching in `Application`. That makes
the safe arrangement the one an application gets without naming numbers — retry
outside a transaction, tracing outside retry — while a rule that needs a
different composition still overrides it.

### The container path

Register one processor for the whole application; features contribute rules to
its registry rather than registering processors of their own.

```ts
import { interception, MethodInterceptorRegistry } from '@ndigo/advice';

const rules = new MethodInterceptorRegistry().add({ when: hasAnnotation(audited), use: audit });

const builder = new ApplicationBuilder([NodeAppConfiguration]).processors(interception(rules));
```

A feature that registers after the processor was installed still applies to
entries created later, because rules are read at weave time.

### Standalone use

The by-hand path runs the same compiler, so hand-built objects and service clients
behave exactly like container entries.

```ts
const service = interceptMethods(new OrderService(), rules);
const other = createIntercepted(OrderService, rules);
```

### Compiling a plan yourself

`compileInterceptorPlan(targetType, entryName, methodNames, rules)` is the
primitive both paths use: it returns one `MethodInterceptorPlan` per matched
method, with the ordered advice chain already resolved. `planFor(instance, rules)`
is the same thing for an object, reading the class and its method surface for
you.

### Validation

`validate` is called once per matched method while the plan is compiled. Use it to
reject an annotation whose value cannot be honoured, so the failure names the method
at startup rather than on the first call.

```ts
const retry = methodAnnotation<{ attempts: number }>('retry:attempts');

const validatingInterceptor: MethodInterceptor = {
    validate(method) {
        const spec = method.annotation(retry);
        if (spec !== undefined && spec.attempts < 1) {
            throw new TypeError(`@retry attempts must be positive on '${String(method.methodName)}'`);
        }
    },
    invoke: (_invocation, next) => next(),
};
```

### Annotations nothing claims

An annotation is inert by design, so a missing registration would otherwise be
silent. When the container processor meets a class whose methods carry
annotations that no registered rule matched, it reports them once per class,
naming the methods:

```text
entry 'orders' declares annotations on 'place', 'cancel' but no registered rule
advises them — those methods run unadvised. Register a rule for the annotation,
or remove it.
```

The warning is per class, never per call. On the standalone path there is no
processor to notice, so `planFor(instance, rules)` is the equivalent check: it
returns the plans that _would_ be compiled.

## Weaving strategies

| Strategy | Chosen when                                          | Identity preserved | Self-invocation advised |
| -------- | ---------------------------------------------------- | ------------------ | ----------------------- |
| Shadow   | The instance accepts own properties                  | Yes                | Yes                     |
| Proxy    | Frozen, sealed, non-extensible, or a function target | No                 | No                      |
| None     | No rule matched a method                             | Yes                | —                       |

A wrapped method is introspectively identical to the one it replaced: `length`,
`name`, and `toString()` all read the declared method, so framework code that
resolves argument names from the function source (`@parameters` in
`@ndigo/dispatcher`) keeps working through advice. It is still a different
function object — that is what wrapping means.

`planFor(instance, rules)` reports which methods would be advised without weaving
anything — useful for a startup diagnostic.

## API

The full API is at `api/` (generated; run `pnpm doc:api`). Primary exports live
in [`src/index.ts`](src/index.ts).

## Development

```bash
pnpm --filter @ndigo/advice build:lib
pnpm --filter @ndigo/advice test
```

## See Also

- [@ndigo/core](../ndigo-core/README.md) — the annotation primitives (`methodAnnotation`, `classAnnotation`, `annotationOf`)
- [@ndigo/resilience](../ndigo-resilience/README.md) — retry and circuit breaking built on this runtime
- [@ndigo/factory](../ndigo-factory/README.md) — the processor contract the container path plugs into

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
