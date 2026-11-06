#!/usr/bin/env node
import { scaffold } from '../lib/index.js';

const exitCode = await scaffold(process.argv.slice(2));
process.exit(exitCode);
