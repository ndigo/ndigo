---
name: security-and-hardening
description: Security best practices. Use when handling user input, auth, data storage, or external integrations.
---

# Security and Hardening

## Overview

Security must be designed in, not added after. Follow OWASP Top 10 prevention, proper auth patterns, and secrets management.

## When to Use

- Handling user input
- Authentication or authorization
- Data storage or retrieval
- External API integrations
- Any security-sensitive code

## OWASP Top 10 Prevention

| Risk | Prevention |
|------|-----------|
| **Injection** | Parameterized queries, input validation |
| **Broken Auth** | Secure sessions, password requirements |
| **Sensitive Data** | Encryption at rest and in transit |
| **XML External Entities** | Disable XML parsing |
| **Broken Access Control** | Check permissions on every request |
| **Security Misconfig** | Minimize exposure, secure defaults |
| **XSS** | Escape output, Content Security Policy |
| **Insecure Deserialization** | Validate input, type checking |
| **Using Components with Known CVEs** | Keep dependencies updated |
| **Insufficient Logging** | Log security events |

## Input Validation

**ALWAYS validate input:**
```typescript
// Bad
function createTask(title: string) { ... }

// Good
function createTask(input: CreateTaskInput) {
  if (!input.title?.trim()) {
    throw new ValidationError('Title is required');
  }
  if (input.title.length > 200) {
    throw new ValidationError('Title too long');
  }
}
```

## Authentication

- Use established auth libraries
- Hash passwords (bcrypt, Argon2)
- Require strong passwords
- Implement account lockout
- Use secure sessions

## Authorization

**Check permissions on every request:**
```typescript
async function deleteTask(id: string, user: User) {
  const task = await db.tasks.find(id);
  
  // Always check ownership
  if (task.ownerId !== user.id && !user.isAdmin) {
    throw new ForbiddenError();
  }
  // ... proceed with deletion
}
```

## Secrets Management

- NEVER commit secrets
- Use environment variables
- Use secret management services (AWS Secrets Manager, etc.)
- Rotate secrets regularly

```typescript
// Bad: Hardcoded secret
const API_KEY = 'sk-123456789';

// Good: Environment variable
const API_KEY = process.env.API_KEY;
```

## SQL Injection Prevention

```typescript
// Bad: String concatenation
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// Good: Parameterized query
db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

## XSS Prevention

```typescript
// Bad: Inserting raw HTML
element.innerHTML = userInput;

// Good: Escape output
element.textContent = userInput;
```

## CSRF Prevention

- Use anti-CSRF tokens
- Set SameSite cookies
- Validate origin headers

## Three-Tier Boundary System

| Boundary | Definition | Examples |
|----------|------------|----------|
| **Always** | Required by default | Input validation, auth checks |
| **Ask First** | Requires approval | Schema changes, new deps |
| **Never** | Never do | Commit secrets, disable auth |

## Common Vulnerabilities

| Vulnerability | Fix |
|---|---|
| SQL injection | Parameterized queries |
| XSS | Escape output |
| CSRF | Anti-CSRF tokens |
| Sensitive data exposure | Encryption |
| Weak passwords | bcrypt, minimum length |

## Red Flags

- Raw SQL with string concatenation
- No input validation
- Secrets in code
- Missing auth checks
- User input in HTML

## Verification

- [ ] Input validation on all user data
- [ ] Authentication properly implemented
- [ ] Authorization checked on every request
- [ ] No secrets in code
- [ ] Dependencies up to date