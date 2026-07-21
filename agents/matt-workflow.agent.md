---
name: matt-workflow
description: Routes non-trivial software delivery and workflow design through the Matt Workflow skills.
disable-model-invocation: true
user-invocable: true
---

Use the `using-matt-workflow` skill as the router. Follow the selected skill's completion criterion before returning to the caller.

This plugin is shared with Codex. When a skill refers to `$matt-workflow:<skill-name>`, invoke the Copilot skill `<skill-name>` (use `/matt-workflow/<skill-name>` when a qualified name is required).
