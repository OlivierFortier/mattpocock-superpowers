import { type Plugin, tool } from "@opencode-ai/plugin";
import { discoverSkillNames, loadSkill } from "./skill-loader.mjs";

const MattWorkflowPlugin: Plugin = async () => {
  const names = await discoverSkillNames();

  return {
    tool: {
      matt_workflow_skill: tool({
        description: `Load a Matt workflow skill by name. Valid names: ${names.join(", ")}`,
        args: { name: tool.schema.string() },
        async execute({ name }: { name: string }) {
          return loadSkill(name);
        },
      }),
    },
  };
};

export default MattWorkflowPlugin;
