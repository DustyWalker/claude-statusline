#!/usr/bin/env node
/**
 * Setup Script for claude-statusline
 *
 * Automatically configures Claude Code to use this statusline by:
 * 1. Reading/creating ~/.claude/settings.json
 * 2. Adding the statusLine configuration
 * 3. Adding the required hooks
 * 4. Creating the state directory
 *
 * Cross-platform: works on macOS, Windows, and Linux
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PLUGIN_DIR = dirname(__dirname);

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
 * Deep merge objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Main function
 */
function main() {
  console.log('Setting up claude-statusline...\n');

  // Ensure directories exist
  if (!existsSync(CLAUDE_DIR)) {
    mkdirSync(CLAUDE_DIR, { recursive: true });
    console.log('Created ~/.claude directory');
  }

  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true });
    console.log('Created ~/.claude/statusline-state directory');
  }

  // Read existing settings
  const settings = readJSON(SETTINGS_FILE);

  // Add statusLine configuration
  settings.statusLine = {
    type: 'command',
    command: `node "${join(PLUGIN_DIR, 'scripts', 'statusline.mjs')}"`
  };

  // Initialize hooks if not present
  if (!settings.hooks) {
    settings.hooks = {};
  }

  // Add SessionStart hook (clear state)
  const sessionStartHook = {
    hooks: [{
      type: 'command',
      command: `node "${join(PLUGIN_DIR, 'scripts', 'clear-state.mjs')}"`
    }]
  };

  if (!settings.hooks.SessionStart) {
    settings.hooks.SessionStart = [];
  }

  // Check if our hook already exists
  const hasSessionStartHook = settings.hooks.SessionStart.some(h =>
    h.hooks?.some(hh => hh.command?.includes('clear-state.mjs'))
  );

  if (!hasSessionStartHook) {
    settings.hooks.SessionStart.push(sessionStartHook);
  }

  // Add UserPromptSubmit hook (save prompt)
  const userPromptHook = {
    hooks: [{
      type: 'command',
      command: `node "${join(PLUGIN_DIR, 'scripts', 'save-prompt.mjs')}"`
    }]
  };

  if (!settings.hooks.UserPromptSubmit) {
    settings.hooks.UserPromptSubmit = [];
  }

  // Check if our hook already exists
  const hasUserPromptHook = settings.hooks.UserPromptSubmit.some(h =>
    h.hooks?.some(hh => hh.command?.includes('save-prompt.mjs'))
  );

  if (!hasUserPromptHook) {
    settings.hooks.UserPromptSubmit.push(userPromptHook);
  }

  // Write updated settings
  writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));

  console.log('\nConfiguration complete!\n');
  console.log('Added to ~/.claude/settings.json:');
  console.log('  - statusLine: command-based statusline');
  console.log('  - hooks.SessionStart: clear state on new session');
  console.log('  - hooks.UserPromptSubmit: capture prompts for display');
  console.log('\nRestart Claude Code to see your new statusline.');
}

main();
