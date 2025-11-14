import { db } from './db';
import { notifications, notificationPreferences, userCategoryInterests, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { NOTIFICATION_CONFIG, NOTIFICATION_CATEGORIES } from './notification-types';
import type { InsertNotification } from '@shared/schema';

interface CreateNotificationParams {
  userId: string;
  type: string;
  entityId?: string;
  actorId?: string;
  payload?: Record<string, any>;
  categoryValue?: string;
}

export class NotificationHelper {
  async createSmartNotification(params: CreateNotificationParams): Promise<void> {
    const { userId, type, entityId, actorId, payload = {}, categoryValue } = params;
    
    const config = NOTIFICATION_CONFIG[type];
    if (!config) {
      console.warn(`Unknown notification type: ${type}`);
      return;
    }

    const shouldCreate = await this.shouldCreateNotification(
      userId,
      config.category,
      type,
      config.requiresInterest,
      categoryValue
    );

    if (!shouldCreate) {
      return;
    }

    const notification: InsertNotification = {
      userId,
      type,
      category: config.category,
      priority: config.priority,
      entityId,
      actorId,
      payload,
    };

    await db.insert(notifications).values(notification);
  }

  async notifyInterestedUsers(params: {
    type: string;
    categoryType: string;
    categoryValue: string;
    entityId?: string;
    actorId?: string;
    payload?: Record<string, any>;
    excludeUserId?: string;
  }): Promise<void> {
    const { type, categoryType, categoryValue, entityId, actorId, payload = {}, excludeUserId } = params;

    const config = NOTIFICATION_CONFIG[type];
    if (!config || !config.requiresInterest) {
      console.warn(`Type ${type} does not support interest-based notifications`);
      return;
    }

    let interestedUsersQuery = db
      .select({ userId: userCategoryInterests.userId })
      .from(userCategoryInterests)
      .where(
        and(
          eq(userCategoryInterests.categoryType, categoryType),
          eq(userCategoryInterests.categoryValue, categoryValue)
        )
      );

    const interestedUsers = await interestedUsersQuery;

    for (const user of interestedUsers) {
      if (excludeUserId && user.userId === excludeUserId) {
        continue;
      }

      await this.createSmartNotification({
        userId: user.userId,
        type,
        entityId,
        actorId,
        payload: {
          ...payload,
          categoryType,
          categoryValue,
        },
        categoryValue,
      });
    }
  }

  private async shouldCreateNotification(
    userId: string,
    category: string,
    subcategory: string,
    requiresInterest: boolean,
    categoryValue?: string
  ): Promise<boolean> {
    const preferences = await db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.category, category),
          eq(notificationPreferences.subcategory, subcategory)
        )
      )
      .limit(1);

    if (preferences.length > 0) {
      const pref = preferences[0];
      return pref.inAppEnabled === 1;
    }

    const config = NOTIFICATION_CONFIG[subcategory];
    if (!config) {
      return true;
    }

    if (config.defaultEnabled === false) {
      return false;
    }

    return config.defaultEnabled;
  }

  async getNotificationPreferences(userId: string, category: string, subcategory: string) {
    const prefs = await db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.category, category),
          eq(notificationPreferences.subcategory, subcategory)
        )
      )
      .limit(1);

    if (prefs.length > 0) {
      return prefs[0];
    }

    const config = NOTIFICATION_CONFIG[subcategory];
    return {
      userId,
      category,
      subcategory,
      inAppEnabled: config?.defaultEnabled ? 1 : 0,
      emailEnabled: 0,
      emailFrequency: 'daily' as const,
    };
  }

  async setNotificationPreference(
    userId: string,
    category: string,
    subcategory: string,
    inAppEnabled: boolean,
    emailEnabled?: boolean,
    emailFrequency?: 'instant' | 'daily' | 'weekly'
  ) {
    const existing = await db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.category, category),
          eq(notificationPreferences.subcategory, subcategory)
        )
      )
      .limit(1);

    const values = {
      userId,
      category,
      subcategory,
      inAppEnabled: inAppEnabled ? 1 : 0,
      emailEnabled: emailEnabled !== undefined ? (emailEnabled ? 1 : 0) : 0,
      emailFrequency: emailFrequency || 'daily',
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      await db
        .update(notificationPreferences)
        .set(values)
        .where(eq(notificationPreferences.id, existing[0].id));
    } else {
      await db.insert(notificationPreferences).values(values);
    }
  }

  async addUserCategoryInterest(userId: string, categoryType: string, categoryValue: string) {
    const existing = await db
      .select()
      .from(userCategoryInterests)
      .where(
        and(
          eq(userCategoryInterests.userId, userId),
          eq(userCategoryInterests.categoryType, categoryType),
          eq(userCategoryInterests.categoryValue, categoryValue)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(userCategoryInterests).values({
        userId,
        categoryType,
        categoryValue,
      });
    }
  }

  async removeUserCategoryInterest(userId: string, categoryType: string, categoryValue: string) {
    await db
      .delete(userCategoryInterests)
      .where(
        and(
          eq(userCategoryInterests.userId, userId),
          eq(userCategoryInterests.categoryType, categoryType),
          eq(userCategoryInterests.categoryValue, categoryValue)
        )
      );
  }

  async getUserCategoryInterests(userId: string, categoryType?: string) {
    let query = db
      .select()
      .from(userCategoryInterests)
      .where(eq(userCategoryInterests.userId, userId));

    if (categoryType) {
      query = query.where(
        and(
          eq(userCategoryInterests.userId, userId),
          eq(userCategoryInterests.categoryType, categoryType)
        )
      );
    }

    return await query;
  }
}

export const notificationHelper = new NotificationHelper();
