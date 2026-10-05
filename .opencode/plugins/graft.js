// graft OpenCode V2 plugin
// Reminds agents to use graft context (graft ask/grep/callers/map) before
// expensive shell operations, once per session, when the repo has a graft index.
import { Plugin } from "@opencode/plugin";
import { existsSync } from "fs";
import { join } from "path";

// Single-quoted echo payload: backticks and double quotes inside stay literal
// (no shell command substitution), so the examples render as text.
const REMINDER =
  'echo \'[graft] Code graph at graft/. For context: `graft ask "<question>" --source` (ranked retrieval with code), `graft grep "<pattern>"` (exhaustive symbol search), `graft callers <symbol>` (dependency trace), or `graft map` (repo overview). All cost nothing and need no API key. Read the graft skill for full guidance.\' && ';

export default Plugin.define({
  id: "graft",
  async setup(ctx) {
    let reminded = false;
    const root = ctx.location.project?.directory ?? ctx.location.directory;
    const graph = join(root, "graft", ".graph", "wiring.json");

    await ctx.tool.hook("execute.before", (event) => {
      if (reminded) return;
      if (!existsSync(graph)) return;
      if (event.tool !== "shell" && event.tool !== "bash") return;

      const input = event.input;
      if (!input || typeof input.command !== "string") return;

      // Rewrite the command to lead with the reminder echo, exactly once.
      input.command = REMINDER + input.command;
      reminded = true;
    });
  },
});