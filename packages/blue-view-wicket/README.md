# @blue/view-wicket

Wicket-inspired component model for BlueJS — server-rendered, stateful, event-driven UI components with a lifecycle similar to Apache Wicket.

## Installation

```bash
pnpm add @blue/view-wicket
```

## Overview

This package provides a component-based view architecture for building server-rendered web interfaces. Components have a defined lifecycle (initialize → configure → render → detach → remove), support nesting, and can be bound to reactive models.

## Key Exports

- `WicketComponent` — base class with lifecycle hooks
- `WicketContainer` — parent component that manages children
- `Page` — top-level page component
- `Panel` — reusable panel component
- `Form`, `TextField`, `CheckBox`, `DropDownChoice`, `TextArea`, `Button`, `Link`, `Label` — form controls
- `ListView`, `ListItem` — list rendering
- `Fragment` — inline template fragment
- `TemplateCompiler` — compiles HTML templates into component trees
- `WicketViewEngine`, `WicketViewResolver` — integration with @blue/view

## Lifecycle

1. `onInitialize()` — after construction
2. `onConfigure()` — before each render
3. `onRender()` — during rendering
4. `onDetach()` — after render/removal