/**
 * The app's migrations directory (`apps/04-blue-api/db/migrations`) and the
 * committed schema snapshot (`db/schema.json`) — one resolution for the
 * `db:*` scripts and the boot wiring, so the three callers cannot drift
 * (AD-78).
 *
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import { fileURLToPath } from 'node:url';

/** Migrations directory for `loadMigrations` / `nextMigrationVersion`. */
export const MIGRATIONS_DIR = fileURLToPath(new URL('../db/migrations/', import.meta.url));

/** Committed snapshot path for `blue db generate` (AD-78 D-2). */
export const SNAPSHOT_PATH = fileURLToPath(new URL('../db/schema.json', import.meta.url));
