---
description: Remove claude-statusline from your Claude Code configuration
argument-hint: ""
allowed-tools:
  - Bash
---

# Uninstall claude-statusline

Run the uninstall script to remove this statusline from Claude Code.

The uninstall script will:
1. Remove the `statusLine` entry from `~/.claude/settings.json`
2. Remove the hooks added by this plugin
3. Delete the state directory at `~/.claude/statusline-state/`

## Instructions

Run the uninstall script using Node.js:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/uninstall.mjs"
```

After running, inform the user:
- The statusline configuration has been removed
- They need to restart Claude Code to apply the changes
- They can run `/claude-statusline:setup` to reinstall later
