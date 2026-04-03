# Wicket Component Catalog

Quick reference of all Wicket components exported by `@blue/view-wicket`.

## Core Components

### `WicketComponent<T>` (Abstract)

- **Constructor:** `constructor(id: string, model?: ReadableModel<T>)`
- **Key Methods:** `onInitialize()`, `onConfigure()`, `onBeforeRender()`, `onAfterRender()`, `onDetach()`, `addBehavior()`
- **Parent:** None

### `WicketContainer<T>` (Abstract)

- **Constructor:** `constructor(id: string, model?: ReadableModel<T>)`
- **Key Methods:** `add()`, `remove()`, `get()`, `visitChildren()`
- **Parent:** `WicketComponent<T>`

### `Page<T>`

- **Constructor:** `constructor(id: string, model?: ReadableModel<T>)`
- **Key Methods:** `renderPage()`, `static createTemplate()`
- **Parent:** `WicketContainer<T>`

### `Panel<T>`

- **Constructor:** `constructor(id: string, model?: ReadableModel<T>)`
- **Key Methods:** `static createTemplate()`
- **Parent:** `WicketContainer<T>`

### `Fragment<T>`

- **Constructor:** `constructor(id: string, markupId: string, markupProvider: WicketContainer<any>, model?: ReadableModel<T>)`
- **Parent:** `WicketContainer<T>`

## Basic Components

### `Label<T>`

- **Constructor:** `constructor(id: string, model?: ReadableModel<T>)`
- **Parent:** `WicketComponent<T>`

### `Link<T>`

- **Constructor:** `constructor(id: string, model?: ReadableModel<T>)`
- **Key Methods:** `onClick()`
- **Parent:** `WicketComponent<T>`

## List Components

### `ListView<T>`

- **Constructor:** `constructor(id: string, model?: ReadableModel<T[]>)`
- **Key Methods:** `populateItem(item: ListItem<T>)`
- **Parent:** `WicketContainer<T[]>`

### `ListItem<T>`

- **Constructor:** `constructor(id: string, index: number, model?: ReadableModel<T>)`
- **Parent:** `WicketContainer<T>`

## Form Components

### `Form<T>`

- **Constructor:** `constructor(id: string, model?: ReadableModel<T>)`
- **Key Methods:** `onSubmit()`, `onError()`
- **Parent:** `WicketContainer<T>`

### `FormComponent<T>` (Abstract)

- **Constructor:** `constructor(id: string, model?: ReadableModel<T>)`
- **Key Properties:** `required: boolean`
- **Key Methods:** `onValidate()`, `validate()`, `hasErrorMessage()`, `getErrorMessage()`
- **Parent:** `WicketComponent<T>`

### `TextField<T>`

- **Constructor:** `constructor(id: string, model?: ReadableModel<T>)`
- **Parent:** `FormComponent<T>`

### `TextArea<T>`

- **Constructor:** `constructor(id: string, model?: ReadableModel<T>)`
- **Parent:** `FormComponent<T>`

### `CheckBox`

- **Constructor:** `constructor(id: string, model?: ReadableModel<boolean>)`
- **Parent:** `FormComponent<boolean>`

### `DropDownChoice<T>`

- **Constructor:** `constructor(id: string, model?: ReadableModel<T>, choices?: ReadableModel<T[]>)`
- **Parent:** `FormComponent<T>`

### `Button<T>`

- **Constructor:** `constructor(id: string, model?: ReadableModel<T>)`
- **Key Methods:** `onSubmit()`
- **Parent:** `FormComponent<T>`

### `FeedbackPanel`

- **Constructor:** `constructor(id: string)`
- **Parent:** `Panel<any>`

## Behaviors & Modifiers

### `AttributeModifier`

- **Constructor:** `constructor(attribute: string, replaceModel: ReadableModel<string>)`
- **Key Methods:** `onComponentTag()`

### `CSSClassAppender`

- **Constructor:** `constructor(appendModel: ReadableModel<string>)`
- **Parent:** `AttributeModifier`

### `EventBehavior`

- **Constructor:** `constructor(event: string)`
- **Key Methods:** `onEvent(target: EventTarget, event: Event)`

## Infrastructure

### `TemplateCompiler`

- **Constructor:** `constructor()`
- **Key Methods:** `compile()`

### `WicketView`

- **Constructor:** `constructor(pageClass: new (...args: any[]) => Page<any>, domProvider: DOMProvider)`
- **Key Methods:** `render()`

### `WicketViewEngine`

- **Constructor:** `constructor(domProvider: DOMProvider)`
- **Key Methods:** `render()`

### `WicketViewResolver`

- **Constructor:** `constructor(domProvider: DOMProvider)`
- **Key Methods:** `resolveViewName()`
