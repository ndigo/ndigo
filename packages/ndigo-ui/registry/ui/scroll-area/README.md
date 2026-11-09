# nd-scroll-area

> Styled scrolling viewport with machine-driven scrollbars.

`<nd-scroll-area>` keeps native scrolling and adds custom scrollbars, a corner,
and hover/drag states from the Zag.js scroll-area machine. Both axes are
rendered; a scrollbar hides itself when its axis has no overflow.

## Markup

```html
<nd-scroll-area class="panel">
    <div data-part="root">
        <div data-part="viewport">
            <div data-part="content">
                <p>Long content goes here.</p>
            </div>
        </div>
        <div data-part="scrollbar" data-orientation="vertical">
            <div data-part="thumb"></div>
        </div>
        <div data-part="scrollbar" data-orientation="horizontal">
            <div data-part="thumb"></div>
        </div>
        <div data-part="corner"></div>
    </div>
</nd-scroll-area>
```

Content placed directly inside `<nd-scroll-area>` is wrapped in `root`,
`viewport`, and `content` on connect, so the short form also works:

```html
<nd-scroll-area class="panel"><p>Long content goes here.</p></nd-scroll-area>
```

Give the element a block size; the viewport fills it and scrolls its content.

## Methods

- `scrollTo({ top?, left?, behavior? })` — scroll to coordinates.
- `scrollToEdge({ edge, behavior? })` — scroll to `top`, `right`, `bottom`, or
  `left`.

## Accessibility

The viewport is reachable by keyboard when either axis overflows and scrolls
with the standard keys. The root, viewport, and content are presentational;
assistive technology interacts with the content itself. Scrollbars are
pointer-driven visuals, not focus targets, matching native scrollbar behaviour.

## Styling

Import `nd-scroll-area.css` after the tokens. The viewport hides the native
scrollbar (`scrollbar-width: none`) and the custom scrollbars use the border and
muted text tokens, with the accent-soft background on hover/drag. The machine
sets the thumb size and corner size as CSS variables on the root.
