---
name: using-matt-workflow
description: Route software delivery, huge or foggy planning, recurring workflow design, manual setup or migration procedures, and stakeholder questionnaires through the Matt Workflow skill set. Use at the start of non-trivial feature work or when the user asks which Matt Pocock workflow fits.
---

# Using Matt Workflow

Route before acting. State the chosen route and the next user gate, then use only the skills needed for that route.

## First response

Start with exactly these fields:

```text
Route: delivery | wayfinder | workflow-design | manual-wizard | questionnaire
Experimental capability: <name or none>
Next gate: <decision required>
Writes: <anticipated artifacts or none>
```

Do not write files, create issues, create a worktree, or implement until the relevant gate passes. In Plan Mode, keep all work read-only and present proposed artifact contents in chat.

## Route

Choose the smallest route that fits:

- **delivery** — A feature or concrete engineering change. If the repo lacks `docs/agents/issue-tracker.md`, first delegate to `$matt-workflow:setup-matt-pocock-skills`. Use `$matt-workflow:grill-with-docs` when decisions remain. Use `$matt-workflow:prototype`, `$matt-workflow:research`, or `$matt-workflow:handoff` only when they answer a real blocker. Send genuinely small, settled work to `$matt-workflow:implement`; otherwise require design approval, then use `$matt-workflow:to-spec`, require ticket approval, and use `$matt-workflow:to-tickets`.
- **wayfinder** — Only for work too large or foggy to hold in one session. Delegate to `$matt-workflow:wayfinder`. For a multi-step human Task ticket, offer the experimental manual-wizard route. Resolve decision tickets, then collapse the map through `$matt-workflow:to-spec`; do not build directly unless the effort became genuinely small.
- **workflow-design** — A recurring personal or operational activity. Announce that `$matt-workflow:loop-me` is experimental, obtain the experimental gate, and delegate to it. If the original request includes implementation, route its decision-complete workflow spec back into delivery or wayfinder; otherwise stop with the spec.
- **manual-wizard** — A human-operated setup, migration, credential, or third-party procedure. Announce that `$matt-workflow:wizard` is experimental, obtain the experimental gate, and delegate to it. Generate the Bash script in the OS temporary directory unless the user asks to retain it. Never execute the generated wizard automatically.
- **questionnaire** — The user cannot answer and an identifiable stakeholder can. Announce that `$matt-workflow:to-questionnaire` is experimental, obtain the experimental gate, and delegate to it. Record the active issue, decision, or spec as return context; pause and resume that same decision when answers arrive.

If multiple routes appear plausible and the choice materially changes the work, recommend the smallest one and ask one question.

## Load subflow instructions

After choosing a route and passing its gate, read only the required linked skill files before acting:

- Delivery: [setup](../setup-matt-pocock-skills/SKILL.md), [grill with docs](../grill-with-docs/SKILL.md), [grilling](../grilling/SKILL.md), [domain modeling](../domain-modeling/SKILL.md), [handoff](../handoff/SKILL.md), [prototype](../prototype/SKILL.md), [research](../research/SKILL.md), [to spec](../to-spec/SKILL.md), [to tickets](../to-tickets/SKILL.md), [implement](../implement/SKILL.md), [TDD](../tdd/SKILL.md), and [code review](../code-review/SKILL.md).
- Wayfinding: [wayfinder](../wayfinder/SKILL.md).
- Experimental: [batch grilling](../batch-grill-me/SKILL.md), [questionnaire](../to-questionnaire/SKILL.md), [wizard](../wizard/SKILL.md), and [loop design](../loop-me/SKILL.md). Read these only after approval.
- Git lifecycle: [worktrees](../using-git-worktrees/SKILL.md) and [finish branch](../finishing-a-development-branch/SKILL.md).

The component skills are explicit-only so they cannot bypass this router. Their relative references are the composition mechanism; do not ask the user to invoke each one manually.

## Interview cadence

Default to `$matt-workflow:grilling`, one question at a time. When at least two independent decision-frontier questions are ready now, offer experimental `$matt-workflow:batch-grill-me` and wait for one yes/no gate. An explicit request for batch grilling counts as approval. Never present this as a startup preference.

## Execute tickets

After ticket approval:

1. Delegate to `$matt-workflow:using-git-worktrees` once for the delivery run. Respect an existing isolated worktree and verify the baseline.
2. Work blockers first. Give each ready ticket to a fresh implementation subagent with only the ticket, approved spec, domain docs, and repository instructions.
3. Require the subagent to use `$matt-workflow:implement`, which drives `$matt-workflow:tdd` and commits its ticket.
4. Run `$matt-workflow:code-review` for specification compliance and code quality. Resolve findings before starting the next ticket.
5. After all tickets, run one whole-spec review and the full test suite.
6. Delegate to `$matt-workflow:finishing-a-development-branch` and wait for the user's branch-completion choice.

Run ticket subagents sequentially in the same feature worktree. Do not create persistent agent definitions or a workflow database.

## Workflow boundary

This is the only top-level router. Delegated skills must perform their subflow and return control here; they must not restart routing. Direct invocation of a component skill performs only that component skill.
