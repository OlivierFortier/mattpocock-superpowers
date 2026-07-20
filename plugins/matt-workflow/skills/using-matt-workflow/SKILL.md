---
name: using-matt-workflow
description: Route non-trivial software delivery, foggy initiatives, recurring workflow design, manual setup or migration, and stakeholder questionnaires. Use before acting when one branch fits or the user asks which Matt workflow to use.
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

Keep repository and external state unchanged until the relevant gate passes. In Plan Mode, keep all work read-only and present proposed artifact contents in chat.

## Route

Choose the smallest route that fits:

- **delivery** — A feature or concrete engineering change. If the repo lacks `docs/agents/issue-tracker.md`, first delegate to `$matt-workflow:setup-matt-pocock-skills`. Use `$matt-workflow:grill-with-docs` when decisions remain. Use `$matt-workflow:prototype`, `$matt-workflow:research`, or `$matt-workflow:handoff` only when they answer a real blocker. Send genuinely small, settled work to `$matt-workflow:implement`; otherwise require design approval, then use `$matt-workflow:to-spec`, require ticket approval, and use `$matt-workflow:to-tickets`.
- **wayfinder** — Only for work too large or foggy to hold in one session. Delegate to `$matt-workflow:wayfinder`. For a multi-step human Task ticket, offer the experimental manual-wizard route. Resolve decision tickets, then collapse the map through `$matt-workflow:to-spec`. Direct implementation is reserved for efforts proven genuinely small.
- **workflow-design** — A recurring personal or operational activity. Announce that `$matt-workflow:loop-me` is experimental, obtain the experimental gate, and delegate to it. If the original request includes implementation, route its decision-complete workflow spec back into delivery or wayfinder. When implementation is outside the original request, complete at the workflow spec.
- **manual-wizard** — A human-operated setup, migration, credential, or third-party procedure. Announce that `$matt-workflow:wizard` is experimental, obtain the experimental gate, and delegate to it. Generate the Bash script in the OS temporary directory unless the user asks to retain it. Return the path for human execution; automatic execution is forbidden.
- **questionnaire** — The user cannot answer and an identifiable stakeholder can. Announce that `$matt-workflow:to-questionnaire` is experimental, obtain the experimental gate, and delegate to it. Record the active issue, decision, or spec as return context; pause and resume that same decision when answers arrive.

If multiple routes appear plausible and the choice materially changes the work, recommend the smallest one and ask one question.

## Load subflow instructions

After choosing a route and passing its gate, read the linked skill files required by that branch before acting:

- Delivery: [setup](../setup-matt-pocock-skills/SKILL.md), [grill with docs](../grill-with-docs/SKILL.md), [grilling](../grilling/SKILL.md), [domain modeling](../domain-modeling/SKILL.md), [handoff](../handoff/SKILL.md), [prototype](../prototype/SKILL.md), [research](../research/SKILL.md), [to spec](../to-spec/SKILL.md), [to tickets](../to-tickets/SKILL.md), [implement](../implement/SKILL.md), [TDD](../tdd/SKILL.md), and [code review](../code-review/SKILL.md).
- Wayfinding: [wayfinder](../wayfinder/SKILL.md).
- Experimental: [batch grilling](../batch-grill-me/SKILL.md), [questionnaire](../to-questionnaire/SKILL.md), [wizard](../wizard/SKILL.md), and [loop design](../loop-me/SKILL.md). Read these only after approval.
- Git lifecycle: [worktrees](../using-git-worktrees/SKILL.md) and [finish branch](../finishing-a-development-branch/SKILL.md).

Only `using-matt-workflow` is implicit. Compose a route by reading relative references after their gates, then continue without asking the user to invoke each component.

## Interview cadence

Default to `$matt-workflow:grilling`, one question at a time. When at least two independent decision-frontier questions are ready now, offer experimental `$matt-workflow:batch-grill-me` and wait for one yes/no gate. An explicit request for batch grilling counts as approval. Offer batch mode only when that threshold is met.

## Execute tickets

After ticket approval:

1. Delegate to `$matt-workflow:using-git-worktrees` once for the delivery run. Respect an existing isolated worktree and verify the baseline.
2. Work blockers first. Give each ready ticket to a fresh implementation subagent with only the ticket, approved spec, domain docs, and repository instructions.
3. Require the subagent to use `$matt-workflow:implement`, which drives `$matt-workflow:tdd` and commits its ticket.
4. Run `$matt-workflow:code-review` for specification compliance and code quality. Resolve findings before starting the next ticket.
5. After all tickets, run one whole-spec review and the full test suite.
6. Delegate to `$matt-workflow:finishing-a-development-branch` and wait for the user's branch-completion choice.

Run ephemeral ticket subagents sequentially in the same feature worktree. Keep durable state in approved specs, issue tickets, and commits.

## Completion criteria

- **delivery:** Every approved ticket is committed; ticket reviews are resolved; the full test suite and whole-spec review pass; branch-completion choices are presented.
- **wayfinder:** Decision and prototype tickets no longer block a coherent map, and the map has collapsed through `$matt-workflow:to-spec`.
- **workflow-design:** `workflows/<slug>.md` and `NOTES.md` contain a decision-complete workflow; the original implementation intent determines whether delivery follows.
- **manual-wizard:** `bash -n` accepts the generated script, and the user receives its path and human-run instructions.
- **questionnaire:** Every question is answerable by the named stakeholder, the return context names the exact unresolved decision, and the workflow pauses there.

`using-matt-workflow` owns route classification. Run each loaded component to its completion criterion, return here at the named gate, and continue the selected route. A direct component call completes only that component.
