# Plans

Implementation plans for features and technical specifications.

## Completed Plans

### 2026-03-22 - View Event Architecture

Hardened the Spring MVC-inspired view/event contracts with explicit event-bridge interfaces, router refresh contract, lifecycle cleanup, and legacy Bridge removal.

**Status:** Completed  
**Commit:** (pending)  
**Impact:** Architectural hardening - stronger contracts and lifecycle safety

[Read full plan](2026-03-22_VIEW_EVENT_ARCHITECTURE.md)

---

### 2026-02-08 - RegExp Naming Convention Standardization

Standardized all UPPER_SNAKE_CASE RegExp constants to camelCase with Rule suffix across @blue/validate, @blue/http, and @blue/platform-web packages.

**Status:** Completed  
**Commit:** 7d58ca0  
**Impact:** Breaking change - 37 constants renamed

[Read full plan](2026-02-08_REGEX_NAMING_CONVENTION.md)

---

## Active Plans

- [2026-03-08_PACKAGE_ROADMAP.md](2026-03-08_PACKAGE_ROADMAP.md)
- [2026-03-08_VALIDATE_DESIGN.md](2026-03-08_VALIDATE_DESIGN.md)
- [2026-02-07_HTTP_TRANSFORM_PIPELINE.md](2026-02-07_HTTP_TRANSFORM_PIPELINE.md)

## Draft Plans

None currently.

---

_Naming convention: `YYYY-MM-DD_DESCRIPTION.md`_
