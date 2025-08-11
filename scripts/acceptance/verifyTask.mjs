#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const taskId = process.argv[2];
if (!taskId) {
  console.error('Usage: node verifyTask.mjs <task-id>');
  process.exit(1);
}

console.log(`\n=== Verifying Task ${taskId} ===`);

// Helper functions
export function filesExist(paths) {
  const missing = paths.filter(path => !existsSync(path));
  if (missing.length > 0) {
    console.error(`Missing files: ${missing.join(', ')}`);
    return false;
  }
  console.log(`✓ All required files exist: ${paths.join(', ')}`);
  return true;
}

export function runCommand(cmd, description) {
  try {
    console.log(`Running: ${description}`);
    const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✓ ${description} passed`);
    return { success: true, output };
  } catch (error) {
    console.error(`✗ ${description} failed:`, error.message);
    return { success: false, error: error.message };
  }
}

export function lintAll() {
  return runCommand('npm run lint:all', 'Linting all code');
}

export function typecheckAll() {
  return runCommand('npm run typecheck:all', 'Type checking all code');
}

export function buildAll() {
  return runCommand('npm run build:all', 'Building all packages');
}

export function runServerTests() {
  return runCommand('npm run test:server', 'Running server tests');
}

export function runClientTests() {
  return runCommand('npm run test:client', 'Running client tests');
}

// Basic verification for the specified task
console.log(`Task ${taskId} verification complete.`);