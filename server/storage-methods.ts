import { db } from "./db";
import { users, events, jobs, marketplaceItems, communityAnnouncements, ideas, discussionThreads, galleries, galleryImages, lostAndFound } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import type { User } from "@shared/schema";

export async function setPasswordResetToken(
  userId: string,
  token: string,
  expiry: Date
): Promise<void> {
  await db
    .update(users)
    .set({ 
      passwordResetToken: token, 
      passwordResetExpiry: expiry 
    })
    .where(eq(users.id, userId));
}

export async function getUserByPasswordResetToken(
  token: string
): Promise<User | undefined> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.passwordResetToken, token))
    .limit(1);
  return result[0];
}

export async function clearPasswordResetToken(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ 
      passwordResetToken: null, 
      passwordResetExpiry: null 
    })
    .where(eq(users.id, userId));
}

export async function updateUserPassword(
  userId: string,
  hashedPassword: string
): Promise<void> {
  await db
    .update(users)
    .set({ 
      hashedPassword,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
    })
    .where(eq(users.id, userId));
}

export async function incrementFailedLoginAttempts(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ 
      failedLoginAttempts: sql`${users.failedLoginAttempts} + 1`,
    })
    .where(eq(users.id, userId));
}

export async function lockUserAccount(userId: string, lockoutUntil: Date): Promise<void> {
  await db
    .update(users)
    .set({ 
      accountLockedUntil: lockoutUntil,
    })
    .where(eq(users.id, userId));
}

export async function resetFailedLoginAttempts(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ 
      failedLoginAttempts: 0,
      accountLockedUntil: null,
    })
    .where(eq(users.id, userId));
}

export async function getActivityFeed(options: { limit?: number; offset?: number; filter?: 'all' | 'following' | 'interests' | 'discussions'; userId?: string } = {}) {
  const { limit = 20, offset = 0, filter = 'all', userId } = options;
  
  // If discussions filter is requested, delegate to the storage class method
  if (filter === 'discussions' || filter === 'following' || filter === 'interests') {
    const { storage } = await import('./storage');
    return storage.getActivityFeed({ userId, filter, limit, offset });
  }
  
  // Default 'all' filter behavior
  const [
    recentEvents,
    recentJobs,
    recentMarketplace,
    recentAnnouncements,
    recentIdeas,
    recentDiscussions,
    recentGalleries,
    recentLostAndFound
  ] = await Promise.all([
    db
      .select({
        id: events.id,
        type: sql<string>`'event'`,
        title: events.title,
        description: events.description,
        createdAt: events.createdAt,
        userId: events.organizerId,
        userName: users.fullName,
        userPhoto: users.profilePhotoUrl,
        metadata: sql<any>`json_build_object('eventDate', ${events.eventDate}, 'location', ${events.location}, 'imageUrl', ${events.imageUrl})`,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.status, 'upcoming'))
      .orderBy(desc(events.createdAt))
      .limit(10),
    
    db
      .select({
        id: jobs.id,
        type: sql<string>`'job'`,
        title: jobs.jobTitle,
        description: jobs.description,
        createdAt: jobs.createdAt,
        userId: jobs.posterId,
        userName: users.fullName,
        userPhoto: users.profilePhotoUrl,
        metadata: sql<any>`json_build_object('companyName', ${jobs.companyName}, 'workMode', ${jobs.workMode}, 'experienceLevel', ${jobs.experienceLevel})`,
      })
      .from(jobs)
      .leftJoin(users, eq(jobs.posterId, users.id))
      .where(eq(jobs.status, 'active'))
      .orderBy(desc(jobs.createdAt))
      .limit(10),
    
    db
      .select({
        id: marketplaceItems.id,
        type: sql<string>`'marketplace'`,
        title: marketplaceItems.title,
        description: marketplaceItems.description,
        createdAt: marketplaceItems.createdAt,
        userId: marketplaceItems.sellerId,
        userName: users.fullName,
        userPhoto: users.profilePhotoUrl,
        metadata: sql<any>`json_build_object('price', ${marketplaceItems.price}, 'listingType', ${marketplaceItems.listingType}, 'images', ${marketplaceItems.images}, 'category', ${marketplaceItems.category})`,
      })
      .from(marketplaceItems)
      .leftJoin(users, eq(marketplaceItems.sellerId, users.id))
      .where(eq(marketplaceItems.status, 'available'))
      .orderBy(desc(marketplaceItems.createdAt))
      .limit(10),
    
    db
      .select({
        id: communityAnnouncements.id,
        type: sql<string>`'announcement'`,
        title: communityAnnouncements.title,
        description: communityAnnouncements.content,
        createdAt: communityAnnouncements.createdAt,
        userId: communityAnnouncements.userId,
        userName: users.fullName,
        userPhoto: users.profilePhotoUrl,
        metadata: sql<any>`json_build_object('priority', ${communityAnnouncements.priority}, 'images', ${communityAnnouncements.images})`,
      })
      .from(communityAnnouncements)
      .leftJoin(users, eq(communityAnnouncements.userId, users.id))
      .where(eq(communityAnnouncements.status, 'approved'))
      .orderBy(desc(communityAnnouncements.createdAt))
      .limit(10),
    
    db
      .select({
        id: ideas.id,
        type: sql<string>`'idea'`,
        title: ideas.title,
        description: ideas.description,
        createdAt: ideas.createdAt,
        userId: ideas.posterId,
        userName: users.fullName,
        userPhoto: users.profilePhotoUrl,
        metadata: sql<any>`json_build_object('upvoteCount', ${ideas.upvoteCount}, 'commentCount', ${ideas.commentCount}, 'rolesNeeded', ${ideas.rolesNeeded})`,
      })
      .from(ideas)
      .leftJoin(users, eq(ideas.posterId, users.id))
      .orderBy(desc(ideas.createdAt))
      .limit(10),
    
    db
      .select({
        id: discussionThreads.id,
        type: sql<string>`'discussion'`,
        title: discussionThreads.title,
        description: discussionThreads.content,
        createdAt: discussionThreads.createdAt,
        userId: discussionThreads.authorId,
        userName: users.fullName,
        userPhoto: users.profilePhotoUrl,
        metadata: sql<any>`json_build_object('tags', ${discussionThreads.tags}, 'likeCount', ${discussionThreads.likeCount}, 'commentCount', ${discussionThreads.commentCount})`,
      })
      .from(discussionThreads)
      .leftJoin(users, eq(discussionThreads.authorId, users.id))
      .orderBy(desc(discussionThreads.createdAt))
      .limit(10),
    
    db
      .select({
        id: galleries.id,
        type: sql<string>`'gallery'`,
        title: galleries.title,
        description: galleries.description,
        createdAt: galleries.createdAt,
        userId: galleries.creatorId,
        userName: users.fullName,
        userPhoto: users.profilePhotoUrl,
        metadata: sql<any>`json_build_object(
          'tags', ${galleries.tags}, 
          'imageCount', ${galleries.imageCount},
          'imageUrl', (
            SELECT ${galleryImages.imageUrl}
            FROM ${galleryImages}
            WHERE ${galleryImages.galleryId} = ${galleries.id}
            ORDER BY ${galleryImages.sortOrder} ASC, ${galleryImages.createdAt} ASC
            LIMIT 1
          )
        )`,
      })
      .from(galleries)
      .leftJoin(users, eq(galleries.creatorId, users.id))
      .orderBy(desc(galleries.createdAt))
      .limit(10),
    
    db
      .select({
        id: lostAndFound.id,
        type: sql<string>`'lost-and-found'`,
        title: lostAndFound.title,
        description: lostAndFound.description,
        createdAt: lostAndFound.createdAt,
        userId: lostAndFound.userId,
        userName: users.fullName,
        userPhoto: users.profilePhotoUrl,
        metadata: sql<any>`json_build_object('itemType', ${lostAndFound.type}, 'category', ${lostAndFound.category}, 'location', ${lostAndFound.location}, 'images', ${lostAndFound.images}, 'status', ${lostAndFound.status})`,
      })
      .from(lostAndFound)
      .leftJoin(users, eq(lostAndFound.userId, users.id))
      .where(eq(lostAndFound.status, 'open'))
      .orderBy(desc(lostAndFound.createdAt))
      .limit(10),
  ]);

  const allActivities = [
    ...recentEvents,
    ...recentJobs,
    ...recentMarketplace,
    ...recentAnnouncements,
    ...recentIdeas,
    ...recentDiscussions,
    ...recentGalleries,
    ...recentLostAndFound,
  ];

  allActivities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return allActivities.slice(offset, offset + limit);
}
