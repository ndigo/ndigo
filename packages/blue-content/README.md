# Blue Content

Blue Content defines content and theme abstractions used across BlueJS packages.

## Features

- `ContentSource` interface for localized/content-key lookups
- `Theme` and `ThemeSource` contracts for theme-aware rendering
- Awareness mixins (`AsContentSourceAware`) and duck-type guards
- Integration with `@blue/factory` and `@blue/core`

## Installation

```bash
pnpm add @blue/content
```

## Usage

```typescript
import { ContentSource, Theme } from '@blue/content';

class StaticContentSource implements ContentSource {
    getContent(key: string, language: string): string {
        return `${language}:${key}`;
    }
}

const theme: Theme = {
    name: 'default',
    contentSource: new StaticContentSource(),
};

theme.contentSource.getContent('welcome', 'en');
```

## Development

```bash
pnpm --filter @blue/content build:lib
pnpm --filter @blue/content test
```
