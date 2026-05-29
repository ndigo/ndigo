# Blue Platform Node

Blue Platform Node provides Node.js HTTP argument resolvers and environment integration for @blue/dispatcher.

## Installation

```bash
pnpm add @blue/platform-node
```

## Features

### Argument Resolvers
The package provides 6 argument resolvers for binding request data to controller method parameters:

- `NodeQueryValueMethodArgumentResolver`: Binds query parameters from the URL
- `NodePathValueMethodArgumentResolver`: Binds path parameters from the route
- `NodeHeaderValueMethodArgumentResolver`: Binds HTTP headers
- `NodeBodyValueMethodArgumentResolver`: Binds request body data
- `NodeCookieValueMethodArgumentResolver`: Binds cookies from the request
- `NodeSessionValueMethodArgumentResolver`: Binds session data

### NodeEnvironment
A Node.js environment implementation that includes `process.env` as the first property source, extending `StandardEnvironment`.

### NodeAutoConfiguration
Auto-configuration for Node.js-based applications that provisions:
- Argument-value converter registry
- All 6 argument resolvers
- Default handler mapping for metadata-driven dispatch

## Usage

### With @blue/boot
Register `NodeAutoConfiguration` alongside `NodeEnvironment` with your `ApplicationContext` to enable full server-side argument resolution:

```typescript
import { GenericApplicationContext } from '@blue/context';
import { NodeAutoConfiguration } from '@blue/platform-node';
import { NodeEnvironment } from '@blue/platform-node';

const context = new GenericApplicationContext('my-app');
context.registerConfiguration(NodeAutoConfiguration);
context.setValue('environment', new NodeEnvironment());
```

### Controller Example
```typescript
import { 
  controller, 
  get, 
  post,
  query,
  path,
  header,
  body,
  cookie,
  session
} from '@blue/dispatcher';

@controller('/users')
class UserController {
  @get('/:id')
  getUser(
    @path('id') id: string,
    @query('include') include: string,
    @header('authorization') authHeader: string
  ) {
    return { id, include, authHeader };
  }

  @post('/')
  createUser(
    @body('name') name: string,
    @cookie('sessionId') sessionId: string,
    @session('userId') userId: string
  ) {
    return { name, sessionId, userId };
  }
}
```

### Custom Configuration
Use `configureNodeArgumentResolvers()` to register resolvers with custom options:

```typescript
import { configureNodeArgumentResolvers } from '@blue/platform-node';

configureNodeArgumentResolvers(context, {
  query: 'string',
  body: 'json',
  converterRegistry: myCustomConverterRegistry,
  strictNamedConverterLookup: true
});
```