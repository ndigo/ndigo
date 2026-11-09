# nd-sidebar

> Section navigation panel with native collapsible groups.

The sidebar is markup plus CSS. `<details>` gives each group disclosure
behaviour with no JavaScript, and the panel sticks beside the content on wide
screens.

## Usage

```html
<aside class="nd-sidebar" aria-label="Section navigation">
    <div class="nd-sidebar__header">
        <span class="nd-sidebar__brand">Workspace</span>
        <span class="nd-sidebar__version">v0.0.1</span>
    </div>
    <nav class="nd-sidebar__nav">
        <details class="nd-sidebar__group" open>
            <summary class="nd-sidebar__group-label">Getting started</summary>
            <ul class="nd-sidebar__list">
                <li><a class="nd-sidebar__link" href="#overview" aria-current="page">Overview</a></li>
                <li><a class="nd-sidebar__link" href="#install">Installation</a></li>
            </ul>
        </details>
    </nav>
    <div class="nd-sidebar__footer">
        <a class="nd-sidebar__link" href="#settings">Settings</a>
    </div>
</aside>
```

Put the panel in a layout grid with the content; `align-self: start` keeps the
sticky panel from stretching.

## Parts

| Class                      | Purpose                                  |
| :------------------------- | :--------------------------------------- |
| `.nd-sidebar__header`      | Brand and version                        |
| `.nd-sidebar__nav`         | Group container                          |
| `.nd-sidebar__group`       | Native `<details>` group                 |
| `.nd-sidebar__group-label` | `<summary>` with a rotating chevron      |
| `.nd-sidebar__list`        | Link list                                |
| `.nd-sidebar__link`        | Link; `aria-current="page"` marks active |
| `.nd-sidebar__footer`      | Settings and secondary links             |

## Responsive and off-canvas

Below `48rem` the panel stops being sticky and stacks above the content at full
width. For an off-canvas mobile panel, host the same `<nav>` partial inside
`nd-drawer` (`placement="start"`) and show the drawer trigger only below the
breakpoint; keep one source for the nav so the two surfaces cannot drift.

## Accessibility

- Use an `<aside>` with a distinct `aria-label`; it is a complementary landmark.
- `<details>`/`<summary>` are keyboard operable natively; do not replace them
  with click handlers on a `<div>`.
- Mark exactly one current link per navigation with `aria-current="page"`.
- The chevron is CSS-generated and presentational; the group label carries the
  name.

## Styling

Import `sidebar.css` after the tokens. The panel uses the surface and border
tokens; hover, focus, and the active link use the accent-soft token. Reduced
motion removes the chevron transition.
