# Registry item status

Every `meta.json` records the item's maturity in `status`. The field is not
consumed by the installer today; it exists so the catalogue, the site, and
future `ndigo ui` commands can distinguish shipped items from experiments.

| Status       | Meaning                                                                                   |
| :----------- | :---------------------------------------------------------------------------------------- |
| `spike`      | Exploratory. No compatibility promise; may change or be removed without a note.           |
| `preview`    | Implemented and conformance-tested; the API may still change between minor releases.      |
| `stable`     | Conformance-tested, budgeted, documented, and safe to depend on within the current major. |
| `deprecated` | Superseded. Keep the item installable for migrations; name the replacement in its README. |

Promotion criteria for `stable`:

1. A spec covers structure, keyboard/focus behaviour, and axe-clean markup (or
   the item is CSS-only and covered by the native-form/lab fixtures).
2. `meta.json` records a `gzipBytes` budget, and the budget test passes.
3. The item README matches the implementation (attributes, events, parts).
4. No open correctness or accessibility finding is attached to the item.

Demote to `deprecated` rather than deleting an item that consumers may have
installed. Remove a `spike` item only when no consumer references it.
