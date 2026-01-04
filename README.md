# claude-statusline

A customizable statusline for Claude Code showing prompt snippet, git status, and model name.

**Cross-platform:** Works on macOS, Windows, and Linux.

## Preview

```
✎ Help me implement auth... │  main ±3 │ Opus-4.5
```

**Segments:**
- **Prompt snippet** (dimmed) - First 40 chars of your current prompt
- **Git status** (magenta) - Branch name and changed file count
- **Model name** (blue) - Shortened model name

## Installation

### 1. Enable the plugin

```bash
# Option A: Use --plugin-dir flag
claude --plugin-dir /path/to/claude-statusline

# Option B: Install to your plugins directory
cp -r claude-statusline ~/.claude/plugins/
```

### 2. Run setup

Once the plugin is enabled, run:

```
/claude-statusline:setup
```

This automatically configures your `~/.claude/settings.json`.

### 3. Restart Claude Code

The statusline will appear after restarting.

## Commands

| Command | Description |
|---------|-------------|
| `/claude-statusline:setup` | Install the statusline |
| `/claude-statusline:uninstall` | Remove the statusline |
| `/claude-statusline:preview` | Preview without installing |

## How It Works

The statusline uses a command-based approach:
1. Claude Code calls the statusline script with JSON context
2. The script reads workspace and model info from the JSON
3. It fetches git status (with 2-second caching for performance)
4. It reads the last prompt from a state file
5. It outputs ANSI-colored text for display

**Hooks:**
- `SessionStart` - Clears state files for a fresh start
- `UserPromptSubmit` - Captures your prompt for display

## Configuration

The statusline uses these defaults:
- **Git cache TTL:** 2 seconds
- **Prompt max length:** 40 characters
- **Colors:** Dim for prompt, magenta for git, dim blue for model

To customize, edit the constants at the top of `scripts/statusline.mjs`:

```javascript
const GIT_CACHE_TTL = 2000; // 2 seconds in ms
const PROMPT_MAX_LEN = 40;

// ANSI color codes
const DIM = '\x1b[2m';
const MAGENTA = '\x1b[35m';
const BLUE = '\x1b[34m';
```

## Uninstallation

```
/claude-statusline:uninstall
```

This removes all configuration from `settings.json` and deletes the state directory.

## Requirements

- Node.js (required for Claude Code)
- Git (for git status - optional)

## License

MIT
