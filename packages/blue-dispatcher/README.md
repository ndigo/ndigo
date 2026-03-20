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
import { routeMapping, routeParams, queryValue, asNumber } from '@blue/dispatcher';

class ExampleController {
    @routeMapping('/health')
    health() {
        return 'ok';
    }

    @routeMapping('/users')
    @routeParams({
        page: asNumber(queryValue('page')),
    })
    list(page: number) {
        return page;
    }
}
```

`convert` supports:

- converter functions
- named converter references (resolved by resolver registry)
- optional descriptors: `{ optional: true, use: 'number' }`

### Typed Converter Wrappers

For better readability and type safety, you can use typed converter wrappers:

- `asNumber(extractor)`
- `asBoolean(extractor)`
- `asDate(extractor)`
- `asJson<T>(extractor)`

### Data Binding

`bindValue(source, options?)` allows binding an entire data source (query, state, etc.) to a nested object using dot-notation and bracket-notation keys.

```typescript
import { routeParams, bindValue } from '@blue/dispatcher';

@routeParams({
    user: bindValue('query', { prefix: 'user.' })
})
handle(user: User) {}
```

If query parameters are `?user.name=Jeff&user.age=30`, the `user` argument will be `{ name: 'Jeff', age: '30' }`.

```typescript
@routeParams({
    age: asNumber(queryValue('age')),
    isActive: asBoolean(stateValue('active')),
    profile: asJson<UserProfile>(modelValue('profile'))
})
handle(age: number, isActive: boolean, profile: UserProfile) {}
```

## Development

```bash
pnpm --filter @blue/dispatcher build:lib
pnpm --filter @blue/dispatcher test
```
