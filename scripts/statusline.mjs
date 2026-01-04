#!/usr/bin/env node
/**
 * Claude Code Statusline Renderer
 *
 * Reads JSON context from stdin and outputs a formatted statusline with:
 * - Prompt snippet (what you're working on)
 * - Git status (branch + changed file count)
 * - Model name (shortened)
 *
 * Cross-platform: works on macOS, Windows, and Linux
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Configuration
const STATE_DIR = join(homedir(), '.claude', 'statusline-state');
const GIT_CACHE_FILE = join(STATE_DIR, 'git_cache.json');
const PROMPT_FILE = join(STATE_DIR, 'prompt.txt');
const GIT_CACHE_TTL = 2000; // 2 seconds in ms
const PROMPT_MAX_LEN = 40;

// ANSI color codes (work on all modern terminals)
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const MAGENTA = '\x1b[35m';
const BLUE = '\x1b[34m';

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
 * Get value from nested object path
 */
function getValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj) ?? '';
}

/**
 * Get git status with caching
 */
function getGitStatus(workspace) {
  if (!workspace || !existsSync(workspace)) {
    return '';
  }

  // Ensure state directory exists
  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true });
  }

  // Check cache
  if (existsSync(GIT_CACHE_FILE)) {
    try {
      const cache = JSON.parse(readFileSync(GIT_CACHE_FILE, 'utf8'));
      const entry = cache[workspace];
      if (entry && Date.now() - entry.time < GIT_CACHE_TTL) {
        return entry.status;
      }
    } catch {
      // Cache read failed, continue to get fresh status
    }
  }

  // Get fresh git status
  let gitStatus = '';
  try {
    // Check if in git repo
    execSync('git rev-parse --is-inside-work-tree', {
      cwd: workspace,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8'
    });

    // Get branch name
    let branch = '';
    try {
      branch = execSync('git branch --show-current', {
        cwd: workspace,
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf8'
      }).trim();
    } catch {
      // Fallback to short HEAD
      try {
        branch = execSync('git rev-parse --short HEAD', {
          cwd: workspace,
          stdio: ['pipe', 'pipe', 'pipe'],
          encoding: 'utf8'
        }).trim() || 'detached';
      } catch {
        branch = 'detached';
      }
    }

    // Count changed files
    let changed = 0;
    try {
      const porcelain = execSync('git status --porcelain', {
        cwd: workspace,
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf8'
      });
      changed = porcelain.split('\n').filter(line => line.trim()).length;
    } catch {
      // Ignore errors
    }

    // Format status
    if (changed > 0) {
      gitStatus = ` ${branch} ±${changed}`;
    } else {
      gitStatus = ` ${branch}`;
    }

    // Update cache
    try {
      let cache = {};
      if (existsSync(GIT_CACHE_FILE)) {
        cache = JSON.parse(readFileSync(GIT_CACHE_FILE, 'utf8'));
      }
      cache[workspace] = { status: gitStatus, time: Date.now() };
      writeFileSync(GIT_CACHE_FILE, JSON.stringify(cache, null, 2));
    } catch {
      // Cache write failed, continue anyway
    }
  } catch {
    // Not a git repo or git not available
    return '';
  }

  return gitStatus;
}

/**
 * Get prompt snippet from state file
 */
function getPromptSnippet() {
  if (!existsSync(PROMPT_FILE)) {
    return '';
  }

  try {
    let prompt = readFileSync(PROMPT_FILE, 'utf8')
      .split('\n')[0]  // First line only
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();

    if (prompt.length > PROMPT_MAX_LEN) {
      prompt = prompt.slice(0, PROMPT_MAX_LEN) + '…';
    }

    return prompt;
  } catch {
    return '';
  }
}

/**
 * Shorten model name for display
 */
function shortenModelName(model) {
  if (!model) return '';
  return model
    .replace('Claude ', '')
    .replace(/ /g, '-');
}

/**
 * Main function
 */
function main() {
  const input = parseJSON(readStdin());

  const model = getValue(input, 'model.display_name');
  const workspace = getValue(input, 'workspace.current_dir');

  const segments = [];

  // Prompt snippet segment
  const prompt = getPromptSnippet();
  if (prompt) {
    segments.push(`${DIM}✎ ${prompt}${RESET}`);
  }

  // Git segment
  const gitStatus = getGitStatus(workspace);
  if (gitStatus) {
    segments.push(`${MAGENTA}${gitStatus}${RESET}`);
  }

  // Model segment
  if (model && model !== 'null') {
    const shortModel = shortenModelName(model);
    segments.push(`${DIM}${BLUE}${shortModel}${RESET}`);
  }

  // Output joined segments
  console.log(segments.join(' │ '));
}

main();
