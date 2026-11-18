---
rule: '@ndigo/no-unsafe-view-name-literal'
severity: error
recommended: true
since: 0.0.1
---

# no-unsafe-view-name-literal

A string literal used as a view name breaks the relative-name contract, or an
`IslandView` name is not a valid custom-element tag.

## What it reports

`unsafeViewName` — the literal is absolute, contains a `..` segment, or embeds
a NUL byte:

```ts
return new ModelAndView('/pages/home');
return new ModelAndView('../../etc/passwd');
viewResolver.resolveViewName('/admin/report');
```

`invalidIslandViewName` — the tag is not a lowercase custom-element name, or it
is one of the reserved platform names (`annotation-xml`, `color-profile`,
`font-face*`, `missing-glyph`):

```ts
new IslandView('TodoApp'); // no hyphen, uppercase
new IslandView('todo_app'); // underscore before the hyphen
```

Path checks apply to `ModelAndView('…')` and `resolveViewName('…')`. The island
grammar applies to `IslandView('…')`. `EJSView` is deliberately out of scope:
its first argument is a template path resolved through a `ResourceLoader`,
where `pages/home.html` is the expected spelling.

## Why

View names are looked up in the view resolver's own namespace. An absolute name
or `..` segment escapes it — the DSV-SEC-1 traversal contract. Island names
become custom-element tags, so they must satisfy the platform grammar before
the browser rejects them.

## How to fix

Use a plain relative name:

```ts
new ModelAndView('home');
new IslandView('todo-app');
```

## Options

None. Only string literals are checked; a name computed at runtime is outside
the rule's reach (and outside the resolver's safe path).

## When to disable

Only for a literal that the resolver treats as a resource path on purpose — the
`EJSView` case is already exempt. Do not disable it to keep an absolute view
name that happens to resolve today.
