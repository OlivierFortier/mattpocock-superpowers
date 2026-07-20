---
name: grilling
description: "Perform only the grilling subflow when directly requested or delegated by Matt Workflow. Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases."
---

Interview me relentlessly about every aspect of this until we reach a shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering.

If a *fact* can be found by exploring the environment (filesystem, tools, etc.), look it up rather than asking me. The *decisions*, though, are mine — put each one to me and wait for my answer.

Do not act on it until I confirm we have reached a shared understanding.

## Matt Workflow boundary

Perform only the `$matt-workflow:grilling` subflow, then return control to `$matt-workflow:using-matt-workflow`. Do not classify or restart the top-level workflow. Direct invocation performs only this subflow.
