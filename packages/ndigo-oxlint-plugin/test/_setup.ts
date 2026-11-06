/**
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { afterAll, describe, it } from 'vitest';

Object.assign(RuleTester, { afterAll }, { describe }, { it });
