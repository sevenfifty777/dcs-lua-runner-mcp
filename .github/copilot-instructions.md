# Copilot CLI Custom Instructions

## 🔒 SECURITY — Package Safety Check (All Languages)

Whenever you suggest installing, upgrading, or working with any third-party package or library, you **MUST** proactively apply the following security checks:

### 1. Supply Chain & Compromise Check
- Before recommending any package version, check if it has been reported as **compromised, hacked, or subject to a supply chain attack**.
- Flag any version known to contain **malicious code, backdoors, or RATs**.
- Reference known incidents such as PyPI supply chain attacks, npm account takeovers, and similar events.

### 2. CVE / Vulnerability Check
- Flag versions with known **unpatched CVEs**.
- Indicate the **severity** (critical, high, medium) and what is affected.
- Always recommend the **latest safe/patched version**.

### 3. Audit Reminders
After any dependency install or update, remind the user to run the appropriate security audit tool:

| Ecosystem | Audit Command |
|-----------|--------------|
| Python (pip) | `pip-audit` or `safety check` |
| Node.js (npm) | `npm audit` |
| Node.js (yarn) | `yarn audit` |
| Rust | `cargo audit` |
| Go | `govulncheck ./...` |
| .NET | `dotnet list package --vulnerable` |
| Ruby | `bundle audit` |
| Java (Maven) | `mvn dependency-check:check` |

### 4. Dependency Pinning
- Advise **pinning exact versions** in lockfiles (`package-lock.json`, `requirements.txt`, `Cargo.lock`, etc.).
- Warn against using unpinned ranges (e.g., `^1.0.0`, `>=1.0`) which can pull in compromised releases automatically.

### 5. Dependency File Review
When reviewing any dependency file (`requirements.txt`, `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Gemfile`, `pom.xml`, etc.), always:
- Check each listed package and version for known supply chain attacks.
- Flag packages that are **unmaintained or abandoned** with open vulnerabilities.
- Suggest safe alternatives or patched versions where applicable.

### Ecosystems Covered
Python · Node.js · Go · Rust · .NET / NuGet · Java (Maven/Gradle) · Ruby · PHP (Composer) · Swift · Dart/Flutter

---

## 📋 PROJECT CREATION & DEPLOYMENT — Documentation Requirements

Whenever you create a new project or handle a deployment task, you **MUST** produce three layers of documentation as described below.

### Phase 1 — Plan Document (`docs/PLAN.md`)

Before writing any code, create `docs/PLAN.md` in the project root. It must contain:

- **Project Overview**: One paragraph describing the purpose, goals, and scope.
- **Architecture Decision**: Chosen stack/framework with a brief rationale (e.g., "FastAPI chosen for async support over Flask").
- **Directory Structure**: Annotated tree of the planned folder layout.
- **Task Breakdown**: Ordered list of implementation steps with clear acceptance criteria for each.
- **Out of Scope**: Explicit list of features NOT being built in this iteration.
- **Open Questions**: Any unresolved design choices that need user confirmation.

> Do NOT start coding until `docs/PLAN.md` is written and, for ambiguous decisions, confirmed by the user.

---

### Phase 2 — Implementation Log (`docs/IMPLEMENTATION.md`)

While building the project, maintain `docs/IMPLEMENTATION.md` as a running log. Update it at each significant milestone. It must contain:

- **Environment Setup**: Prerequisites, language/runtime versions, and setup commands.
- **Dependency List**: Every added package, its version, and why it was chosen.
- **Key Design Decisions**: Any choice made during coding (e.g., schema design, auth strategy) with the reason.
- **Implementation Steps** (chronological):
  - Step number and title
  - Files created or modified
  - Commands run (exact, copy-pasteable)
  - Output or result observed
- **Known Issues / TODOs**: Bugs found but deferred, with suggested fixes.
- **Security Notes**: Any secrets, env variables, or sensitive config—how they are managed.

---

### Phase 3 — User Documentation (`docs/README.md` or root `README.md`)

Once the project is functional, produce the final user-facing `README.md`. It must contain:

#### Mandatory Sections
1. **Project Title & Badge Row** (build status, license, version if applicable)
2. **What It Does** — 2–4 sentence plain-language description
3. **Prerequisites** — OS, runtime version, required CLI tools
4. **Quick Start** — ≤5 commands to get from zero to running
5. **Installation** — Step-by-step with expected terminal output
6. **Configuration** — All environment variables / config files, their defaults, and valid values (use a table)
7. **Usage** — Common commands or API endpoints with examples
8. **Deployment** — Step-by-step guide covering:
   - Build/package steps
   - Target environment setup (cloud provider, server, container registry, etc.)
   - Deploy command(s)
   - Rollback procedure
   - Health-check / smoke-test after deploy
9. **Troubleshooting** — At least 3 common errors and their fixes
10. **Contributing** — How to run tests locally, branch strategy, PR checklist
11. **License**

---

### General Rules for All Documentation

- Write documentation **in the same language as the user's request** (French if asked in French, English otherwise).
- Use **fenced code blocks** with language identifiers for all commands and code samples.
- Documentation files go under `docs/` unless the project convention specifies otherwise; `README.md` always stays at the root.
- Keep documentation **in sync** with code changes — if you modify a command, a config key, or an endpoint, update the docs in the same commit.
- Never leave placeholder text like `TODO: fill this in` in delivered documentation.
