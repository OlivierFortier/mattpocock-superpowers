---
name: grill-with-docs
description: "Perform only the grill-with-docs subflow when directly requested or delegated by Matt Workflow. A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go."
---

Run a `[$matt-workflow:grilling](../grilling/SKILL.md)` session, using the `[$matt-workflow:domain-modeling](../domain-modeling/SKILL.md)` skill.

## Matt Workflow boundary

Perform only the `$matt-workflow:grill-with-docs` subflow, then return control to `$matt-workflow:using-matt-workflow`. Do not classify or restart the top-level workflow. Direct invocation performs only this subflow.
