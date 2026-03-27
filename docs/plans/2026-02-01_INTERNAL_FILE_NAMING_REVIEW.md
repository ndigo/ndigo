# Internal File Naming Convention Review

**Date:** To Be Scheduled  
**Status:** Future Planning  
**Reference:** STYLE_GUIDE.md Section 4.5

## Purpose

Re-evaluate the internal file naming convention to determine if the current hybrid approach should be:
1. **Kept as-is** - Hybrid works well, continue current pattern
2. **Standardized** - Pick one pattern (generic vs specific) and migrate
3. **Enhanced** - Evolve to directory-based organization (`src/internal/`)

## Evaluation Criteria

### Qualitative Metrics (Primary Focus)

**Questions to answer:**

1. **Discoverability:**
   - Do I easily find internal utilities when needed?
   - Is it clear what each internal file contains?
   - Are there "orphaned" utilities that should be consolidated?

2. **Maintainability:**
   - Are internal files well-organized?
   - Do `_util.ts` files stay under 150 lines?
   - Are specific domain files (e.g., `_validators.ts`) easier to maintain than generic `_util.ts`?

3. **Scalability:**
   - Has the project grown beyond the comfort zone of file-based organization?
   - Would directories (`src/internal/`) improve organization?
   - Are there too many internal files in any package?

4. **Convention Clarity:**
   - Do I understand when to use which pattern?
   - Are there edge cases the guidelines don't cover?
   - Has the hybrid approach caused inconsistency?

5. **Cognitive Load:**
   - Is it mentally taxing to decide between `_util.ts` vs `_validators.ts`?
   - Do I second-guess naming decisions frequently?
   - Would a simpler rule be better?

### Quantitative Metrics (Secondary)

**Measure at review time:**

1. **File Count Growth:**
   ```bash
   # Total TypeScript files
   find packages -name "*.ts" -path "*/src/*" | wc -l
   
   # Internal files
   find packages -name "_*.ts" -path "*/src/*" | wc -l
   
   # Internal files per package
   for pkg in packages/blue-*/; do
     count=$(find "$pkg/src" -name "_*.ts" 2>/dev/null | wc -l)
     echo "$(basename $pkg): $count internal files"
   done
   ```

   **Current Baseline (Feb 2025):**
   - Total files: ~696
   - Internal files: ~7 (1% ratio)
   - Packages with internal files: 5 of 24

   **Thresholds for Change:**
   - >1000 total files → Consider directory-based
   - >10% internal file ratio → Review naming strategy
   - >5 internal files per package (avg) → Consider consolidation

2. **Naming Distribution:**
   ```bash
   # Count by type
   echo "=== _util.ts files ==="
   find packages -name "_util.ts" -path "*/src/*" | wc -l
   
   echo "=== Domain-specific files ==="
   find packages -name "_*.ts" -path "*/src/*" | grep -v "_util.ts" | grep -v "test/" | wc -l
   
   echo "=== Test helpers ==="
   find packages -name "_*.ts" -path "*/test/*" | wc -l
   ```

   **Current Baseline:**
   - `_util.ts`: 3 packages
   - Domain-specific: 2 files (`_parser.ts`, `_natural-sort.ts`)
   - Test helpers: 3 files

3. **File Size Distribution:**
   ```bash
   # Check if _util.ts files are growing too large
   for file in $(find packages -name "_util.ts" -path "*/src/*"); do
     lines=$(wc -l < "$file")
     echo "$file: $lines lines"
   done
   ```

   **Threshold:** If any `_util.ts` exceeds 150 lines, may need splitting

## Evaluation Process

### Step 1: Qualitative Assessment

**Reflection Questions (Self-Assessment):**

1. **Past Experience Review:**
   - How many times was I confused about where to put an internal utility?
   - Did I ever create an internal file and immediately regret the naming?
   - Have I needed to rename or reorganize internal files?

2. **Current State:**
   - Open each package and review its internal files
   - Do the names make sense?
   - Are utilities where I'd expect them?
   - Is there duplication or overlap?

3. **Pain Points:**
   - List any frustrations with current approach
   - Note any patterns that emerged that guidelines don't cover
   - Identify packages that have messy internal file organization

### Step 2: Quantitative Data Collection

Run the metrics scripts above and compare to baselines.

**Calculate:**
- Growth rate: (current files - baseline files) / months elapsed
- Projection: At current rate, when will thresholds be crossed?
- Distribution changes: Has the mix of generic vs specific files shifted?

### Step 3: Industry Comparison

**Re-check Major Projects:**

Has anything changed in the industry since Feb 2025?
- Node.js: Still using descriptive names?
- React: Still using package.json exports?
- Angular: Still using directories?
- New patterns emerged in popular projects?

**Search for:**
- Blog posts on internal file organization
- TypeScript GitHub discussions
- Popular monorepo examples

### Step 4: Decision Matrix

| Criterion | Keep Hybrid | All Generic | All Specific | Directory-Based |
|-----------|------------|-------------|--------------|-----------------|
| Discoverability | | | | |
| Maintainability | | | | |
| Scalability | | | | |
| Clarity | | | | |
| Consistency | | | | |
| Migration Effort | N/A | | | |

**Scoring:** Rate each option 1-5 for each criterion based on qualitative + quantitative data.

### Step 5: Make Decision

**Options:**

**Option A: Keep Hybrid (No Change)**
- Works well, no significant issues
- Comfortable with current approach
- File count hasn't exploded
- Guidelines are clear enough

**Option B: Standardize on Generic**
- Consolidate to `_util.ts` only
- Simpler mental model (one rule)
- Less file proliferation
- Migration: Merge specific files into `_util.ts`

**Option C: Standardize on Specific**
- All internal files get descriptive names
- Follows Node.js pattern strictly
- Better self-documentation
- Migration: Split `_util.ts` into domain files

**Option D: Evolve to Directory-Based**
- Create `src/internal/` directories
- Better organization for large packages
- Can keep file naming within directories
- Migration: Move files into subdirectory

**Option E: Hybrid with Refinements**
- Keep current approach
- Add clearer thresholds/guidelines
- Document edge cases better
- No migration needed

## Implementation Plan (If Changes Needed)

### If Standardizing or Evolving

**Process:**
1. **Document new convention** in STYLE_GUIDE.md
2. **Create migration script** (if applicable)
3. **Update packages incrementally:**
   - Start with smallest packages
   - Test after each package
   - Commit incrementally
4. **Update documentation** references
5. **Announce change** (if team grows)

**Timeline:** 2-4 weeks depending on migration size

### If Keeping Hybrid

**Process:**
1. **Document lessons learned** - What worked? What didn't?
2. **Refine guidelines** - Add edge cases, clarify ambiguities
3. **Update examples** - Add more real-world examples to STYLE_GUIDE.md
4. **Set next review date** - When to re-evaluate again

## Review Triggers (Early Re-evaluation)

Don't wait for scheduled review if these occur:

1. **>5 internal files in any package** 
   - May need directory structure for that package
   - Consider consolidation or restructuring

2. **Repeated confusion about naming**
   - Multiple instances of uncertainty about where to put utilities
   - Guidelines not working in practice

3. **Significant monorepo growth**
   - >1000 files reached
   - Many new packages added

4. **Maintenance burden**
   - Internal files becoming hard to maintain
   - Frequent refactoring of internal file structure

## Success Criteria

After review and any changes:

- ✅ Clear, unambiguous guidelines
- ✅ Confident in placement decisions
- ✅ Internal file organization scales with project
- ✅ Consistent pattern across packages
- ✅ Low cognitive overhead

## Documentation References

- **Current Guidelines:** STYLE_GUIDE.md Section 4.5
- **Implementation Status:** docs/plans/2026-02-01_UTILITY_ORGANIZATION.md
- **Industry Research:** Context from Feb 2025 research (in git history)

## Notes

- **Version 0 Flexibility:** Project is still version 0, so large migrations are acceptable
- **Solo Developer:** No team coordination needed, can make changes quickly
- **Focus on Experience:** Prioritize what feels right over theoretical perfection

---

**Status:** Future Planning - To Be Scheduled  
**Estimated Effort:** 1 week analysis + 1-3 weeks implementation (if changes needed)
