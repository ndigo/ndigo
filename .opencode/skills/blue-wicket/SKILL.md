---
name: blue-wicket
description: Wicket view engine component patterns, lifecycle, and controller integration for BlueJS.
---

# Blue Wicket

Use this skill when working with the `@blue/view-wicket` package or creating Wicket-based views.

## Component Hierarchy

```
WicketComponent<T>          (abstract base, has id + model + behaviors)
  └── WicketContainer<T>    (has children + template)
        ├── Panel<T>        (reusable container with own template)
        └── Page<T>         (top-level, owns document, renderPage())
```

## Key Components

| Component           | Package             | Purpose                                               |
| ------------------- | ------------------- | ----------------------------------------------------- |
| `WicketComponent`   | `@blue/view-wicket` | Abstract base with id, model, behaviors, lifecycle    |
| `WicketContainer`   | `@blue/view-wicket` | Base container with children map and template         |
| `Panel`             | `@blue/view-wicket` | Reusable container for composition                    |
| `Page`              | `@blue/view-wicket` | Top-level root, entry for rendering                   |
| `Label`             | `@blue/view-wicket` | Renders model value as text content                   |
| `Link`              | `@blue/view-wicket` | Clickable link with href model                        |
| `ListView`          | `@blue/view-wicket` | Repeats `ListItem` for each model entry               |
| `ListItem`          | `@blue/view-wicket` | Single item within a `ListView`                       |
| `Form`              | `@blue/view-wicket` | Form container with submit handling                   |
| `FormComponent`     | `@blue/view-wicket` | Base for form inputs (has `required`, `onValidate()`) |
| `TextField`         | `@blue/view-wicket` | Text input bound to model                             |
| `TextArea`          | `@blue/view-wicket` | Textarea bound to model                               |
| `CheckBox`          | `@blue/view-wicket` | Checkbox bound to boolean model                       |
| `DropDownChoice`    | `@blue/view-wicket` | Select dropdown                                       |
| `Button`            | `@blue/view-wicket` | Submit/action button                                  |
| `FeedbackPanel`     | `@blue/view-wicket` | Displays validation messages                          |
| `AttributeModifier` | `@blue/view-wicket` | Modifies element attributes                           |
| `CSSClassAppender`  | `@blue/view-wicket` | Appends CSS classes                                   |
| `EventBehavior`     | `@blue/view-wicket` | Attaches DOM event handlers                           |
| `Fragment`          | `@blue/view-wicket` | Lightweight container for markup fragments            |

## Reactive Models (from `@blue/reactive`)

| Model              | Purpose                             |
| ------------------ | ----------------------------------- |
| `StaticModel<T>`   | Immutable value wrapper             |
| `MutableModel<T>`  | Read-write reactive value           |
| `DerivedModel<T>`  | Computed from other models          |
| `PropertyModel<T>` | Binds to a property of parent model |
| `CompoundModel<T>` | Aggregates multiple models          |
| `LoadableModel<T>` | Async data with loading states      |

## Template Pattern

Templates use `data-w-id` attributes to bind components:

```html
<div>
    <h1 data-w-id="title"></h1>
    <div data-w-id="listPanel"></div>
    <div data-w-id="formPanel"></div>
</div>
```

Pages and Panels define templates via a static `createTemplate()` method:

```typescript
class MyPage extends Page {
    static createTemplate(): MarkupContainer {
        // Return a container with template HTML
    }

    override onInitialize(): void {
        this.template = '<div><span data-w-id="label"></span></div>';
        this.add(new Label('label', new StaticModel('Hello')));
    }
}
```

Or set template directly in `onInitialize()`:

```typescript
override onInitialize(): void {
    this.template = '<div>...</div>';
    this.add(new Label('myLabel', model));
}
```

## WicketView + Controller Integration

Controllers return `ModelAndView` with a `WicketView`:

```typescript
import { WicketView } from '@blue/view-wicket';
import { BrowserDOMProvider } from '@blue/dom';

@routeMapping({ path: '/notes' })
class NotesController {
    handleRequest(request, response) {
        const model = { items: [...] };
        return new ModelAndView(
            new WicketView(NotesPage, new BrowserDOMProvider()),
            model
        );
    }
}
```

Key: The view is a `WicketView` instance (not a view name string), so no ViewResolver is needed.

## Lifecycle Hooks

1. `onInitialize()` – Add children, set template
2. `onConfigure()` – Configure before render
3. `onBeforeRender()` – Just before DOM generation
4. `onAfterRender()` – After DOM generation
5. `onDetach()` – Cleanup after render cycle

## Form Handling

`FormComponent` uses:

- `required: boolean` property
- `onValidate()` protected hook (override for custom validation)
- No `addValidator()` method

`Form` has `onSubmit()` handler.
