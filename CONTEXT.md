# Context

This project turns Matt Pocock’s software-delivery practices into a distributable workflow plugin. Its job is to help an agent move from an unclear request to a tested, reviewed, handoff-ready change while keeping the human’s decisions visible.

## Domain glossary

- **Request** — the user’s desired outcome, which may be concrete or still foggy.
- **Decision** — an unresolved product or engineering choice that blocks a confident next step.
- **Spec** — the decision-complete description of behavior, constraints, and acceptance conditions. It explains what must be true, not how files should be arranged.
- **Ticket** — one independently implementable vertical slice of a spec, with a clear outcome and verification.
- **Skill** — a focused, repeatable workflow for one subflow such as grilling, domain modeling, implementation, TDD, or review.
- **Router** — the workflow that selects the smallest appropriate skill sequence for the request.
- **Module** — a unit of behavior with an interface and an implementation.
- **Interface** — everything a caller must know to use a module correctly, including inputs, outputs, invariants, ordering, errors, and meaningful performance characteristics.
- **Seam** — the place where a module’s interface lives and behavior can be changed or observed without reaching into its implementation.
- **Adapter** — a concrete implementation that satisfies an interface at a seam.
- **Depth** — the leverage provided by a small interface that hides substantial behavior.
- **Tracer bullet** — the smallest end-to-end slice that proves the intended behavior and teaches us what the next slice needs.
- **Review** — a check for both specification compliance and unnecessary or incorrect behavior.

## Workflow shape

The normal progression is:

```text
request → decisions → spec → tickets → implementation → TDD → review → handoff
```

Small, settled requests may skip directly to implementation. Large or foggy efforts need their decisions made explicit before they are split into tickets. Each ticket should be small enough to understand, implement, test, and review as one coherent slice.

## Invariants

- Tests describe behavior through public interfaces and agreed seams; they do not prescribe implementation details.
- A spec and its tickets use the project’s domain vocabulary consistently.
- Complexity should live behind deep interfaces so callers and tests stay simple.
- A change is not complete merely because it compiles: its ticket is implemented, behavior is tested, and the result is reviewed against the spec.
- Experimental workflow paths are opt-in and must not silently become the default route.

## Out of scope

This file is a glossary and domain model. It is not a task scratchpad, implementation plan, generated-file policy, or substitute for a spec. Put repository mechanics in `AGENTS.md` and durable design decisions in a focused ADR only when the decision is worth preserving.
