/**
 * Deprecated code barrel - throws on import to prevent usage
 * Any imports from this directory should be migrated to new implementations
 */

throw new Error(
  'Imports from /deprecated directory are not allowed. ' +
  'This code has been deprecated and should be migrated to current implementations. ' +
  'Contact the development team for migration guidance.'
);

// Placeholder exports to prevent module resolution errors
export const __deprecated = true;