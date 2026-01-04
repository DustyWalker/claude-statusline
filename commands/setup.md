---
description: Install the claude-statusline to your Claude Code configuration
argument-hint: ""
allowed-tools:
  - Bash
---

# Setup claude-statusline

Run the setup script to automatically configure Claude Code with this statusline.

The setup script will:
1. Create `~/.claude/settings.json` if it doesn't exist
2. Add the `statusLine` configuration pointing to this plugin
3. Add hooks for `SessionStart` (clear state) and `UserPromptSubmit` (save prompt)
4. Create the state directory at `~/.claude/statusline-state/`

## Instructions

Run the setup script using Node.js:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/setup.mjs"
```

After running, inform the user:
- The statusline has been configured
- They need to restart Claude Code to see the changes
- They can run `/claude-statusline:uninstall` to remove it later
