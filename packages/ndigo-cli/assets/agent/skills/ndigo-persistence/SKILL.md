---
name: ndigo-persistence
description: Works with Ndigo entities, ORM schemas, and journaled migrations. Use when adding a table or entity, generating or applying a migration, or checking database status.
---

# Persistence and migrations

## Decision table

| Goal                              | Command                                                   |
| :-------------------------------- | :-------------------------------------------------------- |
| Add or change an entity           | edit the decorated entity, then `ndigo db generate [dir]` |
| Inspect pending state             | `ndigo db status [dir]`                                   |
| Apply migrations                  | `ndigo db migrate [dir]`                                  |
| Scaffold a hand-written migration | `ndigo db new [dir] <slug>`                               |
| Push or pull a schema             | `ndigo db push` / `ndigo db pull`                         |
| Browse data                       | `ndigo db studio`                                         |

## The contract

- Entities are the schema source. `db generate` diffs the committed snapshot
  and writes the next versioned migration plus the new snapshot.
- The journal (`_ndigo_migrations`) is the source of truth for applied state;
  `db status` reads it.
- `migrations.runOnBoot` is opt-in. Production rollouts run `db migrate` as a
  separate step unless the deployment contract says otherwise.
- Migration files are reviewed artifacts: generated SQL plus the snapshot.

## Sequence

1. Change the entity.
2. `ndigo db generate` — review the SQL and the snapshot diff.
3. `ndigo db status` — confirm pending.
4. `ndigo db migrate`.
5. `ndigo db status` — confirm applied; run the app tests.

## Traps

- **Never hand-edit the snapshot** to "fix" drift; regenerate it.
- **Destructive changes block generation** until reviewed. Read the DROP
  statements before passing an accept flag.
- **A missing adapter is not a database.** `ndigo db list` shows the registered
  adapters and the default; `--db <name>` selects among them.

## Verify

`ndigo db status` shows the migration applied, and a test exercises the
repository path against the real schema.
