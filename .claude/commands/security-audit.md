---
description: Audit role authorization and security.
---
 
# Security Audit Instructions
 
Perform a comprehensive security audit of this codebase. **DO NOT modify any code.** This is a read-only analysis that produces a report.
 
## Audit Scope
 
### 1. Authentication & Authorization
- JWT implementation and token handling
- Session management and token expiration
- Password hashing and storage
- Permission checks on all endpoints (except public auth endpoints like login/register, privacy-policy, and terms-of-service)
- Authentication bypass vulnerabilities
 
### 2. API Security
- Input validation and sanitization
- SQL injection vulnerabilities (SQLAlchemy query patterns)
- Mass assignment vulnerabilities
- Rate limiting implementation
- CORS configuration
- HTTP security headers
- Error handling and information leakage
 
### 3. Data Protection
- Sensitive data exposure in logs
- PII handling and storage
- Database query patterns for data leaks
- Soft-delete implementation (is_active flags)
- UUID usage for resource identifiers
 
### 4. Frontend Security
- XSS vulnerabilities
- CSRF protection
- Sensitive data in localStorage/sessionStorage
- API key exposure
- Client-side validation bypass risks
 
### 5. Infrastructure & Configuration
- Environment variable handling
- Secrets management
- Docker security configuration
- Database connection security
- Dependency vulnerabilities (check requirements.txt and package.json)
 
### 6. Business Logic
- Privilege escalation paths
- Horizontal access control (users accessing other users' data)
- Vertical access control (role elevation)
- Resource ownership validation
 
## Audit Process
 
1. **Explore the codebase** using the Explore agent to understand the architecture
2. **Review authentication flow** - trace from login to protected endpoints
3. **Audit each API endpoint** - check for proper auth decorators and permission checks
4. **Review database models** - check for proper access patterns
5. **Analyze frontend code** - check for client-side security issues
6. **Check configurations** - review Docker, env files, and dependencies
7. **Verify role access controls** - test each role's boundary enforcement
 
## Report Format
 
Create a detailed report at `.claude/docs/security-audit-report-<date>.md` with:
 
```markdown
# Security Audit Report
 
**Date:** [Current Date]
**Auditor:** Claude Code
**Scope:** Full application security review
 
## Executive Summary
[Brief overview of findings - critical issues count, high/medium/low]
 
## Critical Findings
[Issues that need immediate attention]
 
### Finding 1: [Title]
- **Severity:** Critical/High/Medium/Low
- **Location:** [file:line]
- **Description:** [What the issue is]
- **Impact:** [What could happen if exploited]
- **Recommendation:** [How to fix it]
- **Code Reference:**
```[language]
[relevant code snippet]
```
 
## High Priority Findings
[...]
 
## Medium Priority Findings
[...]
 
## Low Priority Findings
[...]
 
## Role Access Compliance
[Findings specific to Super Admin/Tenant Admin/Fair Admin/Judge access controls]
 
## Positive Security Practices
[Things the codebase does well]
 
## Recommendations Summary
[Prioritized list of actions to take]
 
## Appendix
- Files reviewed
- Tools/patterns checked
```
 
## Important Guidelines
 
- **READ ONLY** - Do not modify any files except creating the report
- Be thorough - check every endpoint, every model, every component
- Include specific file paths and line numbers for all findings
- Provide actionable recommendations with code examples where helpful
- Note both vulnerabilities AND good security practices found
- Prioritize findings by actual exploitability in this specific context
 
Begin the audit now. Create the report file when complete.