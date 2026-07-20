---
name: loop-me
description: "Perform only the loop-me subflow when directly requested or delegated by Matt Workflow. Grill me about specs for the workflows I want to build, within this workspace."
---

Run a stateful `[$matt-workflow:grilling](../grilling/SKILL.md)` session whose only output is **workflow** specs. Use the grilling discipline — relentless, one question at a time, a recommended answer attached to each — aimed at the vocabulary and goal below. Create, edit, and delete specs as the grilling resolves things.

## The loop lens

A **loop** is a recurring pattern in the user's life: their career, their week, their morning, a single repeated activity. Picturing a life as loops within loops reveals how predictable its activities really are — which is what makes them worth **delegating**. Use the lens to find loops worth specifying, and propose ones the user hasn't noticed.

A **workflow** is the spec of one loop, made real. You run a workflow on a loop — the loop is its running instantiation. Workflows live in `workflows/*.md` and are the source of truth.

## Vocabulary

A shared language, reached for only when a workflow calls for it — never a checklist. **Mandate nothing structural**: a workflow needs no AI, no checkpoint, and no schedule unless the grilling shows it does.

- **Trigger** — what fires each run: an **event** (a new email, a new issue) or a **schedule** (every morning). Event-triggering is usually the more efficient.
- **Checkpoint** — a human-in-the-loop point where the user is asked to verify or decide. Some workflows have none and run autonomously; some use no AI at all.
- **Push right** — defer the checkpoint as far as it will go. Do maximal work before involving the human, so they are asked once, late, with everything prepared.
- **Brief** — what a checkpoint presents: a tight, decision-ready summary — what was produced, why, and a link down to the asset itself — never the raw output. The user reads a brief, not a draft. Speed of review is imperative.

## Definition of done

A workflow spec is done when an implementer agent could build it without asking a single question. Grill until then; nothing is done while a question remains.

## The workspace

- `workflows/*.md` — one spec per workflow.
- `NOTES.md` — raw notes on the user's world: the tools they use, the channels they process, and their own terminology for both. When it is empty or thin, interview them about their world before specifying anything. Sharpen fuzzy terms into canonical ones as they surface, and record them here.

> **Experimental:** This in-progress skill is pinned at `9603c1cc8118d08bc1b3bf34cf714f62178dea3b`. Before acting, require either the user's direct invocation of this skill or an explicit yes to the router's experimental gate. Otherwise announce the status, ask once for approval, and stop until the user answers.

## Matt Workflow boundary

Perform only the `$matt-workflow:loop-me` subflow, then return control to `$matt-workflow:using-matt-workflow`. Do not classify or restart the top-level workflow. Direct invocation performs only this subflow.
