# Installing Matt Workflow for OpenCode

Add the git-backed package to `opencode.json`:

```json
{
  "plugin": [
    "matt-workflow@git+https://github.com/OlivierFortier/mattpocock-superpowers.git"
  ]
}
```

Restart OpenCode. The package registers the `matt_workflow_skill` tool. Use it
with a skill name such as `using-matt-workflow` to verify that the adapter and
root `skills/` directory were discovered.

From a shell, the same smoke test is:

```bash
opencode run --print-logs "Use the matt_workflow_skill tool to load using-matt-workflow."
```

For local development, point the package at this checkout:

```json
{
  "plugin": ["."]
}
```
