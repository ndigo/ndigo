/** @author Jeff Rose */

import { RuleTester } from 'oxlint/plugins-dev';
import { afterAll, describe, it } from 'vitest';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
