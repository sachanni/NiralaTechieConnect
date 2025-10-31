import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  fullName: text("full_name").notNull(),
  flatNumber: text("flat_number").notNull(),
  email: text("email").notNull().unique(),
  company: text("company").notNull(),
  techStack: text("tech_stack").array().notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  profilePhotoUrl: text("profile_photo_url"),
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
  profileVisibility: text("profile_visibility").notNull().default('everyone'),
  allowMessages: text("allow_messages").notNull().default('everyone'),
  showEmail: integer("show_email").notNull().default(0),
  showPhone: integer("show_phone").notNull().default(0),
  notificationPreferences: text("notification_preferences").notNull().default('{"jobs":true,"messages":true,"skillSwap":true,"ideas":true,"events":true,"forum":true}'),
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

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

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
  status: text("status").notNull().default('pending'),
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
