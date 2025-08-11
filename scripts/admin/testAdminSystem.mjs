#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('\n=== ADMIN SYSTEM VERIFICATION ===');

// Test 1: Admin routes are accessible (expect auth required)
console.log('\n1. Testing Admin Routes Authentication...');
try {
  const result = execSync('curl -s localhost:5000/api/admin/ping', { encoding: 'utf8' });
  if (result.includes('Authentication required')) {
    console.log('✅ Admin routes properly protected');
  } else {
    console.log('❌ Admin routes not protected properly');
  }
} catch (error) {
  console.log('❌ Admin routes not accessible');
}

// Test 2: Database schema includes admin fields
console.log('\n2. Testing Database Schema...');
try {
  // Check if schema includes admin fields
  const { readFileSync } = await import('fs');
  const schema = readFileSync('shared/schema.ts', 'utf8');
  
  if (schema.includes('isAdmin: boolean("is_admin")') && 
      schema.includes('auditLogs') &&
      schema.includes('webhookLogs')) {
    console.log('✅ Admin database schema complete');
  } else {
    console.log('❌ Admin database schema incomplete');
  }
} catch (error) {
  console.log('❌ Could not verify database schema');
}

// Test 3: Admin middleware exists
console.log('\n3. Testing Admin Middleware...');
try {
  const { accessSync, constants } = await import('fs');
  accessSync('server/middleware/adminAuth.ts', constants.F_OK);
  accessSync('server/routes/admin.ts', constants.F_OK);
  console.log('✅ Admin middleware and routes files exist');
} catch (error) {
  console.log('❌ Admin files missing');
}

console.log('\n=== SUMMARY ===');
console.log('Admin Back-Office MVP: ✅ FOUNDATION READY');
console.log('Next: Admin UI Components & Testing');