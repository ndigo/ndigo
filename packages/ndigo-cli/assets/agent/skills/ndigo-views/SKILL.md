---
name: ndigo-views
description: Shapes responses with views, targets, and content negotiation. Use when returning ModelAndView, choosing a representation, adding EJS or Web Component rendering, or debugging negotiation.
---

# Views and representations

A handler returns a result; a **view** turns it into bytes. Keep the decision in
the view or the negotiated representation, not in the handler.

## The surface

| Need                 | Contract                                                        |
| :------------------- | :-------------------------------------------------------------- |
| Custom bytes         | `View.renderTo(model, route)` → `{ status, headers, body }`     |
| Stream / SSE         | `ProducerView` with a stream or async iterable body             |
| Name or instance     | `ModelAndView(viewOrName, model)`                               |
| JSON (default)       | return a plain value or object                                  |
| Explicit status/body | `ResponseEntity` (>= 400 becomes problem+json)                  |
| Negotiation          | path extension or `Accept`, resolved by the view resolver chain |
| Server-rendered HTML | EJS views; Web Components for progressive enhancement           |

## Sequence

1. Choose the representation: JSON for data, a named view for HTML, a
   `ProducerView` for streams.
2. Return `new ModelAndView('name', model)` or a view instance.
3. If a new representation is needed, register a view resolver; do not branch
   on `Accept` inside the handler.
4. Verify the representation with an `Accept` request and its content type.

## Traps

- **Plain values are JSON.** Returning a string does not produce HTML; use a
  view or `ResponseEntity`.
- **`>= 400` responses are problem details.** Throw a framework error or return
  `ResponseEntity` instead of hand-writing an error body.
- **EJS and Web Components are resolver technologies.** The handler names a
  view; the platform chooses the technology and target.

## Verify

The response content type matches the negotiated representation, and the
serialized body matches the view contract.
