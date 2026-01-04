#!/usr/bin/env node
/**
 * Uninstall Script for claude-statusline
 *
 * Removes the statusline configuration from Claude Code by:
 * 1. Removing the statusLine entry from settings.json
 * 2. Removing the hooks added by this plugin
 * 3. Optionally cleaning up the state directory
 *
 * Cross-platform: works on macOS, Windows, and Linux
 */

import { readFileSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CLAUDE_DIR = join(homedir(), '.claude');
const SETTINGS_FILE = join(CLAUDE_DIR, 'settings.json');
const STATE_DIR = join(CLAUDE_DIR, 'statusline-state');

/**
 * Read JSON file safely
 */
function readJSON(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * Main function
 */
function main() {
  console.log('Uninstalling claude-statusline...\n');

  if (!existsSync(SETTINGS_FILE)) {
    console.log('No settings.json found. Nothing to uninstall.');
    return;
  }

  const settings = readJSON(SETTINGS_FILE);
  let modified = false;

  // Remove statusLine if it references our script
  if (settings.statusLine?.command?.includes('statusline.mjs')) {
    delete settings.statusLine;
    console.log('Removed statusLine configuration');
    modified = true;
  }

  // Remove SessionStart hooks that reference our script
  if (settings.hooks?.SessionStart) {
    const original = settings.hooks.SessionStart.length;
    settings.hooks.SessionStart = settings.hooks.SessionStart.filter(h =>
      !h.hooks?.some(hh => hh.command?.includes('clear-state.mjs'))
    );
    if (settings.hooks.SessionStart.length < original) {
      console.log('Removed SessionStart hook');
      modified = true;
    }
    if (settings.hooks.SessionStart.length === 0) {
      delete settings.hooks.SessionStart;
    }
  }

  // Remove UserPromptSubmit hooks that reference our script
  if (settings.hooks?.UserPromptSubmit) {
    const original = settings.hooks.UserPromptSubmit.length;
    settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit.filter(h =>
      !h.hooks?.some(hh => hh.command?.includes('save-prompt.mjs'))
    );
    if (settings.hooks.UserPromptSubmit.length < original) {
      console.log('Removed UserPromptSubmit hook');
      modified = true;
    }
    if (settings.hooks.UserPromptSubmit.length === 0) {
      delete settings.hooks.UserPromptSubmit;
    }
  }

  // Clean up empty hooks object
  if (settings.hooks && Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }

  // Write updated settings
  if (modified) {
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    console.log('\nUpdated ~/.claude/settings.json');
  } else {
    console.log('No statusline configuration found to remove.');
  }

  // Clean up state directory
  if (existsSync(STATE_DIR)) {
    try {
      rmSync(STATE_DIR, { recursive: true });
      console.log('Removed ~/.claude/statusline-state directory');
    } catch {
      console.log('Could not remove state directory (may be in use)');
    }
  }

  console.log('\nUninstall complete. Restart Claude Code to apply changes.');
}

main();
