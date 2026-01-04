---
description: Preview what the statusline looks like without installing
argument-hint: ""
allowed-tools:
  - Bash
---

# Preview claude-statusline

Show a preview of what the statusline will look like.

This runs the statusline script with sample data to demonstrate the output format.

## Instructions

Run this command to show a preview:

```bash
echo '{"model":{"display_name":"Claude Opus 4.5"},"workspace":{"current_dir":"'"$(pwd)"'"}}' | node "${CLAUDE_PLUGIN_ROOT}/scripts/statusline.mjs"
```

Explain to the user what each segment shows:
1. **Prompt snippet** (dimmed, ✎ icon) - First 40 chars of your last prompt
2. **Git status** (magenta,  icon) - Current branch and changed file count (±N)
3. **Model name** (dimmed blue) - Shortened model name (e.g., "Opus-4.5")

Note: The prompt snippet may be empty in the preview since no prompt has been captured yet. After installation, it will show your most recent prompt.
