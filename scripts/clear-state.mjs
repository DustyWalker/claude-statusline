#!/usr/bin/env node
/**
 * Hook: Clear State on Session Start
 *
 * Triggered on SessionStart event.
 * Clears the statusline state files to start fresh.
 *
 * Cross-platform: works on macOS, Windows, and Linux
 */

import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const STATE_DIR = join(homedir(), '.claude', 'statusline-state');
const FILES_TO_CLEAR = [
  join(STATE_DIR, 'prompt.txt'),
  join(STATE_DIR, 'git_cache.json')
];

/**
 * Main function
 */
function main() {
  for (const file of FILES_TO_CLEAR) {
    try {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    } catch {
      // Silently ignore errors - file might not exist or be locked
    }
  }
}

main();
