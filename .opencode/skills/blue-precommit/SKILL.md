---
name: blue-precommit
description: Pre-commit quality and policy validation commands for BlueJS changes.
---

# Blue Pre-Commit Validation

Use this skill before finalizing any implementation.

## Standard Commands

```bash
pnpm build
pnpm test
pnpm lint
```

## Policy Checks

```bash
rg "from ['\"]ramda['\"]" --type ts
rg "from ['\"]date-fns['\"]" --type ts
rg "from ['\"]arcsecond['\"]" --type ts

rg "(class|interface|type) \w*(Http|Json|Xml|Url|Api|Html|Dto|Uuid|Uri)\w*" --type ts

rg "^export class [A-Z][a-z]+Transformer" packages/blue-core/src/transducer.ts

rg "^(export )?abstract class [A-Z]" --type ts | rg -v "^(export )?abstract class Abstract"

rg "^export const [A-Z_]+.*= /" packages/*/src --type ts
rg "^const [A-Z_]+.*= /" packages/*/src --type ts
```

## Expectations

- Build/test/lint pass.
- Policy checks return no unexpected violations.
