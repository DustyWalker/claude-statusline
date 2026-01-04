#!/usr/bin/env node
/**
 * Hook: Save User Prompt
 *
 * Triggered on UserPromptSubmit event.
 * Reads hook JSON from stdin and saves the prompt to state file
 * for display in the statusline.
 *
 * Cross-platform: works on macOS, Windows, and Linux
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const STATE_DIR = join(homedir(), '.claude', 'statusline-state');
const PROMPT_FILE = join(STATE_DIR, 'prompt.txt');

/**
 * Read all stdin synchronously
 */
function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '{}';
  }
}

/**
 * Parse JSON safely
 */
function parseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

/**
 * Main function
 */
function main() {
  const input = parseJSON(readStdin());
  const prompt = input.prompt;

  if (!prompt) {
    return;
  }

  // Ensure state directory exists
  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true });
  }

  // Save prompt to state file
  try {
    writeFileSync(PROMPT_FILE, prompt, 'utf8');
  } catch {
    // Silently fail - statusline will just not show prompt
  }
}

main();
