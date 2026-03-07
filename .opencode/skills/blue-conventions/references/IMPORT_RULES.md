# Import Rules Reference

## Allowed Integration Imports

```ts
import * as R from '@blue/util';
import { parseDate, formatDate } from '@blue/util';
import { choice, sequenceOf } from '@blue/parser';
```

## Disallowed Direct Imports (outside integration-layer packages)

```ts
import * as R from 'ramda';
import { format } from 'date-fns';
import { choice } from 'arcsecond';
import Model from 'objectmodel';
```

## Exceptions

- Test files may directly import external libraries for mocking/test utilities.
