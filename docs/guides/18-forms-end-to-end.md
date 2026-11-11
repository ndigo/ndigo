# Guide 18 — Forms End-to-End

Forms are the highest-traffic integration point in most apps: a browser sends
name/value pairs, the server binds and validates them, and a failure must
re-render the form without losing input. Ndigo gives you the pieces — whole-body
binding, Zod schemas, a view model, response entities — and the reference apps
show the two canonical flows.

This guide stitches them together: server-rendered forms (PetClinic) and
browser/API forms (Conduit), plus the upload and CSRF edges.

**Audience:** Node and browser application developers · **Prerequisites:** Guides 06, 07, and 09 · **Reference app:** `apps/12-ndigo-petclinic`, `apps/10-ndigo-conduit-web`

## What you'll learn

- Bind a whole HTML form body in one parameter.
- Re-render a form with values and per-field messages on validation failure.
- Use post/redirect/get so a reload never re-posts.
- Map an API error envelope onto browser form fields.
- Wire CSRF, uploads, and FACE controls without a second binding path.

## 1. The server flow

A server-rendered form has four steps: show, bind, validate, re-render or
redirect.

```ts
@postMapping('/owners/new')
@parameters({ form: dataBinderValue('body') })
create(form: Record<string, unknown> | null) {
    const values = ownerFormValues(form ?? {});
    const parsed = ownerFormSchema.safeParse(values);
    if (!parsed.success) {
        return new ModelAndView('owners/form', {
            action: '/owners/new',
            values,
            errors: collectFieldMessages(parsed.error),
        });
    }
    const owner = this.#clinic.createOwner(parsed.data);
    return redirectTo(`/owners/${owner.id}`);
}
```

- **Bind the whole body** with `dataBinderValue('body')`; HTML forms send
 `application/x-www-form-urlencoded`, and the binder nests dotted keys.
- **Read text first.** `ownerFormValues(form)` turns missing fields into empty
 strings so the schema's “required” message fires instead of Zod's “expected
 string, received undefined”.
- **Validate explicitly** with `safeParse` rather than `validatedBy`: a schema
 failure inside the binding pipeline becomes a 422 problem document, which is
 the right API answer and the wrong browser answer.
- **Re-render the same view** with the submitted values and a field → message
 map; the template resolves each message key through the request locale.
- **Redirect on success** (PRG) with a `ResponseEntity` 302 and `Location`.

## 2. The form view model

Keep the view model small and stable:

| Key | Meaning |
| -------------------------- | ------------------------------------------------- |
| `action` | Where the form posts |
| `values` | The submitted (or persisted) values to round-trip |
| `errors` | Field name → message key (first message wins) |
| `headingKey` / `submitKey` | i18n keys for the title and button |

`collectFieldMessages(zodError)` maps each issue's first path segment to its
message key. The template renders `t(errors.field.key)` under the input; a
blank `errors` object means a fresh form. The same model serves create and edit
— only `action` and the initial `values` differ.

## 3. Validation semantics

- **Use the schema as the single source.** The same `ownerFormSchema` validates
 the form, documents the fields, and can derive DTOs (guide 13).
- **Messages are keys, not prose.** Store `error.owner.firstName.required` in
 the schema and resolve it in the template; the API and the form then share
 one vocabulary.
- **Validate cross-field/domain rules after parse.** An unknown pet type is a
 store lookup, not a schema shape; add `error.pet.type.unknown` to the model
 when the lookup misses.
- **Empty-but-present is not missing.** A form always sends its fields; treat
 empty strings as values and let the schema decide requiredness.
- **Do not throw for user input.** A validation failure is a re-render, not a
 500; only infrastructure failures use the error chain (guide 08).

## 4. The browser flow

A browser app posts JSON (or FACE `FormData`) to the API and maps the error
envelope back onto fields:

```ts
try {
    await api.updateArticle(slug, input);
    router.navigate(`/article/${slug}`);
} catch (error) {
    if (error instanceof ConduitApiError) {
        renderFieldErrors(error.errors); // field → messages
        return;
    }
    throw error;
}
```

- **Keep the input state** until the request succeeds; on failure, re-render
 the form with the same values and the envelope's messages.
- **Map the envelope at the service boundary**, not in every view: the Conduit
 client turns `{ errors: { field: [...] } }` into a typed error with an
 `errors` record (guide 16).
- **Optimistic updates need rollback.** Update the UI, keep the previous value,
 and restore it when the request fails (the Conduit favorite/follow pattern).
- **Disable double submits** while the request is in flight; a second POST is
 not idempotent just because the first one is pending.

## 5. CSRF, uploads, and FACE

- **CSRF** — cookie-authenticated form posts need the double-submit token
 (guide 28). The `X-CSRF-Token` header or `csrf_token` field must match the
 `__Host-ndigo-csrf` cookie; safe GETs mint it.
- **Uploads** — `multipart/form-data` binds through `fileValue` (guide 14);
 text fields and files can share one form. Enforce the size limit before
 reading the whole file.
- **FACE controls** — a form-associated custom element participates in the
 normal `<form>` submission; the server sees ordinary name/value pairs. Do not
 add a second binding path for the component (guide 30).
- **JSON-only mutations** — a cross-site HTML form cannot send
 `application/json`; a 415 gate is a valid CSRF defense for login, but not a
 substitute for the interceptor on form posts.

## 6. Pitfalls

- **`validatedBy` on a form body returns 422, not a re-render.** Parse
 explicitly when the response is HTML.
- **A failed validation must keep the input.** A blank form after an error is a
 UX bug and a support ticket.
- **PRG is not optional.** Returning the detail page directly means a reload
 re-posts.
- **Do not trust `Content-Type` alone.** Bind the expected source and validate;
 the parser and schema are the contract.
- **One message per field is enough for the first error.** `collectFieldMessages`
 keeps the first; render a summary separately if you need all issues.
- **The browser is not the validator.** Server-side `safeParse` is the
 boundary; client checks are convenience.

## See also

- [Guide 06 — Argument Binding](06-argument-binding.md) — `dataBinderValue` and sources
- [Guide 07 — Request Validation](07-request-validation.md) — schemas and 422
- [Guide 09 — Views, Targets & Content Negotiation](09-views-and-content-negotiation.md) — the form view model
- [Guide 14 — Multipart & File Upload](14-multipart-and-file-upload.md) — file fields
- [Guide 44 — Accessibility](44-accessibility.md) — labels, errors, and focus
- [Guide 28 — Security Hardening](28-security-hardening.md) — CSRF
- [apps/12-ndigo-petclinic](../../apps/12-ndigo-petclinic/README.md) — the server form reference
- [apps/10-ndigo-conduit-web](../../apps/10-ndigo-conduit-web/README.md) — the browser form reference
