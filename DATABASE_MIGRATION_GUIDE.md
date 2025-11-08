# SendGrid Integration - Database Migration Guide

## Overview
The SendGrid integration for professional email delivery requires adding two new columns to your `users` table in the external Neon database.

## Required Database Changes

You need to add the following columns to your `users` table:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR,
ADD COLUMN IF NOT EXISTS password_reset_expiry TIMESTAMP;
```

## How to Apply Changes

### Option 1: Using Neon Console (Recommended)
1. Go to your Neon dashboard: https://console.neon.tech
2. Select your project
3. Navigate to SQL Editor
4. Run the SQL command above
5. Click "Run" to execute

### Option 2: Using Database Client (pgAdmin, TablePlus, etc.)
1. Connect to your Neon database using your DATABASE_URL
2. Open a SQL query window
3. Paste and execute the SQL command above

### Option 3: Using psql CLI
```bash
psql "YOUR_DATABASE_URL" -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR, ADD COLUMN IF NOT EXISTS password_reset_expiry TIMESTAMP;"
```

## Verification

After running the migration, verify the columns were added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('password_reset_token', 'password_reset_expiry');
```

You should see both columns listed.

## What These Fields Do

- **password_reset_token**: Stores a secure UUID token when a user requests a password reset
- **password_reset_expiry**: Stores the timestamp when the reset token expires (1 hour from creation)

These fields enable the backend-driven password reset flow that sends professional emails via SendGrid with 99%+ inbox delivery rate.

## Troubleshooting

If you get permission errors:
- Ensure you're connected as the database owner
- Contact Neon support if you need elevated permissions

If the columns already exist:
- The `IF NOT EXISTS` clause will safely skip the addition
- No data will be lost
