# nd-typography

> Scoped prose styles for rendered long-form content.

`<nd-typography>` is a CSS item: add `.nd-prose` to the container around rendered
Markdown or CMS HTML and the native elements inherit a readable rhythm.

## Usage

```html
<article class="nd-prose">
    <h2>Release notes</h2>
    <p>The registry now ships <strong>39 items</strong>.</p>
    <ul>
        <li>New tokens</li>
        <li>Copy-in components</li>
    </ul>
    <blockquote>Own the code you ship.</blockquote>
</article>
```

## What it styles

Headings (`h1`–`h4`), paragraphs, lists, definition lists, blockquotes, code,
preformatted blocks, tables, figures, links, rules, and media. The container is
capped at `65ch`; remove or override that on the class if the content needs the
full width.

## Accessibility

The styles do not change the document outline. Keep heading levels in order in
the rendered HTML; do not pick a level for its size. Links stay underlined on
hover, and focus uses the shared token ring.

## Styling

Import `nd-typography.css` after the tokens. Most selectors use `:where()` so a
consumer rule with any specificity wins; override the tokens for color and type
changes.
