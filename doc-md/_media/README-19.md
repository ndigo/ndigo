# Blue View WebComponent

Blue View WebComponent bridges BlueJS view patterns with Web Components.

## Features

- Web component-oriented view integration layer
- Designed to extend `@blue/view` abstractions to browser custom elements
- ESM package scaffold for web-component integrations

## Installation

```bash
pnpm add @blue/view-webcomponent
```

## Usage

This package is currently a thin integration layer and is typically consumed alongside `@blue/view` and browser custom
element registration code.

## Development

```bash
pnpm --filter @blue/view-webcomponent build:lib
pnpm --filter @blue/view-webcomponent test
```
