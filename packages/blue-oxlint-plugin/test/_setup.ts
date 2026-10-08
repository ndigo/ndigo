/**
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { afterAll, describe, it } from 'vitest';

Object.assign(RuleTester, { afterAll }, { describe }, { it });
