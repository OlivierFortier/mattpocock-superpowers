---
name: handoff
description: "Perform only the handoff subflow when directly requested or delegated by Matt Workflow. Compact the current conversation into a handoff document for another agent to pick up."
---

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the temporary directory of the user's OS - not the current workspace.

Include a "suggested skills" section in the document, which suggests skills that the agent should invoke.

Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.

## Matt Workflow boundary

Perform only the `$matt-workflow:handoff` subflow, then return control to `$matt-workflow:using-matt-workflow`. Do not classify or restart the top-level workflow. Direct invocation performs only this subflow.
