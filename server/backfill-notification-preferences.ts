import { db } from './db';
import { users, notificationPreferences } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function backfillNotificationPreferences() {
  console.log('Starting notification preferences backfill...');

  try {
    // First, check existing preferences count
    const existingCount = await db.execute(sql`SELECT COUNT(*) as count FROM notification_preferences`);
    console.log(`Existing preferences: ${existingCount.rows[0].count}`);

    const result = await db.execute(sql`
      INSERT INTO notification_preferences (user_id, category, subcategory, in_app_enabled, email_enabled, email_frequency)
      SELECT 
        u.id,
        category,
        'all',   -- subcategory (default to 'all' for broad preferences)
        1,       -- in_app_enabled (true)
        0,       -- email_enabled (false - opt-in)
        'digest' -- email_frequency (default to digest)
      FROM users u
      CROSS JOIN (
        VALUES 
          ('communications'),
          ('marketplace'),
          ('jobs'),
          ('community'),
          ('rentals'),
          ('events')
      ) AS categories(category)
      WHERE NOT EXISTS (
        SELECT 1 FROM notification_preferences np 
        WHERE np.user_id = u.id AND np.category = categories.category AND np.subcategory = 'all'
      )
    `);

    console.log('✅ Notification preferences backfilled successfully!');
    console.log(`Rows inserted: ${result.rowCount || 0}`);
  } catch (error) {
    console.error('❌ Error backfilling notification preferences:', error);
    throw error;
  }
}

backfillNotificationPreferences()
  .then(() => {
    console.log('Backfill complete. Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
  });

export { backfillNotificationPreferences };
