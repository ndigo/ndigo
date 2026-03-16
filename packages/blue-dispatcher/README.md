# Blue Dispatcher

Blue Dispatcher implements BlueJS request/route dispatch orchestration and handler adaptation.

## Features

- `BrowserDispatcher` route dispatch lifecycle
- Route mapping decorators and metadata scanning
- Argument resolver pipeline for route handler methods
- Error mapping and resolver chain support
- Model-and-view processing integration with `@blue/view`

## Installation

```bash
pnpm add @blue/dispatcher
```

## Usage

```typescript
import { routeMapping, routeParams, queryValue } from '@blue/dispatcher';

class ExampleController {
    @routeMapping('/health')
    health() {
        return 'ok';
    }

    @routeMapping('/users')
    @routeParams({
        page: queryValue('page', { convert: 'number' }),
    })
    list(page: number) {
        return page;
    }
}
```

## Development

```bash
pnpm --filter @blue/dispatcher build:lib
pnpm --filter @blue/dispatcher test
```
