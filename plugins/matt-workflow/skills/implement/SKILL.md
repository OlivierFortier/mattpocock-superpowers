---
name: implement
description: "Perform only the implement subflow when directly requested or delegated by Matt Workflow. Implement a piece of work based on a spec or set of tickets."
---

Implement the work described by the user in the spec or tickets.

Use [$matt-workflow:tdd](../tdd/SKILL.md) where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use [$matt-workflow:code-review](../code-review/SKILL.md) to review the work.

Commit your work to the current branch.

## Matt Workflow boundary

Perform only the `$matt-workflow:implement` subflow, then return control to `$matt-workflow:using-matt-workflow`. Do not classify or restart the top-level workflow. Direct invocation performs only this subflow.
