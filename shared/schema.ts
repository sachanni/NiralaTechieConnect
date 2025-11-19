import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  fullName: text("full_name").notNull(),
  flatNumber: text("flat_number").notNull(),
  email: text("email").notNull().unique(),
  dateOfBirth: text("date_of_birth"),
  towerName: text("tower_name"),
  societyName: text("society_name").notNull().default('Nirala Estate'),
  residencyType: text("residency_type"),
  residentSince: text("resident_since"),
  serviceCategories: text("service_categories").array().default(sql`ARRAY[]::text[]`),
  categoryRoles: jsonb("category_roles").default(sql`'{}'::jsonb`).$type<Record<string, ('provider' | 'seeker')[]>>(),
  occupation: text("occupation"),
  employmentStatus: text("employment_status"),
  briefIntro: text("brief_intro"),
  professionalWebsite: text("professional_website"),
  company: text("company"),
  techStack: text("tech_stack").array().default(sql`ARRAY[]::text[]`),
  yearsOfExperience: integer("years_of_experience"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  profilePhotoUrl: text("profile_photo_url"),
  bio: text("bio"),
  skillsToTeach: text("skills_to_teach").array().notNull().default(sql`ARRAY[]::text[]`),
  skillsToLearn: text("skills_to_learn").array().notNull().default(sql`ARRAY[]::text[]`),
  mentorRating: integer("mentor_rating").notNull().default(0),
  totalSessionsTaught: integer("total_sessions_taught").notNull().default(0),
  totalSessionsLearned: integer("total_sessions_learned").notNull().default(0),
  companyHistory: text("company_history").array().notNull().default(sql`ARRAY[]::text[]`),
  specialties: text("specialties").array().notNull().default(sql`ARRAY[]::text[]`),
  points: integer("points").notNull().default(0),
  badges: text("badges").array().notNull().default(sql`ARRAY[]::text[]`),
  isAdmin: integer("is_admin").notNull().default(0),
  onboardingCompleted: integer("onboarding_completed").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  isOnline: integer("is_online").notNull().default(0),
  lastSeenAt: timestamp("last_seen_at"),
  profileVisibility: text("profile_visibility").notNull().default('everyone'),
  allowMessages: text("allow_messages").notNull().default('everyone'),
  showEmail: integer("show_email").notNull().default(0),
  showPhone: integer("show_phone").notNull().default(0),
  notificationPreferences: text("notification_preferences").notNull().default('{"jobs":true,"messages":true,"skillSwap":true,"ideas":true,"events":true,"forum":true}'),
  isSuspended: integer("is_suspended").notNull().default(0),
  suspensionReason: text("suspension_reason"),
  suspendedAt: timestamp("suspended_at"),
  suspendedBy: varchar("suspended_by"),
  forceLogoutAfter: timestamp("force_logout_after"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  hashedPassword: varchar("hashed_password", { length: 72 }),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  accountLockedUntil: timestamp("account_locked_until"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  skillsToTeach: true,
  skillsToLearn: true,
  mentorRating: true,
  totalSessionsTaught: true,
  totalSessionsLearned: true,
  points: true,
  badges: true,
  isAdmin: true,
  isActive: true,
  profileVisibility: true,
  allowMessages: true,
  showEmail: true,
  showPhone: true,
  notificationPreferences: true,
  isSuspended: true,
  suspensionReason: true,
  suspendedAt: true,
  suspendedBy: true,
  forceLogoutAfter: true,
  passwordResetToken: true,
  passwordResetExpiry: true,
  failedLoginAttempts: true,
  accountLockedUntil: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id),
  user2Id: varchar("user2_id").notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileType: text("file_type"),
  isRead: integer("is_read").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  category: text("category"),
  priority: text("priority").notNull().default('medium'),
  entityId: varchar("entity_id"),
  actorId: varchar("actor_id").references(() => users.id),
  groupId: varchar("group_id"),
  payload: jsonb("payload").notNull().default(sql`'{}'::jsonb`).$type<Record<string, any>>(),
  readAt: timestamp("read_at"),
  dismissedAt: timestamp("dismissed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  inAppEnabled: integer("in_app_enabled").notNull().default(1),
  emailEnabled: integer("email_enabled").notNull().default(0),
  emailFrequency: text("email_frequency").notNull().default('daily'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userCategoryInterests = pgTable("user_category_interests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  categoryType: text("category_type").notNull(),
  categoryValue: text("category_value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserCategoryInterestSchema = createInsertSchema(userCategoryInterests).omit({
  id: true,
  createdAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertUserCategoryInterest = z.infer<typeof insertUserCategoryInterestSchema>;
export type UserCategoryInterest = typeof userCategoryInterests.$inferSelect;

export const messageReactions = pgTable("message_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => messages.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const readReceipts = pgTable("read_receipts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  lastReadMessageId: varchar("last_read_message_id").references(() => messages.id),
  lastReadAt: timestamp("last_read_at").notNull().defaultNow(),
});

export const insertMessageReactionSchema = createInsertSchema(messageReactions).omit({
  id: true,
  createdAt: true,
});

export const insertReadReceiptSchema = createInsertSchema(readReceipts).omit({
  id: true,
  lastReadAt: true,
});

export type InsertMessageReaction = z.infer<typeof insertMessageReactionSchema>;
export type MessageReaction = typeof messageReactions.$inferSelect;
export type InsertReadReceipt = z.infer<typeof insertReadReceiptSchema>;
export type ReadReceipt = typeof readReceipts.$inferSelect;

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  posterId: varchar("poster_id").notNull().references(() => users.id),
  jobTitle: text("job_title").notNull(),
  companyName: text("company_name").notNull(),
  requiredTechStack: text("required_tech_stack").array().notNull(),
  experienceLevel: text("experience_level").notNull(),
  salaryBudget: text("salary_budget").notNull(),
  workMode: text("work_mode").notNull(),
  jobType: text("job_type").notNull(),
  referralBonus: text("referral_bonus"),
  description: text("description").notNull(),
  attachmentUrl: text("attachment_url"),
  status: text("status").notNull().default('active'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  applicantId: varchar("applicant_id").notNull().references(() => users.id),
  resumeUrl: text("resume_url").notNull(),
  coverLetter: text("cover_letter").notNull(),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;

export const ideas = pgTable("ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  posterId: varchar("poster_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  rolesNeeded: text("roles_needed").array().notNull(),
  payStructure: text("pay_structure").notNull(),
  status: text("status").notNull().default('approved'),
  interestCount: integer("interest_count").notNull().default(0),
  upvoteCount: integer("upvote_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ideaInterests = pgTable("idea_interests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").notNull().references(() => ideas.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ideaUpvotes = pgTable("idea_upvotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").notNull().references(() => ideas.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ideaComments = pgTable("idea_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").notNull().references(() => ideas.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ideaTeamApplications = pgTable("idea_team_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").notNull().references(() => ideas.id),
  applicantId: varchar("applicant_id").notNull().references(() => users.id),
  roleAppliedFor: text("role_applied_for").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertIdeaSchema = createInsertSchema(ideas).omit({
  id: true,
  status: true,
  interestCount: true,
  upvoteCount: true,
  commentCount: true,
  createdAt: true,
});

export const insertIdeaInterestSchema = createInsertSchema(ideaInterests).omit({
  id: true,
  createdAt: true,
});

export const insertIdeaUpvoteSchema = createInsertSchema(ideaUpvotes).omit({
  id: true,
  createdAt: true,
});

export const insertIdeaCommentSchema = createInsertSchema(ideaComments).omit({
  id: true,
  createdAt: true,
});

export const insertIdeaTeamApplicationSchema = createInsertSchema(ideaTeamApplications).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertIdea = z.infer<typeof insertIdeaSchema>;
export type Idea = typeof ideas.$inferSelect;
export type InsertIdeaInterest = z.infer<typeof insertIdeaInterestSchema>;
export type IdeaInterest = typeof ideaInterests.$inferSelect;
export type InsertIdeaUpvote = z.infer<typeof insertIdeaUpvoteSchema>;
export type IdeaUpvote = typeof ideaUpvotes.$inferSelect;
export type InsertIdeaComment = z.infer<typeof insertIdeaCommentSchema>;
export type IdeaComment = typeof ideaComments.$inferSelect;
export type InsertIdeaTeamApplication = z.infer<typeof insertIdeaTeamApplicationSchema>;
export type IdeaTeamApplication = typeof ideaTeamApplications.$inferSelect;

export const skillSwapSessions = pgTable("skill_swap_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorId: varchar("mentor_id").notNull().references(() => users.id),
  learnerId: varchar("learner_id").notNull().references(() => users.id),
  skillTopic: text("skill_topic").notNull(),
  sessionDate: text("session_date").notNull(),
  sessionTime: text("session_time").notNull(),
  duration: integer("duration").notNull().default(60),
  sessionType: text("session_type").notNull(),
  meetingLink: text("meeting_link"),
  calendarEventId: text("calendar_event_id"),
  message: text("message"),
  status: text("status").notNull().default('scheduled'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const skillSwapReviews = pgTable("skill_swap_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => skillSwapSessions.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSkillSwapSessionSchema = createInsertSchema(skillSwapSessions).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertSkillSwapReviewSchema = createInsertSchema(skillSwapReviews).omit({
  id: true,
  createdAt: true,
});

export type InsertSkillSwapSession = z.infer<typeof insertSkillSwapSessionSchema>;
export type SkillSwapSession = typeof skillSwapSessions.$inferSelect;
export type InsertSkillSwapReview = z.infer<typeof insertSkillSwapReviewSchema>;
export type SkillSwapReview = typeof skillSwapReviews.$inferSelect;

export const broadcasts = pgTable("broadcasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const broadcastViews = pgTable("broadcast_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  broadcastId: varchar("broadcast_id").notNull().references(() => broadcasts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
  dismissed: integer("dismissed").notNull().default(0),
});

export const adminActions = pgTable("admin_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  actionType: text("action_type").notNull(),
  targetType: text("target_type").notNull(),
  targetId: varchar("target_id").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBroadcastSchema = createInsertSchema(broadcasts).omit({
  id: true,
  sentAt: true,
  createdAt: true,
});

export const insertBroadcastViewSchema = createInsertSchema(broadcastViews).omit({
  id: true,
  viewedAt: true,
});

export const insertAdminActionSchema = createInsertSchema(adminActions).omit({
  id: true,
  createdAt: true,
});

export type InsertBroadcast = z.infer<typeof insertBroadcastSchema>;
export type Broadcast = typeof broadcasts.$inferSelect;
export type InsertBroadcastView = z.infer<typeof insertBroadcastViewSchema>;
export type BroadcastView = typeof broadcastViews.$inferSelect;
export type InsertAdminAction = z.infer<typeof insertAdminActionSchema>;
export type AdminAction = typeof adminActions.$inferSelect;

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  eventDate: timestamp("event_date").notNull(),
  eventTime: text("event_time").notNull(),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  maxAttendees: integer("max_attendees").notNull(),
  imageUrl: text("image_url"),
  eventType: text("event_type").notNull().default('community'),
  status: text("status").notNull().default('upcoming'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const eventRsvps = pgTable("event_rsvps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default('confirmed'),
  rsvpedAt: timestamp("rsvped_at").notNull().defaultNow(),
});

export const eventCheckins = pgTable("event_checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  qrCode: text("qr_code").notNull().unique(),
  checkedInAt: timestamp("checked_in_at"),
  pointsAwarded: integer("points_awarded").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({
  id: true,
  status: true,
  rsvpedAt: true,
});

export const insertEventCheckinSchema = createInsertSchema(eventCheckins).omit({
  id: true,
  checkedInAt: true,
  pointsAwarded: true,
  createdAt: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventCheckin = z.infer<typeof insertEventCheckinSchema>;
export type EventCheckin = typeof eventCheckins.$inferSelect;

export const eventFeedback = pgTable("event_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  attendeeName: text("attendee_name").notNull(),
  attendeeEmail: text("attendee_email"),
  rating: integer("rating").notNull(),
  comments: text("comments"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const insertEventFeedbackSchema = createInsertSchema(eventFeedback).omit({
  id: true,
  submittedAt: true,
});

export type InsertEventFeedback = z.infer<typeof insertEventFeedbackSchema>;
export type EventFeedback = typeof eventFeedback.$inferSelect;

export const forumCategories = pgTable("forum_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  slug: text("slug").notNull().unique(),
  postCount: integer("post_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id),
  categoryId: varchar("category_id").notNull().references(() => forumCategories.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  postType: text("post_type").notNull().default('question'),
  expertOnly: integer("expert_only").notNull().default(0),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  upvoteCount: integer("upvote_count").notNull().default(0),
  downvoteCount: integer("downvote_count").notNull().default(0),
  replyCount: integer("reply_count").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  bestReplyId: varchar("best_reply_id"),
  status: text("status").notNull().default('active'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => forumPosts.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  parentReplyId: varchar("parent_reply_id"),
  content: text("content").notNull(),
  upvoteCount: integer("upvote_count").notNull().default(0),
  downvoteCount: integer("downvote_count").notNull().default(0),
  isBestAnswer: integer("is_best_answer").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const forumVotes = pgTable("forum_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  targetType: text("target_type").notNull(),
  targetId: varchar("target_id").notNull(),
  voteType: text("vote_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const forumReports = pgTable("forum_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  targetType: text("target_type").notNull(),
  targetId: varchar("target_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").notNull().default('pending'),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const forumCategorySubscriptions = pgTable("forum_category_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: varchar("category_id").notNull().references(() => forumCategories.id, { onDelete: 'cascade' }),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
}, (table) => ({
  uniqueUserCategory: sql`UNIQUE(user_id, category_id)`,
}));

export const insertForumCategorySchema = createInsertSchema(forumCategories).omit({
  id: true,
  postCount: true,
  createdAt: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  upvoteCount: true,
  downvoteCount: true,
  replyCount: true,
  viewCount: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  upvoteCount: true,
  downvoteCount: true,
  isBestAnswer: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForumVoteSchema = createInsertSchema(forumVotes).omit({
  id: true,
  createdAt: true,
});

export const insertForumReportSchema = createInsertSchema(forumReports).omit({
  id: true,
  status: true,
  resolvedBy: true,
  resolvedAt: true,
  createdAt: true,
});

export const insertForumCategorySubscriptionSchema = createInsertSchema(forumCategorySubscriptions).omit({
  id: true,
  subscribedAt: true,
});

export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;
export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumVote = z.infer<typeof insertForumVoteSchema>;
export type ForumVote = typeof forumVotes.$inferSelect;
export type InsertForumReport = z.infer<typeof insertForumReportSchema>;
export type ForumReport = typeof forumReports.$inferSelect;
export type InsertForumCategorySubscription = z.infer<typeof insertForumCategorySubscriptionSchema>;
export type ForumCategorySubscription = typeof forumCategorySubscriptions.$inferSelect;

export const discussionThreads = pgTable("discussion_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  likeCount: integer("like_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  isPinned: integer("is_pinned").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const discussionComments = pgTable("discussion_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => discussionThreads.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  likeCount: integer("like_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const discussionLikes = pgTable("discussion_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  targetType: text("target_type").notNull(),
  targetId: varchar("target_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const galleries = pgTable("galleries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  likeCount: integer("like_count").notNull().default(0),
  imageCount: integer("image_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const galleryImages = pgTable("gallery_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  galleryId: varchar("gallery_id").notNull().references(() => galleries.id),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const galleryLikes = pgTable("gallery_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  galleryId: varchar("gallery_id").notNull().references(() => galleries.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const advertisements = pgTable("advertisements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  serviceCategory: text("service_category").notNull(),
  imageUrl: text("image_url"),
  servicePageContent: text("service_page_content").notNull(),
  pricing: text("pricing"),
  contactInfo: text("contact_info").notNull(),
  duration: integer("duration").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default('pending'),
  viewCount: integer("view_count").notNull().default(0),
  clickCount: integer("click_count").notNull().default(0),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const adPayments = pgTable("ad_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertisementId: varchar("advertisement_id").notNull().references(() => advertisements.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default('INR'),
  razorpayOrderId: text("razorpay_order_id").notNull(),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const adAnalytics = pgTable("ad_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertisementId: varchar("advertisement_id").notNull().references(() => advertisements.id),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityFeed = pgTable("activity_feed", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  activityType: text("activity_type").notNull(),
  activityCategory: text("activity_category"),
  targetType: text("target_type").notNull(),
  targetId: varchar("target_id").notNull(),
  content: text("content").notNull(),
  metadata: text("metadata").notNull().default('{}'),
  likeCount: integer("like_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLikes = pgTable("activity_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  activityId: varchar("activity_id").notNull().references(() => activityFeed.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userFollows = pgTable("user_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followeeId: varchar("followee_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityInterestTopics = pgTable("activity_interest_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  description: text("description"),
  allowedActivityTypes: jsonb("allowed_activity_types").notNull().default(sql`'[]'::jsonb`).$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userActivityInterests = pgTable("user_activity_interests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  interestId: varchar("interest_id").notNull().references(() => activityInterestTopics.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const serviceRatings = pgTable("service_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  serviceCategory: text("service_category").notNull(),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userPresence = pgTable("user_presence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  status: text("status").notNull().default('offline'),
  lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDiscussionThreadSchema = createInsertSchema(discussionThreads).omit({
  id: true,
  likeCount: true,
  commentCount: true,
  viewCount: true,
  isPinned: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscussionCommentSchema = createInsertSchema(discussionComments).omit({
  id: true,
  likeCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscussionLikeSchema = createInsertSchema(discussionLikes).omit({
  id: true,
  createdAt: true,
});

export const insertGallerySchema = createInsertSchema(galleries).omit({
  id: true,
  likeCount: true,
  imageCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  createdAt: true,
});

export const insertGalleryLikeSchema = createInsertSchema(galleryLikes).omit({
  id: true,
  createdAt: true,
});

export const insertAdvertisementSchema = createInsertSchema(advertisements).omit({
  id: true,
  startDate: true,
  endDate: true,
  status: true,
  viewCount: true,
  clickCount: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdPaymentSchema = createInsertSchema(adPayments).omit({
  id: true,
  razorpayPaymentId: true,
  razorpaySignature: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdAnalyticsSchema = createInsertSchema(adAnalytics).omit({
  id: true,
  createdAt: true,
});

export const insertActivityFeedSchema = createInsertSchema(activityFeed).omit({
  id: true,
  likeCount: true,
  createdAt: true,
});

export const insertActivityLikeSchema = createInsertSchema(activityLikes).omit({
  id: true,
  createdAt: true,
});

export const insertUserFollowSchema = createInsertSchema(userFollows).omit({
  id: true,
  createdAt: true,
});

export const insertActivityInterestTopicSchema = createInsertSchema(activityInterestTopics).omit({
  id: true,
  createdAt: true,
});

export const insertUserActivityInterestSchema = createInsertSchema(userActivityInterests).omit({
  id: true,
  createdAt: true,
});

export const insertServiceRatingSchema = createInsertSchema(serviceRatings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPresenceSchema = createInsertSchema(userPresence).omit({
  id: true,
  lastSeenAt: true,
  updatedAt: true,
});

export const lostAndFound = pgTable("lost_and_found", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location"),
  contactInfo: text("contact_info"),
  images: text("images").array().default(sql`ARRAY[]::text[]`),
  status: text("status").notNull().default('open'),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const communityAnnouncements = pgTable("community_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  images: text("images").array().default(sql`ARRAY[]::text[]`),
  status: text("status").notNull().default('pending'),
  priority: text("priority").notNull().default('normal'),
  expiresAt: timestamp("expires_at"),
  viewCount: integer("view_count").notNull().default(0),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLostAndFoundSchema = createInsertSchema(lostAndFound).omit({
  id: true,
  status: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityAnnouncementSchema = createInsertSchema(communityAnnouncements).omit({
  id: true,
  status: true,
  viewCount: true,
  approvedBy: true,
  approvedAt: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDiscussionThread = z.infer<typeof insertDiscussionThreadSchema>;
export type DiscussionThread = typeof discussionThreads.$inferSelect;
export type InsertDiscussionComment = z.infer<typeof insertDiscussionCommentSchema>;
export type DiscussionComment = typeof discussionComments.$inferSelect;
export type InsertDiscussionLike = z.infer<typeof insertDiscussionLikeSchema>;
export type DiscussionLike = typeof discussionLikes.$inferSelect;
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type Gallery = typeof galleries.$inferSelect;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryLike = z.infer<typeof insertGalleryLikeSchema>;
export type GalleryLike = typeof galleryLikes.$inferSelect;
export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;
export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdPayment = z.infer<typeof insertAdPaymentSchema>;
export type AdPayment = typeof adPayments.$inferSelect;
export type InsertAdAnalytics = z.infer<typeof insertAdAnalyticsSchema>;
export type AdAnalytics = typeof adAnalytics.$inferSelect;
export type InsertActivityFeed = z.infer<typeof insertActivityFeedSchema>;
export type ActivityFeed = typeof activityFeed.$inferSelect;
export type InsertActivityLike = z.infer<typeof insertActivityLikeSchema>;
export type ActivityLike = typeof activityLikes.$inferSelect;
export type InsertUserFollow = z.infer<typeof insertUserFollowSchema>;
export type UserFollow = typeof userFollows.$inferSelect;
export type InsertActivityInterestTopic = z.infer<typeof insertActivityInterestTopicSchema>;
export type ActivityInterestTopic = typeof activityInterestTopics.$inferSelect;
export type InsertUserActivityInterest = z.infer<typeof insertUserActivityInterestSchema>;
export type UserActivityInterest = typeof userActivityInterests.$inferSelect;
export type InsertServiceRating = z.infer<typeof insertServiceRatingSchema>;
export type ServiceRating = typeof serviceRatings.$inferSelect;
export type InsertUserPresence = z.infer<typeof insertUserPresenceSchema>;
export type UserPresence = typeof userPresence.$inferSelect;
export type InsertLostAndFound = z.infer<typeof insertLostAndFoundSchema>;
export type LostAndFound = typeof lostAndFound.$inferSelect;
export type InsertCommunityAnnouncement = z.infer<typeof insertCommunityAnnouncementSchema>;
export type CommunityAnnouncement = typeof communityAnnouncements.$inferSelect;

// Marketplace Tables
export const marketplaceItems = pgTable("marketplace_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Electronics, Furniture, Books, Clothing, Toys, etc.
  condition: text("condition").notNull(), // New, Like New, Good, Fair
  listingType: text("listing_type").notNull(), // sell, exchange, free
  price: integer("price"), // Price in INR (null for exchange/free)
  negotiable: integer("negotiable").notNull().default(1), // 0 or 1 boolean
  images: text("images").array().default(sql`ARRAY[]::text[]`),
  location: text("location").notNull(), // Tower/Block location within society
  status: text("status").notNull().default('available'), // available, sold, reserved, deleted
  viewCount: integer("view_count").notNull().default(0),
  favoriteCount: integer("favorite_count").notNull().default(0),
  soldAt: timestamp("sold_at"),
  soldTo: varchar("sold_to").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const marketplaceOffers = pgTable("marketplace_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull().references(() => marketplaceItems.id),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  offerAmount: integer("offer_amount"), // Offered price (null for exchange)
  exchangeOffer: text("exchange_offer"), // What they're offering to exchange
  message: text("message"), // Optional message to seller
  status: text("status").notNull().default('pending'), // pending, accepted, rejected, withdrawn
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const marketplaceFavorites = pgTable("marketplace_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull().references(() => marketplaceItems.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const marketplaceReviews = pgTable("marketplace_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull().references(() => marketplaceItems.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id), // Seller or buyer being reviewed
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review").notNull(),
  transactionType: text("transaction_type").notNull(), // buy, sell, exchange
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tool & Equipment Rental Tables
export const rentalItems = pgTable("rental_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Power Tools, Garden Tools, Kitchen Equipment, Party Supplies, Sports Equipment, etc.
  condition: text("condition").notNull(), // Excellent, Good, Fair
  images: text("images").array().default(sql`ARRAY[]::text[]`),
  location: text("location").notNull(), // Tower/Block location
  rentalPrice: integer("rental_price").notNull(), // Price per day in INR
  securityDeposit: integer("security_deposit").notNull().default(0), // Refundable deposit
  availability: text("availability").notNull().default('available'), // available, rented, maintenance, unavailable
  pickupLocation: text("pickup_location").notNull(), // Where to pick up the item
  termsAndConditions: text("terms_and_conditions"), // Special terms
  viewCount: integer("view_count").notNull().default(0),
  totalBookings: integer("total_bookings").notNull().default(0),
  rating: integer("rating").notNull().default(0), // Average rating (0-500, divide by 100 for 0-5 stars)
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const rentalBookings = pgTable("rental_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull().references(() => rentalItems.id),
  renterId: varchar("renter_id").notNull().references(() => users.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalAmount: integer("total_amount").notNull(), // Total rental cost
  securityDeposit: integer("security_deposit").notNull(),
  status: text("status").notNull().default('pending'), // pending, confirmed, active, completed, cancelled
  pickupTime: timestamp("pickup_time"),
  returnTime: timestamp("return_time"),
  notes: text("notes"), // Special requests or notes
  ownerNotes: text("owner_notes"), // Owner's notes about the rental
  depositReturned: integer("deposit_returned").notNull().default(0), // 0 or 1 boolean
  depositReturnedAt: timestamp("deposit_returned_at"),
  cancelledBy: varchar("cancelled_by").references(() => users.id),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const rentalReviews = pgTable("rental_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => rentalBookings.id),
  itemId: varchar("item_id").notNull().references(() => rentalItems.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review").notNull(),
  reviewType: text("review_type").notNull(), // renter_review (renter reviewing item), owner_review (owner reviewing renter)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rentalFavorites = pgTable("rental_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull().references(() => rentalItems.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas for Marketplace
export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems).omit({
  id: true,
  viewCount: true,
  favoriteCount: true,
  soldAt: true,
  soldTo: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceOfferSchema = createInsertSchema(marketplaceOffers).omit({
  id: true,
  status: true,
  respondedAt: true,
  createdAt: true,
});

export const insertMarketplaceFavoriteSchema = createInsertSchema(marketplaceFavorites).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceReviewSchema = createInsertSchema(marketplaceReviews).omit({
  id: true,
  createdAt: true,
});

// Insert schemas for Tool Rental
export const insertRentalItemSchema = createInsertSchema(rentalItems).omit({
  id: true,
  viewCount: true,
  totalBookings: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRentalBookingSchema = createInsertSchema(rentalBookings).omit({
  id: true,
  status: true,
  pickupTime: true,
  returnTime: true,
  depositReturned: true,
  depositReturnedAt: true,
  cancelledBy: true,
  cancellationReason: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRentalReviewSchema = createInsertSchema(rentalReviews).omit({
  id: true,
  createdAt: true,
});

export const insertRentalFavoriteSchema = createInsertSchema(rentalFavorites).omit({
  id: true,
  createdAt: true,
});

// Type exports for Marketplace
export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type InsertMarketplaceOffer = z.infer<typeof insertMarketplaceOfferSchema>;
export type MarketplaceOffer = typeof marketplaceOffers.$inferSelect;
export type InsertMarketplaceFavorite = z.infer<typeof insertMarketplaceFavoriteSchema>;
export type MarketplaceFavorite = typeof marketplaceFavorites.$inferSelect;
export type InsertMarketplaceReview = z.infer<typeof insertMarketplaceReviewSchema>;
export type MarketplaceReview = typeof marketplaceReviews.$inferSelect;

// Type exports for Tool Rental
export type InsertRentalItem = z.infer<typeof insertRentalItemSchema>;
export type RentalItem = typeof rentalItems.$inferSelect;
export type InsertRentalBooking = z.infer<typeof insertRentalBookingSchema>;
export type RentalBooking = typeof rentalBookings.$inferSelect;
export type InsertRentalReview = z.infer<typeof insertRentalReviewSchema>;
export type RentalReview = typeof rentalReviews.$inferSelect;
export type InsertRentalFavorite = z.infer<typeof insertRentalFavoriteSchema>;
export type RentalFavorite = typeof rentalFavorites.$inferSelect;

// User Services - Service-level selections with provider/seeker roles
export const userServices = pgTable("user_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  serviceId: text("service_id").notNull(), // e.g., "office_carpool", "tiffin"
  categoryId: text("category_id").notNull(), // e.g., "mobility", "food"
  roleType: text("role_type").notNull(), // "provider" or "seeker"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserServiceSchema = createInsertSchema(userServices).omit({
  id: true,
  createdAt: true,
});

export type InsertUserService = z.infer<typeof insertUserServiceSchema>;
export type UserService = typeof userServices.$inferSelect;
