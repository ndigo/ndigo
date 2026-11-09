# nd-code-block

> Preformatted code surface with a language label and a copy button.

The block is markup plus a small glue module. It does not highlight syntax; keep
the `<pre><code>` structure and add a highlighter upstream if needed.

## Usage

```ts
import { initCodeBlocks } from './components/code-block/code-block';

const blocks = initCodeBlocks(document);
```

```html
<div class="nd-code-block" data-code-block>
    <div class="nd-code-block__header">
        <span class="nd-code-block__language">TypeScript</span>
        <button class="nd-button" data-variant="ghost" data-size="sm" type="button" data-copy>Copy</button>
    </div>
    <pre class="nd-code-block__pre" tabindex="0"><code class="nd-code-block__code">const answer = 42;</code></pre>
</div>
```

`initCodeBlocks(root)` returns one handle per block, each with `copy()` and
`destroy()`. The button click calls `copy()`.

## Behaviour

`copy()` writes the `<code>` text through `navigator.clipboard.writeText`. If
the API rejects or is unavailable, it falls back to a hidden textarea and
`document.execCommand('copy')`. On success the button shows `Copied` for 1.5s
and the block emits `nd-copy`; on failure the button stays unchanged.

## Events

- `nd-copy` — `detail: { text: string }`, emitted from the block.

## Accessibility

The copy action is a real button with a visible label. The language label is
plain text; it does not need `aria-hidden`. Keep the code as text inside
`<pre><code>` so screen readers and find-in-page work; do not render it into
images or line-number columns. Keep `tabindex="0"` on the `<pre>` so keyboard
users can scroll a long line.

## Styling

Import `code-block.css` after the tokens and `nd-button.css`. The header uses the
surface token, the code area the code background token, and the border/radius
tokens for the frame.
