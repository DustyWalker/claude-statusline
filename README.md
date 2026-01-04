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

This is a **local plugin** (not a marketplace plugin). Use one of these methods:

### Method A: Using --plugin-dir (Recommended)

1. **Clone the repo:**
   ```bash
   git clone https://github.com/DustyWalker/claude-statusline.git ~/.claude/plugins/claude-statusline
   ```

2. **Start Claude Code with the plugin:**
   ```bash
   claude --plugin-dir ~/.claude/plugins/claude-statusline
   ```

3. **Run setup inside Claude Code:**
   ```
   /claude-statusline:setup
   ```

4. **Restart Claude Code normally:**
   ```bash
   claude
   ```

The statusline will appear after restart.

### Method B: Using a Local Marketplace

If you prefer using `/plugin install`:

1. **Create a local marketplace:**
   ```bash
   mkdir -p ~/claude-marketplaces/dustywalker/.claude-plugin

   cat > ~/claude-marketplaces/dustywalker/.claude-plugin/marketplace.json <<'JSON'
   {
     "name": "dustywalker",
     "owner": { "name": "DustyWalker" },
     "plugins": [
       {
         "name": "claude-statusline",
         "source": { "source": "github", "repo": "DustyWalker/claude-statusline" },
         "description": "Statusline showing prompt, git status, and model"
       }
     ]
   }
   JSON
   ```

2. **In Claude Code:**
   ```
   /plugin marketplace add ~/claude-marketplaces/dustywalker
   /plugin install claude-statusline@dustywalker
   ```

3. **Restart Claude Code.**

### Troubleshooting

- **Command not found?** Requires Claude Code >= 1.0.33
- **Plugin not appearing?** Clear cache: `rm -rf ~/.claude/plugins/cache`

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

## Plugin Structure

```
claude-statusline/
├── .claude-plugin/
│   └── plugin.json        # Plugin manifest
├── commands/
│   ├── setup.md           # /claude-statusline:setup
│   ├── uninstall.md       # /claude-statusline:uninstall
│   └── preview.md         # /claude-statusline:preview
├── hooks/
│   └── hooks.json         # SessionStart + UserPromptSubmit hooks
├── scripts/
│   ├── statusline.mjs     # Main statusline renderer
│   ├── setup.mjs          # Auto-configure settings.json
│   ├── uninstall.mjs      # Remove configuration
│   ├── save-prompt.mjs    # Capture prompts (hook)
│   └── clear-state.mjs    # Clear state (hook)
├── README.md
└── .gitignore
```

## Requirements

- Node.js (required for Claude Code)
- Git (for git status - optional)

## License

MIT
