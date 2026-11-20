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
    order: AdviceOrder.Application,
};
```

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

Equal orders keep registration order. `matchAll`, `matchAny`, and `matchNot` from
`@ndigo/core` compose matchers.

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

### Validation

`validate` is called once per matched method while the plan is compiled. Use it to
reject an annotation whose value cannot be honoured, so the failure names the method
at startup.

```ts
const retry: MethodInterceptor = {
    validate(method) {
        const spec = method.annotation(retrySpec);
        if (spec && spec.attempts < 1) {
            throw new TypeError(`@retry attempts must be positive on '${String(method.methodName)}'`);
        }
    },
    invoke: (_invocation, next) => next(),
};
```

## Weaving strategies

| Strategy | Chosen when                                          | Identity preserved | Self-invocation advised |
| -------- | ---------------------------------------------------- | ------------------ | ----------------------- |
| Shadow   | The instance accepts own properties                  | Yes                | Yes                     |
| Proxy    | Frozen, sealed, non-extensible, or a function target | No                 | No                      |
| None     | No rule matched a method                             | Yes                | —                       |

`planFor(instance, rules)` reports which methods would be advised without weaving
anything — useful for a startup diagnostic.

## API

The full API is at [`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for how it
fits with the rest of Ndigo.

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
