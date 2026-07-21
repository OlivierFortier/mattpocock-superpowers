# AGENTS.md

## Project

This repository packages `matt-workflow`: a guided software-delivery plugin built from selected Matt Pocock skills and Superpowers worktree discipline. It is a packaging and adaptation project, not a product application.

Read `CONTEXT.md` before changing workflow language or domain concepts.

## Design principles

- Understand the real problem before editing. For work that is unclear or larger than a small settled change, clarify the decisions, write the spec, and split it into focused tickets before implementation.
- Prefer deep modules: keep interfaces small, hide complexity behind them, and place behavior at a clean seam. Use the repository vocabulary: module, interface, implementation, seam, adapter, depth, leverage, and locality.
- Do not add a seam for hypothetical variation. One adapter is usually enough reason not to generalize; introduce the seam when a second real adapter exists.
- Keep domain language precise. Update `CONTEXT.md` when the domain changes; do not turn it into an implementation spec.
- Use TDD for behavior changes: red, green, then refactor. Test through public interfaces and agreed seams, one vertical tracer-bullet slice at a time.
- Keep changes narrow. Delete unnecessary code, reuse existing patterns, and avoid speculative abstractions, dependencies, configuration, and documentation.

## Repository rules

- `skills/` contains generated, adapted upstream skills. Do not hand-edit those copies for durable changes; update the sync transformation or pinned upstream inputs, then regenerate and verify.
- Keep the plugin manifests and marketplace entries consistent across the supported targets. Make the smallest target-specific change needed.
- Preserve the pinned upstream revisions in `upstreams.lock.json`. Do not silently move pins.
- Use Node.js standard-library facilities and the existing ESM setup before adding a dependency.
- Preserve unrelated user changes. Do not reset, clean, or rewrite broad parts of the repository.

## Verification

Run the full check after changes:

```text
npm test
```

This validates the plugin structure and confirms vendored skills match the pinned upstreams. If a change affects only documentation, still inspect the diff and run the check when practical.

## Handoff

Report what changed, the verification run, and any remaining uncertainty. Do not commit, push, merge, or delete worktrees unless the user explicitly asks.
