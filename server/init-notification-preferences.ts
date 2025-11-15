import { db } from './db';
import { notificationPreferences } from '../shared/schema';

export const CATEGORY_SUBCATEGORIES = {
  communications: ['all', 'messages', 'mentions'],
  marketplace: ['all', 'new_items', 'offers', 'transactions'],
  jobs: ['all', 'new_jobs', 'applications'],
  community: ['all', 'replies', 'mentions'],
  rentals: ['all', 'bookings', 'updates'],
  events: ['all', 'new_events', 'reminders', 'rsvp'],
};

/**
 * Initialize all notification preferences for a user with sensible defaults.
 * Called automatically during user registration.
 */
export async function initializeUserNotificationPreferences(userId: string): Promise<void> {
  const preferencesToCreate = [];

  for (const [category, subcategories] of Object.entries(CATEGORY_SUBCATEGORIES)) {
    for (const subcategory of subcategories) {
      preferencesToCreate.push({
        userId,
        category,
        subcategory,
        inAppEnabled: 1, // All in-app notifications enabled by default
        emailEnabled: 0, // Email opt-in (disabled by default)
        emailFrequency: 'digest', // Daily digest if they enable email
      });
    }
  }

  // Batch insert all preferences
  if (preferencesToCreate.length > 0) {
    await db.insert(notificationPreferences).values(preferencesToCreate);
    console.log(`✅ Created ${preferencesToCreate.length} notification preferences for user ${userId}`);
  }
}
