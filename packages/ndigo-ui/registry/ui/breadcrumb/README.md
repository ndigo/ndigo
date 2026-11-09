# nd-breadcrumb

> Hierarchical page trail built on native navigation.

## Usage

```html
<nav class="nd-breadcrumb" aria-label="Breadcrumb">
    <ol class="nd-breadcrumb__list">
        <li class="nd-breadcrumb__item"><a class="nd-breadcrumb__link" href="/">Home</a></li>
        <li class="nd-breadcrumb__item"><a class="nd-breadcrumb__link" href="/docs">Docs</a></li>
        <li class="nd-breadcrumb__item"><span aria-current="page">Components</span></li>
    </ol>
</nav>
```

## Accessibility

- Use a `<nav>` with a distinct `aria-label` (`Breadcrumb` is fine when there is
  only one).
- Keep the ordered list: the order carries meaning.
- Mark the last item with `aria-current="page"`; it is plain text, not a link.
- The CSS slash between items is presentational. Browsers that support CSS alt
  text keep it out of the accessibility tree; the link names still read in order.

## Styling

Import `nd-breadcrumb.css` after the tokens. Links use the muted text token and
the current page uses the text token with medium weight.
