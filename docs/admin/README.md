## Grant admin
UPDATE users SET is_admin = true WHERE email = 'you@yourdomain.com';

## Notes
- All /api/admin/* are protected by auth + adminOnly.
- Actions write to audit_logs; review regularly.