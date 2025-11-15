import { db } from './db';
import { users, notificationPreferences } from '../shared/schema';
import { sql } from 'drizzle-orm';

const CATEGORY_SUBCATEGORIES = {
  communications: ['all', 'messages', 'mentions'],
  marketplace: ['all', 'new_items', 'offers', 'transactions'],
  jobs: ['all', 'new_jobs', 'applications'],
  community: ['all', 'replies', 'mentions'],
  rentals: ['all', 'bookings', 'updates'],
  events: ['all', 'new_events', 'reminders', 'rsvp'],
};

async function backfillNotificationPreferences() {
  console.log('Starting notification preferences backfill...');

  try {
    // First, check existing preferences count
    const existingCount = await db.execute(sql`SELECT COUNT(*) as count FROM notification_preferences`);
    console.log(`Existing preferences: ${existingCount.rows[0].count}`);

    let totalInserted = 0;

    // Insert preferences for each category and its subcategories
    for (const [category, subcategories] of Object.entries(CATEGORY_SUBCATEGORIES)) {
      for (const subcategory of subcategories) {
        const result = await db.execute(sql`
          INSERT INTO notification_preferences (user_id, category, subcategory, in_app_enabled, email_enabled, email_frequency)
          SELECT 
            u.id,
            ${category},
            ${subcategory},
            1,       -- in_app_enabled (true by default)
            0,       -- email_enabled (false - opt-in)
            'digest' -- email_frequency (default to digest)
          FROM users u
          WHERE NOT EXISTS (
            SELECT 1 FROM notification_preferences np 
            WHERE np.user_id = u.id 
              AND np.category = ${category}
              AND np.subcategory = ${subcategory}
          )
        `);

        const inserted = result.rowCount || 0;
        if (inserted > 0) {
          console.log(`✅ Inserted ${inserted} preferences for ${category}/${subcategory}`);
          totalInserted += inserted;
        }
      }
    }

    console.log('\n✅ Notification preferences backfilled successfully!');
    console.log(`Total rows inserted: ${totalInserted}`);

    // Final count
    const finalCount = await db.execute(sql`SELECT COUNT(*) as count FROM notification_preferences`);
    console.log(`Final preferences count: ${finalCount.rows[0].count}`);
  } catch (error) {
    console.error('❌ Error backfilling notification preferences:', error);
    throw error;
  }
}

backfillNotificationPreferences()
  .then(() => {
    console.log('\nBackfill complete. Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
  });

export { backfillNotificationPreferences };
