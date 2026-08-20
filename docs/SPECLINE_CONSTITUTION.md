# SpecLine - AI Development Constitution & Sprint Guidelines

> **MANDATORY DIRECTIVE FOR ALL AIs (ANTIGRAVITY, GEMINI, CLAUDE, GPT) AND DEVELOPERS**
> This document establishes the inviolable rules for test-driven development (TDD), sprint execution, and quality assurance for the SpecLine project.

## 1. Immutable Testing Constitution (Clean Room TDD)

The SpecLine project operates under a strict Test-Driven Development (TDD) philosophy, adapted for the Ruby on Rails ecosystem (Minitest).

- **Immutable Architecture Contracts:** Any test file created in the `test/` folder is an **Immutable Architecture Contract**. Once created and validated (even as a failing test), it **MUST NEVER BE DELETED OR REMOVED TO FORCE A PASS**.
- **Direction of Correction:** If a test fails, the source code (`app/`) is incorrect or incomplete. **The code must evolve to satisfy the contract. The contract must never be loosened to accommodate the code.**
- **Evolution by Addition (Non-Modification):** When introducing new behaviors or handling unforeseen edge cases, new granular test files must be created in `test/`. Do not comment out, delete, or neutralize old assertions.

## 2. Sprint Lifecycle Workflow

Execution must strictly follow the workflow phases:

1. **Sprint Planning & Goal Validation:** The AI and the user explicitly align on goals, use cases, and scope before any code is modified.
2. **Analysis & Clean Room TDD Setup:** Mapping of involved files and immediate creation of contracts in the `test/` folder. No functional code in `app/` should be written before tests are declared.
3. **Execution & Fulfillment:** Implement the safe source code modifications in `app/` so that the tests pass.
4. **Linting, Review & Lint Auto-Fix:** Code must comply with the Rubocop standard (`bundle exec rubocop -A`).
5. **Report & Tracking:** All progress must be documented by updating `docs/SPRINTS.md` and creating a corresponding report (e.g., `docs/sprint_N_report.md`).

## 3. Security & Robustness (Default-Secure)

- Injection sanitization (SQL Injection, Path Traversal) must be actively handled by Rails internal validations and Active Record parameterized queries (`where(id: params[:id])`).
- Request parameters must be strictly filtered by *Strong Parameters* in controllers.

## 4. Feature Traceability

When adding future features (e.g., Google OAuth, Cloudflare R2), any button or route that is not yet finished must, at a minimum, display a clear visual alert (e.g., `alert('Feature in development');`) to prevent empty UX loops, even before complete implementation. All pending features must have a corresponding "Issue" or annotation in the Sprint tracking.
