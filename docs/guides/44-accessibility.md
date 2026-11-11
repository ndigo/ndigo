# Guide 44 — Accessibility

Accessibility is a property of the rendered page, not a library feature. Ndigo
supplies the primitives — semantic HTML, form-associated custom elements,
declarative-shadow first paint, and an ndigo-ui conformance suite — but every
app still has to keep its landmarks, focus, labels, and keyboard paths intact.

This guide is the working checklist: what the framework guarantees, what the
component libraries must prove, and how to test it.

**Audience:** Browser application developers · **Prerequisites:** Guides [02](02-building-a-browser-app.md) and [30](30-component-integration.md) · **Reference app:** [apps/07-ndigo-island](https://github.com/ndigo/ndigo/tree/main/apps/07-ndigo-island), [apps/12-ndigo-petclinic](https://github.com/ndigo/ndigo/tree/main/apps/12-ndigo-petclinic)

## What you'll learn

- Start from semantic HTML and a landmark/skip-link baseline.
- Manage focus for dialogs, menus, and route changes.
- Wire labels, help text, errors, and FACE controls correctly.
- Respect reduced motion, RTL, and logical properties.
- Keep accessibility through SSR, hydration, and islands.
- Test with axe plus explicit keyboard assertions.

## 1. Start with semantics

No amount of ARIA repairs a page without structure. Use native elements first:

```html
<a class="nd-skip-link" href="#nd-main">Skip to content</a>
<header>…</header>
<nav aria-label="Primary">…</nav>
<main id="nd-main" tabindex="-1">…</main>
<footer>…</footer>
```

- **One `<main>`** per page, with an `id` the skip link targets.
- **Landmarks** (`header`, `nav`, `main`, `footer`) with an `aria-label` when
  more than one of the same kind exists.
- **One `<h1>`**, then a logical heading order; do not choose heading levels by
  size.
- **Buttons for actions, links for navigation.** A clickable `<div>` is a bug
  even if it works with a mouse.
- **The skip link** is the first focusable element and moves focus to `<main>`
  (`tabindex="-1"` makes the target focusable without adding it to the tab
  order).

ndigo-ui's `app-shell` encodes this baseline and its test asserts the landmark,
skip-link, and heading contract. Use it as the starting point, not a substitute
for reviewing the actual page.

## 2. Keyboard and focus

Every interactive surface must be reachable and operable without a pointer:

- **Visible focus** — style `:focus-visible`, never remove the outline without
  a replacement. ndigo-ui's base layer provides a tokenized focus ring.
- **No positive `tabindex`.** Let DOM order define the sequence.
- **Focus moves with context** — opening a dialog moves focus inside; closing
  it returns focus to the trigger; a route change moves focus to the new
  heading or main region.
- **Escape closes** transient surfaces; arrows navigate composite widgets.
- **No keyboard traps** except a modal dialog's intentional focus loop, which
  must still close with Escape.

The ndigo-ui dialog is the reference: the trigger gets
`aria-haspopup="dialog"`/`aria-expanded`, the content gets `role="dialog"`,
opening moves focus inside, Escape closes and restores focus to the trigger.
The menu uses roving highlight plus `aria-activedescendant` and typeahead; its
test asserts ArrowDown highlights the first item and the active descendant id.

```ts
// The contract the tests assert, not a replacement for the component.
trigger.focus();
trigger.click();
// focus is inside the dialog
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
// focus is back on the trigger
```

## 3. Forms, labels, and FACE

A form control needs a programmatic name, a state, and a description:

```html
<div class="nd-field">
    <label class="nd-label" for="email">Email</label>
    <input class="nd-input" id="email" name="email" type="email" aria-invalid="true" aria-describedby="email-error" />
    <p class="nd-error" id="email-error">Enter a valid email address.</p>
</div>
```

- **`label[for]` or a wrapping `<label>`** — placeholder text is not a label.
- **Help and error text** are referenced with `aria-describedby`; the error is
  not just red styling.
- **`aria-invalid="true"`** on the invalid control; keep the message in the
  DOM, not only in a toast.
- **Group related choices** in `<fieldset>` with a `<legend>`; use
  `aria-describedby` on the group when needed.
- **Do not disable submit to hide validation errors.** Keep the control
  focusable; report the error and move focus to the summary or first invalid
  field after submit.

FACE custom elements submit standard form data through
`AsFormAssociated`, so the server path is unchanged. The mixin also handles
`form.reset`, `<fieldset disabled>`, and browser autofill; expose `name` and
`value`, then let the platform do the rest.

```ts
import { AbstractWebComponent } from '@ndigo/view-webcomponent';
import { AsFormAssociated } from '@ndigo/view-webcomponent';

class RatingInput extends AsFormAssociated(AbstractWebComponent) {
    set model(model: { score: number }) {
        this.value = String(model.score);
    }

    render(): void {
        // render the rating UI; the host submits name/value
    }
}
```

Do not wrap a native input in a custom element just to style it. Use the native
control when it already has the semantics; use FACE when the control is a real
composite (rating, combobox, tag input).

## 4. Motion, color, and direction

- **Reduced motion** — gate transforms, parallax, and long transitions behind
  `@media (prefers-reduced-motion: reduce)`. A reduced-motion user still needs
  the state change, just without the movement.
- **Color is not the only signal** — errors, required fields, and selected
  states need text/icon/ARIA, not just color.
- **Contrast** — the ndigo-ui token suite enforces AA (4.5:1) for every
  semantic foreground/background pair in both themes; component-specific colors
  still need a browser check.
- **RTL/logical properties** — use `margin-inline`, `padding-inline`,
  `inset-inline`, and `text-align: start`; avoid hard-coded `left`/`right`.
  Test at least one component per library in `dir="rtl"`.
- **Zoom/reflow** — test at 200% zoom and a narrow viewport; content must not
  require horizontal scrolling.

## 5. SSR, hydration, and islands

Server rendering changes when focus and ARIA are applied:

- **First paint fallback** — the DSD fallback must carry the same semantics as
  the hydrated component (heading, label, role). A skeleton with unlabeled
  boxes is not an accessible fallback.
- **Hydration must not steal focus.** Hydrating a root replaces event wiring,
  not the focused element; if a component re-renders on connect, preserve the
  active element and selection.
- **Route changes** — after navigation, move focus to the new `<h1>`/`<main>`
  and announce the page title; do not leave focus on the old link.
- **Live regions** — SSE/signal updates that matter to the user should announce
  through an `aria-live` region; do not announce every tick.
- **Islands** — each island is a component boundary; its fallback and hydrated
  state must expose the same accessible name and role.

## 6. Vetting a component library

The checklist's accessibility gate is not optional:

- Keyboard-operable on the components you actually use (not just claims).
- Axe-clean on a representative fixture.
- Focus visible and managed for overlays/menus.
- Labels/roles for composites; form controls participate in native forms.
- Reduced-motion and logical-property support.
- No shadow-piercing hacks required for theming or focus styles.

ndigo-ui ships a conformance suite for its registry items (axe, keyboard, focus,
reduced motion, landmark/skip-link contract). For a third-party library, require
the same evidence in the selecting ADR and add the axe/keyboard fixtures to your
own tests. A component that fails a gate is not made accessible by a wrapper.

## 7. Testing

Two layers, both required:

1. **Automated axe** — run `axe-core` over a fixture per component/surface.
   In jsdom, disable `color-contrast` and `region` (no layout); run the full
   rule set in a real browser or Playwright for the release gate.
2. **Explicit behavior tests** — focus moves, Escape restores, arrows navigate,
   typeahead selects, invalid fields link to errors, the skip link targets
   `<main>`. These are assertions, not screenshots.

```ts
import axe from 'axe-core';

const results = await axe.run(root, {
    rules: {
        'color-contrast': { enabled: false }, // jsdom has no layout
        region: { enabled: false },
    },
});
expect(results.violations).toEqual([]);
```

A manual pass is still required for the things automation cannot see: screen
reader announcements, focus order in context, zoom/reflow, and real contrast.
Test with one desktop screen reader and one mobile screen reader before a public
release.

## 8. Pitfalls

- **ARIA is a patch, not a substitute.** Prefer native elements; a `role` on a
  `div` does not add keyboard behavior.
- **Placeholder-as-label.** It disappears and is not a programmatic name.
- **Removing focus outlines.** Replace them with a visible ring, not `none`.
- **Hiding errors in toasts.** Keep the message associated with the field.
- **Hydration that remounts the focused element.** Preserve focus across
  connect/update.
- **Disabled submit as validation.** It prevents the user from discovering why.
- **Color-only state.** Add text/icon/ARIA.
- **One axe run on the home page.** Audit the components and states you ship,
  including dialogs/menus open.

## See also

- [Guide 30 — UI Libraries & Component Integration](30-component-integration.md) — the vetting checklist
- [Guide 18 — Forms End-to-End](18-forms-end-to-end.md) — labels, errors, PRG
- [Guide 09 — Views, Targets & Content Negotiation](09-views-and-content-negotiation.md) — first paint and view targets
- [Guide 29 — Signals & Islands](29-signals-and-islands.md) — hydration
- [`@ndigo/ui`](../../packages/ndigo-ui/README.md) — tokens, app-shell, conformance tests
- [`@ndigo/view-webcomponent`](../../packages/ndigo-view-webcomponent/README.md) — FACE and hydration
- and — integration and ndigo-ui conformance
