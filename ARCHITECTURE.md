# ARCHITECTURE.md

## Purpose
This document tracks the project's structural decisions, architectural boundaries, extension points, and rules for future growth.

## Preferred Layers
- core/domain
- application
- infrastructure
- features
- ui

## Architecture Rules
- Business logic should not live in infrastructure.
- Business logic should not be mixed directly into UI unless trivial and purely presentational.
- Features should remain loosely coupled.
- Shared behaviors should use abstractions, interfaces, events, or services when appropriate.
- New extension points should be documented here.
- Refactors are allowed when they improve scalability, clarity, and future maintainability.

## Change Review Checklist
Before major changes, review:
- affected modules
- coupling risks
- duplication risks
- future extensibility
- whether a light refactor is justified

## Extension Points
- Document reusable services here
- Document shared interfaces/contracts here
- Document plugin/hooks/event-based expansion here

## Notes
Add brief notes here whenever a major architectural decision is introduced.
