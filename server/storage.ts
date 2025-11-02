import { type User, type InsertUser, type Conversation, type InsertConversation, type Message, type InsertMessage, type MessageReaction, type InsertMessageReaction, type ReadReceipt, type InsertReadReceipt, type Job, type InsertJob, type JobApplication, type InsertJobApplication, type Idea, type InsertIdea, type IdeaInterest, type InsertIdeaInterest, type IdeaUpvote, type InsertIdeaUpvote, type IdeaComment, type InsertIdeaComment, type IdeaTeamApplication, type InsertIdeaTeamApplication, type SkillSwapSession, type InsertSkillSwapSession, type SkillSwapReview, type InsertSkillSwapReview, type Broadcast, type InsertBroadcast, type BroadcastView, type InsertBroadcastView, type AdminAction, type InsertAdminAction, type Event, type InsertEvent, type EventRsvp, type InsertEventRsvp, type EventCheckin, type InsertEventCheckin, type ForumCategory, type InsertForumCategory, type ForumPost, type InsertForumPost, type ForumReply, type InsertForumReply, type ForumVote, type InsertForumVote, type ForumReport, type InsertForumReport, type LostAndFound, type InsertLostAndFound, type CommunityAnnouncement, type InsertCommunityAnnouncement, users, conversations, messages, messageReactions, readReceipts, jobs, jobApplications, ideas, ideaInterests, ideaUpvotes, ideaComments, ideaTeamApplications, skillSwapSessions, skillSwapReviews, broadcasts, broadcastViews, adminActions, events, eventRsvps, eventCheckins, forumCategories, forumPosts, forumReplies, forumVotes, forumReports, lostAndFound, communityAnnouncements, activityFeed, activityLikes, galleries, galleryImages, galleryLikes, userPresence, marketplaceItems, marketplaceOffers, marketplaceFavorites, marketplaceReviews, rentalItems, rentalBookings, rentalReviews, rentalFavorites, advertisements, adPayments, adAnalytics } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, gte, lte, like, ilike, sql, or, desc, ne } from "drizzle-orm";

export interface SearchFilters {
  techStack?: string[];
  minExperience?: number;
  maxExperience?: number;
  flatBlock?: string;
  excludeUserId?: string;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPointsAndBadges(id: string, points: number, badges: string[]): Promise<User>;
  searchUsers(filters: SearchFilters): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  getUsersByCategory(categoryId: string, roleFilter?: 'provider' | 'seeker'): Promise<User[]>;
  
  getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Array<Conversation & { otherUser: User; unreadCount: number; lastMessage?: Message }>>;
  sendMessage(conversationId: string, senderId: string, content: string): Promise<Message>;
  sendMessageWithFile(conversationId: string, senderId: string, content: string | null, fileUrl: string, fileName: string, fileType: string): Promise<Message>;
  getConversationMessages(conversationId: string, userId: string): Promise<Message[]>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  isConversationParticipant(conversationId: string, userId: string): Promise<boolean>;
  addMessageReaction(messageId: string, userId: string, emoji: string): Promise<MessageReaction>;
  removeMessageReaction(messageId: string, userId: string, emoji: string): Promise<void>;
  getMessageReactions(messageId: string): Promise<MessageReaction[]>;
  updateReadReceipt(conversationId: string, userId: string, lastReadMessageId?: string): Promise<void>;
  getReadReceipts(conversationId: string, userId: string): Promise<ReadReceipt[]>;
  
  createJob(job: InsertJob): Promise<Job>;
  getAllJobs(): Promise<Array<Job & { poster: User }>>;
  getJob(id: string): Promise<(Job & { poster: User }) | undefined>;
  getUserJobs(userId: string): Promise<Job[]>;
  getJobCount(userId: string): Promise<number>;
  deleteJob(id: string, userId: string): Promise<void>;
  
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getJobApplications(jobId: string): Promise<Array<JobApplication & { applicant: User }>>;
  getUserApplications(userId: string): Promise<Array<JobApplication & { job: Job }>>;
  hasUserApplied(jobId: string, userId: string): Promise<boolean>;
  updateApplicationStatus(applicationId: string, status: string, userId: string): Promise<JobApplication>;
  getJobApplicationStats(jobId: string): Promise<{ total: number; pending: number; underReview: number; shortlisted: number; accepted: number; rejected: number }>;
  withdrawApplication(applicationId: string, userId: string): Promise<void>;
  
  createIdea(idea: InsertIdea): Promise<Idea>;
  getAllIdeas(): Promise<Array<Idea & { poster: User }>>;
  getApprovedIdeas(): Promise<Array<Idea & { poster: User }>>;
  getIdea(id: string): Promise<(Idea & { poster: User }) | undefined>;
  getUserIdeas(userId: string): Promise<Idea[]>;
  updateIdea(id: string, updates: Partial<Idea>, userId: string): Promise<Idea>;
  deleteIdea(id: string, userId: string): Promise<void>;
  
  expressInterest(interest: InsertIdeaInterest): Promise<IdeaInterest>;
  getIdeaInterests(ideaId: string): Promise<Array<IdeaInterest & { user: User }>>;
  hasUserExpressedInterest(ideaId: string, userId: string): Promise<boolean>;
  getInterestCountForUserIdeas(userId: string): Promise<number>;
  
  toggleUpvote(ideaId: string, userId: string): Promise<{ upvoted: boolean; upvoteCount: number }>;
  hasUserUpvoted(ideaId: string, userId: string): Promise<boolean>;
  
  createComment(comment: InsertIdeaComment): Promise<IdeaComment>;
  getIdeaComments(ideaId: string): Promise<Array<IdeaComment & { user: User }>>;
  deleteComment(commentId: string, userId: string): Promise<void>;
  
  applyToTeam(application: InsertIdeaTeamApplication): Promise<IdeaTeamApplication>;
  getIdeaTeamApplications(ideaId: string): Promise<Array<IdeaTeamApplication & { applicant: User }>>;
  getUserTeamApplications(userId: string): Promise<Array<IdeaTeamApplication & { idea: Idea }>>;
  hasUserAppliedToTeam(ideaId: string, userId: string): Promise<boolean>;
  updateTeamApplicationStatus(applicationId: string, status: string, userId: string): Promise<IdeaTeamApplication>;
  getAcceptedTeamMembers(ideaId: string): Promise<Array<IdeaTeamApplication & { applicant: User }>>;
  withdrawTeamApplication(applicationId: string, userId: string): Promise<void>;
  getTeamApplicationStats(ideaId: string): Promise<{ total: number; pending: number; accepted: number; rejected: number }>;

  updateUserSkills(userId: string, skillsToTeach: string[], skillsToLearn: string[]): Promise<User>;
  updateUserSettings(userId: string, settings: Partial<Pick<User, 'isActive' | 'profileVisibility' | 'allowMessages' | 'showEmail' | 'showPhone' | 'notificationPreferences'>>): Promise<User>;
  getUserSettings(userId: string): Promise<Pick<User, 'isActive' | 'profileVisibility' | 'allowMessages' | 'showEmail' | 'showPhone' | 'notificationPreferences'>>;
  findMentors(userId: string, skillToLearn?: string): Promise<User[]>;
  createSkillSwapSession(session: InsertSkillSwapSession): Promise<SkillSwapSession>;
  getUserSessions(userId: string): Promise<Array<SkillSwapSession & { mentor: User; learner: User }>>;
  getSession(sessionId: string): Promise<(SkillSwapSession & { mentor: User; learner: User }) | undefined>;
  updateSessionStatus(sessionId: string, status: string, userId: string): Promise<SkillSwapSession>;
  cancelSession(sessionId: string, userId: string): Promise<void>;
  createReview(review: InsertSkillSwapReview): Promise<SkillSwapReview>;
  getUserReviews(userId: string): Promise<SkillSwapReview[]>;
  hasUserReviewedSession(sessionId: string, userId: string): Promise<boolean>;
  getMentorStats(userId: string): Promise<{ averageRating: number; totalReviews: number; totalSessionsTaught: number }>;

  isUserAdmin(userId: string): Promise<boolean>;
  getPendingIdeas(): Promise<Array<Idea & { poster: User }>>;
  approveIdea(ideaId: string, adminId: string): Promise<Idea>;
  rejectIdea(ideaId: string, adminId: string, reason: string): Promise<Idea>;
  
  getAnalytics(): Promise<{
    totalUsers: number;
    totalIdeas: number;
    pendingIdeas: number;
    approvedIdeas: number;
    rejectedIdeas: number;
    totalJobs: number;
    totalSessions: number;
    recentActivity: Array<{ type: string; count: number; date: string }>;
  }>;
  
  createBroadcast(broadcast: InsertBroadcast): Promise<Broadcast>;
  getAllBroadcasts(): Promise<Array<Broadcast & { admin: User; viewCount: number }>>;
  getLatestBroadcast(userId: string): Promise<(Broadcast & { admin: User; hasViewed: boolean; hasDismissed: boolean }) | undefined>;
  markBroadcastAsViewed(broadcastId: string, userId: string): Promise<void>;
  dismissBroadcast(broadcastId: string, userId: string): Promise<void>;
  
  logAdminAction(action: InsertAdminAction): Promise<AdminAction>;
  getAdminActions(filters?: { adminId?: string; actionType?: string; startDate?: Date; endDate?: Date }): Promise<Array<AdminAction & { admin: User }>>;
  
  createEvent(event: InsertEvent): Promise<Event>;
  getEvents(filters?: { status?: string; organizerId?: string }): Promise<Array<Event & { organizer: User; rsvpCount: number; checkinCount: number }>>;
  getEvent(id: string): Promise<(Event & { organizer: User; rsvpCount: number; checkinCount: number }) | undefined>;
  getUpcomingEvents(): Promise<Array<Event & { organizer: User; rsvpCount: number; checkinCount: number }>>;
  getPastEvents(): Promise<Array<Event & { organizer: User; rsvpCount: number; checkinCount: number }>>;
  getUserEvents(organizerId: string): Promise<Array<Event & { rsvpCount: number; checkinCount: number }>>;
  updateEvent(id: string, updates: Partial<Event>, userId: string): Promise<Event>;
  deleteEvent(id: string, userId: string): Promise<void>;
  
  rsvpToEvent(eventId: string, userId: string): Promise<EventRsvp>;
  cancelRsvp(eventId: string, userId: string): Promise<void>;
  getEventRsvps(eventId: string): Promise<Array<EventRsvp & { user: User }>>;
  hasUserRsvped(eventId: string, userId: string): Promise<boolean>;
  getRsvpCount(eventId: string): Promise<number>;
  getUserEventsAttending(userId: string): Promise<Array<EventRsvp & { event: Event & { organizer: User }; checkedIn: boolean }>>;
  
  generateQRCodeForAttendee(eventId: string, userId: string): Promise<string>;
  checkInAttendee(qrCode: string, organizerId: string): Promise<{ success: boolean; message: string; user?: User; event?: Event; pointsAwarded?: number }>;
  hasUserCheckedIn(eventId: string, userId: string): Promise<boolean>;
  getEventCheckins(eventId: string): Promise<Array<EventCheckin & { user: User }>>;
  getCheckinCount(eventId: string): Promise<number>;
  getEventStats(eventId: string): Promise<{ rsvpCount: number; checkinCount: number; capacity: number; availableSpots: number }>;

  getAllCategories(): Promise<ForumCategory[]>;
  getCategory(id: string): Promise<ForumCategory | undefined>;
  getCategoryBySlug(slug: string): Promise<ForumCategory | undefined>;
  createCategory(category: InsertForumCategory): Promise<ForumCategory>;

  createPost(post: InsertForumPost): Promise<ForumPost>;
  getAllPosts(options: { categoryId?: string; sortBy?: string; limit?: number; offset?: number }): Promise<Array<ForumPost & { author: User; category: ForumCategory }>>;
  getPost(id: string): Promise<(ForumPost & { author: User; category: ForumCategory }) | undefined>;
  updatePost(id: string, updates: Partial<ForumPost>, userId: string): Promise<ForumPost>;
  deletePost(id: string, userId: string): Promise<void>;
  incrementViewCount(postId: string): Promise<void>;

  createReply(reply: InsertForumReply): Promise<ForumReply>;
  getPostReplies(postId: string): Promise<Array<ForumReply & { author: User }>>;
  markAsBestAnswer(replyId: string, postId: string, userId: string): Promise<ForumReply>;
  deleteReply(id: string, userId: string): Promise<void>;

  vote(vote: InsertForumVote): Promise<ForumVote>;
  removeVote(userId: string, targetType: string, targetId: string): Promise<void>;
  getUserVote(userId: string, targetType: string, targetId: string): Promise<ForumVote | undefined>;
  getVoteCounts(targetType: string, targetId: string): Promise<{ upvotes: number; downvotes: number }>;

  createReport(report: InsertForumReport): Promise<ForumReport>;
  getAllReports(): Promise<Array<ForumReport & { reporter: User; resolver?: User }>>;
  resolveReport(reportId: string, adminId: string, action: string): Promise<ForumReport>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private jobs: Map<string, Job>;
  private jobApplications: Map<string, JobApplication>;
  private ideas: Map<string, Idea>;
  private ideaInterests: Map<string, IdeaInterest>;
  private ideaUpvotes: Map<string, IdeaUpvote>;
  private ideaComments: Map<string, IdeaComment>;
  private ideaTeamApplications: Map<string, IdeaTeamApplication>;
  private skillSwapSessions: Map<string, SkillSwapSession>;
  private skillSwapReviews: Map<string, SkillSwapReview>;
  private broadcasts: Map<string, Broadcast>;
  private broadcastViews: Map<string, BroadcastView>;
  private adminActions: Map<string, AdminAction>;
  private messageReactions: Map<string, MessageReaction>;
  private readReceipts: Map<string, ReadReceipt>;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.jobs = new Map();
    this.jobApplications = new Map();
    this.ideas = new Map();
    this.ideaInterests = new Map();
    this.ideaUpvotes = new Map();
    this.ideaComments = new Map();
    this.ideaTeamApplications = new Map();
    this.skillSwapSessions = new Map();
    this.skillSwapReviews = new Map();
    this.broadcasts = new Map();
    this.broadcastViews = new Map();
    this.adminActions = new Map();
    this.messageReactions = new Map();
    this.readReceipts = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phoneNumber === phoneNumber,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      ...insertUser,
      linkedinUrl: insertUser.linkedinUrl || null,
      githubUrl: insertUser.githubUrl || null,
      profilePhotoUrl: insertUser.profilePhotoUrl || null,
      skillsToTeach: [],
      skillsToLearn: [],
      mentorRating: 0,
      totalSessionsTaught: 0,
      totalSessionsLearned: 0,
      companyHistory: [],
      specialties: [],
      points: 0,
      badges: [],
      isAdmin: 0,
      onboardingCompleted: 0,
      isActive: 1,
      profileVisibility: 'everyone',
      allowMessages: 'everyone',
      showEmail: 0,
      showPhone: 0,
      notificationPreferences: '{"jobs":true,"messages":true,"skillSwap":true,"ideas":true,"events":true,"forum":true}',
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserPointsAndBadges(id: string, points: number, badges: string[]): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { ...user, points, badges };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async searchUsers(filters: SearchFilters): Promise<User[]> {
    let results = Array.from(this.users.values());

    if (filters.excludeUserId) {
      results = results.filter(user => user.id !== filters.excludeUserId);
    }

    if (filters.techStack && filters.techStack.length > 0) {
      results = results.filter(user =>
        filters.techStack!.some(tech => user.techStack.includes(tech))
      );
    }

    if (filters.minExperience !== undefined) {
      results = results.filter(user => user.yearsOfExperience >= filters.minExperience!);
    }

    if (filters.maxExperience !== undefined) {
      results = results.filter(user => user.yearsOfExperience <= filters.maxExperience!);
    }

    if (filters.flatBlock) {
      results = results.filter(user => user.flatNumber.startsWith(filters.flatBlock!));
    }

    return results;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByCategory(categoryId: string, roleFilter?: 'provider' | 'seeker'): Promise<User[]> {
    let results = Array.from(this.users.values());
    
    // Filter by active users only
    results = results.filter(user => user.isActive === 1);
    
    // Filter by category
    results = results.filter(user => user.serviceCategories.includes(categoryId));
    
    // Filter by role if specified
    if (roleFilter) {
      results = results.filter(user => {
        const roles = (user.categoryRoles as Record<string, ('provider' | 'seeker')[]>)[categoryId];
        return roles && roles.includes(roleFilter);
      });
    }
    
    return results;
  }

  async getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    const existing = Array.from(this.conversations.values()).find(
      (conv) =>
        (conv.user1Id === user1Id && conv.user2Id === user2Id) ||
        (conv.user1Id === user2Id && conv.user2Id === user1Id)
    );

    if (existing) {
      return existing;
    }

    const id = randomUUID();
    const conversation: Conversation = {
      id,
      user1Id,
      user2Id,
      lastMessageAt: new Date(),
      createdAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getUserConversations(userId: string): Promise<Array<Conversation & { otherUser: User; unreadCount: number; lastMessage?: Message }>> {
    const userConvs = Array.from(this.conversations.values()).filter(
      (conv) => conv.user1Id === userId || conv.user2Id === userId
    );

    return userConvs.map((conv) => {
      const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
      const otherUser = this.users.get(otherUserId)!;
      
      const convMessages = Array.from(this.messages.values())
        .filter((msg) => msg.conversationId === conv.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      const unreadCount = convMessages.filter(
        (msg) => msg.senderId !== userId && msg.isRead === 0
      ).length;
      
      const lastMessage = convMessages[0];

      return {
        ...conv,
        otherUser,
        unreadCount,
        lastMessage,
      };
    }).sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    const isParticipant = await this.isConversationParticipant(conversationId, senderId);
    if (!isParticipant) {
      throw new Error('Unauthorized: Not a participant of this conversation');
    }

    const id = randomUUID();
    const message: Message = {
      id,
      conversationId,
      senderId,
      content,
      fileUrl: null,
      fileName: null,
      fileType: null,
      isRead: 0,
      createdAt: new Date(),
    };
    this.messages.set(id, message);

    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.lastMessageAt = new Date();
      this.conversations.set(conversationId, conversation);
    }

    return message;
  }

  async sendMessageWithFile(conversationId: string, senderId: string, content: string | null, fileUrl: string, fileName: string, fileType: string): Promise<Message> {
    const isParticipant = await this.isConversationParticipant(conversationId, senderId);
    if (!isParticipant) {
      throw new Error('Unauthorized: Not a participant of this conversation');
    }

    const id = randomUUID();
    const message: Message = {
      id,
      conversationId,
      senderId,
      content,
      fileUrl,
      fileName,
      fileType,
      isRead: 0,
      createdAt: new Date(),
    };
    this.messages.set(id, message);

    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.lastMessageAt = new Date();
      this.conversations.set(conversationId, conversation);
    }

    return message;
  }

  async isConversationParticipant(conversationId: string, userId: string): Promise<boolean> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;
    return conversation.user1Id === userId || conversation.user2Id === userId;
  }

  async getConversationMessages(conversationId: string, userId: string): Promise<Message[]> {
    const isParticipant = await this.isConversationParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new Error('Unauthorized: Not a participant of this conversation');
    }
    return Array.from(this.messages.values())
      .filter((msg) => msg.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const isParticipant = await this.isConversationParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new Error('Unauthorized: Not a participant of this conversation');
    }

    Array.from(this.messages.values())
      .filter((msg) => msg.conversationId === conversationId && msg.senderId !== userId)
      .forEach((msg) => {
        msg.isRead = 1;
        this.messages.set(msg.id, msg);
      });
  }

  async getUnreadCount(userId: string): Promise<number> {
    const userConvs = Array.from(this.conversations.values()).filter(
      (conv) => conv.user1Id === userId || conv.user2Id === userId
    );

    return Array.from(this.messages.values()).filter(
      (msg) =>
        userConvs.some((conv) => conv.id === msg.conversationId) &&
        msg.senderId !== userId &&
        msg.isRead === 0
    ).length;
  }

  async addMessageReaction(messageId: string, userId: string, emoji: string): Promise<MessageReaction> {
    const id = randomUUID();
    const reaction: MessageReaction = {
      id,
      messageId,
      userId,
      emoji,
      createdAt: new Date(),
    };
    this.messageReactions.set(id, reaction);
    return reaction;
  }

  async removeMessageReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    const toRemove = Array.from(this.messageReactions.entries()).find(
      ([_, reaction]) =>
        reaction.messageId === messageId &&
        reaction.userId === userId &&
        reaction.emoji === emoji
    );
    if (toRemove) {
      this.messageReactions.delete(toRemove[0]);
    }
  }

  async getMessageReactions(messageId: string): Promise<MessageReaction[]> {
    return Array.from(this.messageReactions.values())
      .filter((reaction) => reaction.messageId === messageId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async updateReadReceipt(conversationId: string, userId: string, lastReadMessageId?: string): Promise<void> {
    const existing = Array.from(this.readReceipts.values()).find(
      (receipt) => receipt.conversationId === conversationId && receipt.userId === userId
    );

    if (existing) {
      existing.lastReadMessageId = lastReadMessageId || null;
      existing.lastReadAt = new Date();
      this.readReceipts.set(existing.id, existing);
    } else {
      const id = randomUUID();
      const receipt: ReadReceipt = {
        id,
        conversationId,
        userId,
        lastReadMessageId: lastReadMessageId || null,
        lastReadAt: new Date(),
      };
      this.readReceipts.set(id, receipt);
    }
  }

  async getReadReceipts(conversationId: string, userId: string): Promise<ReadReceipt[]> {
    return Array.from(this.readReceipts.values())
      .filter((receipt) => receipt.conversationId === conversationId);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      id,
      ...insertJob,
      referralBonus: insertJob.referralBonus || null,
      attachmentUrl: insertJob.attachmentUrl || null,
      status: 'active',
      createdAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async getAllJobs(): Promise<Array<Job & { poster: User }>> {
    const allJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'active')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return allJobs.map(job => ({
      ...job,
      poster: this.users.get(job.posterId)!,
    }));
  }

  async getJob(id: string): Promise<(Job & { poster: User }) | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const poster = this.users.get(job.posterId);
    if (!poster) return undefined;
    
    return { ...job, poster };
  }

  async getUserJobs(userId: string): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.posterId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getJobCount(userId: string): Promise<number> {
    return Array.from(this.jobs.values())
      .filter(job => job.status === 'active' && job.posterId !== userId)
      .length;
  }

  async deleteJob(id: string, userId: string): Promise<void> {
    const job = this.jobs.get(id);
    if (!job) {
      throw new Error('Job not found');
    }
    if (job.posterId !== userId) {
      throw new Error('Unauthorized: You can only delete your own jobs');
    }
    this.jobs.delete(id);
  }

  async createJobApplication(insertApplication: InsertJobApplication): Promise<JobApplication> {
    const id = randomUUID();
    const application: JobApplication = {
      id,
      ...insertApplication,
      status: 'pending',
      createdAt: new Date(),
    };
    this.jobApplications.set(id, application);
    return application;
  }

  async getJobApplications(jobId: string): Promise<Array<JobApplication & { applicant: User }>> {
    const applications = Array.from(this.jobApplications.values())
      .filter(app => app.jobId === jobId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return applications.map(app => ({
      ...app,
      applicant: this.users.get(app.applicantId)!,
    }));
  }

  async getUserApplications(userId: string): Promise<Array<JobApplication & { job: Job }>> {
    const applications = Array.from(this.jobApplications.values())
      .filter(app => app.applicantId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return applications.map(app => ({
      ...app,
      job: this.jobs.get(app.jobId)!,
    }));
  }

  async hasUserApplied(jobId: string, userId: string): Promise<boolean> {
    return Array.from(this.jobApplications.values()).some(
      app => app.jobId === jobId && app.applicantId === userId
    );
  }

  async updateApplicationStatus(applicationId: string, status: string, userId: string): Promise<JobApplication> {
    const application = this.jobApplications.get(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const job = this.jobs.get(application.jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.posterId !== userId) {
      throw new Error('Unauthorized: Only the job poster can update application status');
    }

    const updatedApplication = { ...application, status };
    this.jobApplications.set(applicationId, updatedApplication);
    return updatedApplication;
  }

  async getJobApplicationStats(jobId: string): Promise<{ total: number; pending: number; underReview: number; shortlisted: number; accepted: number; rejected: number }> {
    const applications = Array.from(this.jobApplications.values()).filter(app => app.jobId === jobId);
    
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      underReview: applications.filter(app => app.status === 'under-review').length,
      shortlisted: applications.filter(app => app.status === 'shortlisted').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };
  }

  async withdrawApplication(applicationId: string, userId: string): Promise<void> {
    const application = this.jobApplications.get(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    if (application.applicantId !== userId) {
      throw new Error('Unauthorized: You can only withdraw your own applications');
    }

    this.jobApplications.delete(applicationId);
  }

  async createIdea(insertIdea: InsertIdea): Promise<Idea> {
    const idea: Idea = {
      id: randomUUID(),
      ...insertIdea,
      status: 'pending',
      interestCount: 0,
      upvoteCount: 0,
      commentCount: 0,
      createdAt: new Date(),
    };
    this.ideas.set(idea.id, idea);
    return idea;
  }

  async getAllIdeas(): Promise<Array<Idea & { poster: User }>> {
    const allIdeas = Array.from(this.ideas.values());
    return allIdeas.map(idea => {
      const poster = this.users.get(idea.posterId);
      if (!poster) throw new Error('Poster not found');
      return { ...idea, poster };
    });
  }

  async getApprovedIdeas(): Promise<Array<Idea & { poster: User }>> {
    const approvedIdeas = Array.from(this.ideas.values()).filter(idea => idea.status === 'approved');
    return approvedIdeas.map(idea => {
      const poster = this.users.get(idea.posterId);
      if (!poster) throw new Error('Poster not found');
      return { ...idea, poster };
    });
  }

  async getIdea(id: string): Promise<(Idea & { poster: User }) | undefined> {
    const idea = this.ideas.get(id);
    if (!idea) return undefined;
    const poster = this.users.get(idea.posterId);
    if (!poster) throw new Error('Poster not found');
    return { ...idea, poster };
  }

  async getUserIdeas(userId: string): Promise<Idea[]> {
    return Array.from(this.ideas.values()).filter(idea => idea.posterId === userId);
  }

  async updateIdea(id: string, updates: Partial<Idea>, userId: string): Promise<Idea> {
    const idea = this.ideas.get(id);
    if (!idea) {
      throw new Error('Idea not found');
    }

    if (idea.posterId !== userId) {
      throw new Error('Unauthorized: You can only update your own ideas');
    }

    const updatedIdea = { ...idea, ...updates };
    this.ideas.set(id, updatedIdea);
    return updatedIdea;
  }

  async deleteIdea(id: string, userId: string): Promise<void> {
    const idea = this.ideas.get(id);
    if (!idea) {
      throw new Error('Idea not found');
    }

    if (idea.posterId !== userId) {
      throw new Error('Unauthorized: You can only delete your own ideas');
    }

    this.ideas.delete(id);
    Array.from(this.ideaInterests.values())
      .filter(interest => interest.ideaId === id)
      .forEach(interest => this.ideaInterests.delete(interest.id));
  }

  async expressInterest(insertInterest: InsertIdeaInterest): Promise<IdeaInterest> {
    const interest: IdeaInterest = {
      id: randomUUID(),
      ...insertInterest,
      message: insertInterest.message || null,
      createdAt: new Date(),
    };
    this.ideaInterests.set(interest.id, interest);

    const idea = this.ideas.get(insertInterest.ideaId);
    if (idea) {
      idea.interestCount += 1;
      this.ideas.set(idea.id, idea);
    }

    return interest;
  }

  async getIdeaInterests(ideaId: string): Promise<Array<IdeaInterest & { user: User }>> {
    const interests = Array.from(this.ideaInterests.values()).filter(
      interest => interest.ideaId === ideaId
    );
    return interests.map(interest => {
      const user = this.users.get(interest.userId);
      if (!user) throw new Error('User not found');
      return { ...interest, user };
    });
  }

  async hasUserExpressedInterest(ideaId: string, userId: string): Promise<boolean> {
    return Array.from(this.ideaInterests.values()).some(
      interest => interest.ideaId === ideaId && interest.userId === userId
    );
  }

  async getInterestCountForUserIdeas(userId: string): Promise<number> {
    const userIdeas = Array.from(this.ideas.values()).filter(idea => idea.posterId === userId);
    return userIdeas.reduce((total, idea) => total + idea.interestCount, 0);
  }

  async toggleUpvote(ideaId: string, userId: string): Promise<{ upvoted: boolean; upvoteCount: number }> {
    const existing = Array.from(this.ideaUpvotes.values()).find(
      upvote => upvote.ideaId === ideaId && upvote.userId === userId
    );

    const idea = this.ideas.get(ideaId);
    if (!idea) throw new Error('Idea not found');

    if (existing) {
      this.ideaUpvotes.delete(existing.id);
      const updatedIdea = { ...idea, upvoteCount: idea.upvoteCount - 1 };
      this.ideas.set(ideaId, updatedIdea);
      return { upvoted: false, upvoteCount: updatedIdea.upvoteCount };
    } else {
      const upvote: IdeaUpvote = {
        id: randomUUID(),
        ideaId,
        userId,
        createdAt: new Date(),
      };
      this.ideaUpvotes.set(upvote.id, upvote);
      const updatedIdea = { ...idea, upvoteCount: idea.upvoteCount + 1 };
      this.ideas.set(ideaId, updatedIdea);
      return { upvoted: true, upvoteCount: updatedIdea.upvoteCount };
    }
  }

  async hasUserUpvoted(ideaId: string, userId: string): Promise<boolean> {
    return Array.from(this.ideaUpvotes.values()).some(
      upvote => upvote.ideaId === ideaId && upvote.userId === userId
    );
  }

  async createComment(insertComment: InsertIdeaComment): Promise<IdeaComment> {
    const comment: IdeaComment = {
      id: randomUUID(),
      ...insertComment,
      createdAt: new Date(),
    };
    this.ideaComments.set(comment.id, comment);

    const idea = this.ideas.get(insertComment.ideaId);
    if (idea) {
      const updatedIdea = { ...idea, commentCount: idea.commentCount + 1 };
      this.ideas.set(idea.id, updatedIdea);
    }

    return comment;
  }

  async getIdeaComments(ideaId: string): Promise<Array<IdeaComment & { user: User }>> {
    const comments = Array.from(this.ideaComments.values()).filter(
      comment => comment.ideaId === ideaId
    );
    return comments.map(comment => {
      const user = this.users.get(comment.userId);
      if (!user) throw new Error('User not found');
      return { ...comment, user };
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = this.ideaComments.get(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own comments');
    }

    this.ideaComments.delete(commentId);

    const idea = this.ideas.get(comment.ideaId);
    if (idea) {
      const updatedIdea = { ...idea, commentCount: Math.max(0, idea.commentCount - 1) };
      this.ideas.set(idea.id, updatedIdea);
    }
  }

  async applyToTeam(insertApplication: InsertIdeaTeamApplication): Promise<IdeaTeamApplication> {
    const application: IdeaTeamApplication = {
      id: randomUUID(),
      ...insertApplication,
      status: 'pending',
      createdAt: new Date(),
    };
    this.ideaTeamApplications.set(application.id, application);
    return application;
  }

  async getIdeaTeamApplications(ideaId: string): Promise<Array<IdeaTeamApplication & { applicant: User }>> {
    const applications = Array.from(this.ideaTeamApplications.values()).filter(
      app => app.ideaId === ideaId
    );
    return applications.map(app => {
      const applicant = this.users.get(app.applicantId);
      if (!applicant) throw new Error('User not found');
      return { ...app, applicant };
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserTeamApplications(userId: string): Promise<Array<IdeaTeamApplication & { idea: Idea }>> {
    const applications = Array.from(this.ideaTeamApplications.values()).filter(
      app => app.applicantId === userId
    );
    return applications.map(app => {
      const idea = this.ideas.get(app.ideaId);
      if (!idea) throw new Error('Idea not found');
      return { ...app, idea };
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async hasUserAppliedToTeam(ideaId: string, userId: string): Promise<boolean> {
    return Array.from(this.ideaTeamApplications.values()).some(
      app => app.ideaId === ideaId && app.applicantId === userId
    );
  }

  async updateTeamApplicationStatus(applicationId: string, status: string, userId: string): Promise<IdeaTeamApplication> {
    const application = this.ideaTeamApplications.get(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const idea = this.ideas.get(application.ideaId);
    if (!idea) {
      throw new Error('Idea not found');
    }

    if (idea.posterId !== userId) {
      throw new Error('Unauthorized: Only idea owner can update application status');
    }

    const updatedApplication = { ...application, status };
    this.ideaTeamApplications.set(applicationId, updatedApplication);
    return updatedApplication;
  }

  async getAcceptedTeamMembers(ideaId: string): Promise<Array<IdeaTeamApplication & { applicant: User }>> {
    const applications = Array.from(this.ideaTeamApplications.values()).filter(
      app => app.ideaId === ideaId && app.status === 'accepted'
    );
    return applications.map(app => {
      const applicant = this.users.get(app.applicantId);
      if (!applicant) throw new Error('User not found');
      return { ...app, applicant };
    });
  }

  async withdrawTeamApplication(applicationId: string, userId: string): Promise<void> {
    const application = this.ideaTeamApplications.get(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    if (application.applicantId !== userId) {
      throw new Error('Unauthorized: You can only withdraw your own applications');
    }

    if (application.status !== 'pending') {
      throw new Error('Can only withdraw pending applications');
    }

    this.ideaTeamApplications.delete(applicationId);
  }

  async getTeamApplicationStats(ideaId: string): Promise<{ total: number; pending: number; accepted: number; rejected: number }> {
    const applications = Array.from(this.ideaTeamApplications.values()).filter(
      app => app.ideaId === ideaId
    );

    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };
  }

  async updateUserSkills(userId: string, skillsToTeach: string[], skillsToLearn: string[]): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { ...user, skillsToTeach, skillsToLearn };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserSettings(userId: string, settings: Partial<Pick<User, 'isActive' | 'profileVisibility' | 'allowMessages' | 'showEmail' | 'showPhone' | 'notificationPreferences'>>): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { ...user, ...settings };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getUserSettings(userId: string): Promise<Pick<User, 'isActive' | 'profileVisibility' | 'allowMessages' | 'showEmail' | 'showPhone' | 'notificationPreferences'>> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      isActive: user.isActive,
      profileVisibility: user.profileVisibility,
      allowMessages: user.allowMessages,
      showEmail: user.showEmail,
      showPhone: user.showPhone,
      notificationPreferences: user.notificationPreferences,
    };
  }

  async findMentors(userId: string, skillToLearn?: string): Promise<User[]> {
    const currentUser = this.users.get(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    let mentors = Array.from(this.users.values()).filter(user => {
      if (user.id === userId) return false;
      if (user.skillsToTeach.length === 0) return false;
      
      if (skillToLearn) {
        return user.skillsToTeach.includes(skillToLearn);
      } else {
        return currentUser.skillsToLearn.some(skill => user.skillsToTeach.includes(skill));
      }
    });

    return mentors.sort((a, b) => b.mentorRating - a.mentorRating);
  }

  async createSkillSwapSession(insertSession: InsertSkillSwapSession): Promise<SkillSwapSession> {
    const id = randomUUID();
    const meetingLink = `https://meet.google.com/${randomUUID().substring(0, 3)}-${randomUUID().substring(0, 4)}-${randomUUID().substring(0, 3)}`;
    
    const session: SkillSwapSession = {
      id,
      ...insertSession,
      duration: insertSession.duration || 60,
      meetingLink: insertSession.meetingLink || meetingLink,
      calendarEventId: insertSession.calendarEventId || null,
      message: insertSession.message || null,
      status: 'scheduled',
      createdAt: new Date(),
    };
    this.skillSwapSessions.set(id, session);

    const mentor = this.users.get(insertSession.mentorId);
    if (mentor) {
      mentor.totalSessionsTaught += 1;
      this.users.set(mentor.id, mentor);
    }

    const learner = this.users.get(insertSession.learnerId);
    if (learner) {
      learner.totalSessionsLearned += 1;
      this.users.set(learner.id, learner);
    }

    return session;
  }

  async getUserSessions(userId: string): Promise<Array<SkillSwapSession & { mentor: User; learner: User }>> {
    const sessions = Array.from(this.skillSwapSessions.values())
      .filter(session => session.mentorId === userId || session.learnerId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return sessions.map(session => {
      const mentor = this.users.get(session.mentorId);
      const learner = this.users.get(session.learnerId);
      if (!mentor || !learner) throw new Error('User not found');
      return { ...session, mentor, learner };
    });
  }

  async getSession(sessionId: string): Promise<(SkillSwapSession & { mentor: User; learner: User }) | undefined> {
    const session = this.skillSwapSessions.get(sessionId);
    if (!session) return undefined;

    const mentor = this.users.get(session.mentorId);
    const learner = this.users.get(session.learnerId);
    if (!mentor || !learner) return undefined;

    return { ...session, mentor, learner };
  }

  async updateSessionStatus(sessionId: string, status: string, userId: string): Promise<SkillSwapSession> {
    const session = this.skillSwapSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.mentorId !== userId && session.learnerId !== userId) {
      throw new Error('Unauthorized: Only session participants can update status');
    }

    const updatedSession = { ...session, status };
    this.skillSwapSessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async cancelSession(sessionId: string, userId: string): Promise<void> {
    const session = this.skillSwapSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.mentorId !== userId && session.learnerId !== userId) {
      throw new Error('Unauthorized: Only session participants can cancel');
    }

    this.skillSwapSessions.delete(sessionId);

    const mentor = this.users.get(session.mentorId);
    if (mentor && mentor.totalSessionsTaught > 0) {
      mentor.totalSessionsTaught -= 1;
      this.users.set(mentor.id, mentor);
    }

    const learner = this.users.get(session.learnerId);
    if (learner && learner.totalSessionsLearned > 0) {
      learner.totalSessionsLearned -= 1;
      this.users.set(learner.id, learner);
    }
  }

  async createReview(insertReview: InsertSkillSwapReview): Promise<SkillSwapReview> {
    const id = randomUUID();
    const review: SkillSwapReview = {
      id,
      ...insertReview,
      comment: insertReview.comment || null,
      createdAt: new Date(),
    };
    this.skillSwapReviews.set(id, review);

    const reviewee = this.users.get(insertReview.revieweeId);
    if (reviewee) {
      const reviews = Array.from(this.skillSwapReviews.values()).filter(
        r => r.revieweeId === insertReview.revieweeId
      );
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = Math.round(totalRating / reviews.length);
      
      reviewee.mentorRating = averageRating;
      this.users.set(reviewee.id, reviewee);
    }

    return review;
  }

  async getUserReviews(userId: string): Promise<SkillSwapReview[]> {
    return Array.from(this.skillSwapReviews.values())
      .filter(review => review.revieweeId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async hasUserReviewedSession(sessionId: string, userId: string): Promise<boolean> {
    return Array.from(this.skillSwapReviews.values()).some(
      review => review.sessionId === sessionId && review.reviewerId === userId
    );
  }

  async getMentorStats(userId: string): Promise<{ averageRating: number; totalReviews: number; totalSessionsTaught: number }> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const reviews = Array.from(this.skillSwapReviews.values()).filter(
      review => review.revieweeId === userId
    );

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews)
      : 0;

    return {
      averageRating,
      totalReviews,
      totalSessionsTaught: user.totalSessionsTaught,
    };
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    return user?.isAdmin === 1;
  }

  async getPendingIdeas(): Promise<Array<Idea & { poster: User }>> {
    const pendingIdeas = Array.from(this.ideas.values())
      .filter(idea => idea.status === 'pending')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return pendingIdeas.map(idea => {
      const poster = this.users.get(idea.posterId);
      if (!poster) throw new Error('Poster not found');
      return { ...idea, poster };
    });
  }

  async approveIdea(ideaId: string, adminId: string): Promise<Idea> {
    const idea = this.ideas.get(ideaId);
    if (!idea) {
      throw new Error('Idea not found');
    }

    const updatedIdea = { ...idea, status: 'approved' };
    this.ideas.set(ideaId, updatedIdea);

    await this.logAdminAction({
      adminId,
      actionType: 'approve_idea',
      targetType: 'idea',
      targetId: ideaId,
      details: `Approved idea: ${idea.title}`,
    });

    return updatedIdea;
  }

  async rejectIdea(ideaId: string, adminId: string, reason: string): Promise<Idea> {
    const idea = this.ideas.get(ideaId);
    if (!idea) {
      throw new Error('Idea not found');
    }

    const updatedIdea = { ...idea, status: 'rejected' };
    this.ideas.set(ideaId, updatedIdea);

    await this.logAdminAction({
      adminId,
      actionType: 'reject_idea',
      targetType: 'idea',
      targetId: ideaId,
      details: `Rejected idea: ${idea.title}. Reason: ${reason}`,
    });

    return updatedIdea;
  }

  async getAnalytics(): Promise<{
    totalUsers: number;
    totalIdeas: number;
    pendingIdeas: number;
    approvedIdeas: number;
    rejectedIdeas: number;
    totalJobs: number;
    totalSessions: number;
    recentActivity: Array<{ type: string; count: number; date: string }>;
  }> {
    const allIdeas = Array.from(this.ideas.values());
    
    return {
      totalUsers: this.users.size,
      totalIdeas: allIdeas.length,
      pendingIdeas: allIdeas.filter(i => i.status === 'pending').length,
      approvedIdeas: allIdeas.filter(i => i.status === 'approved').length,
      rejectedIdeas: allIdeas.filter(i => i.status === 'rejected').length,
      totalJobs: this.jobs.size,
      totalSessions: this.skillSwapSessions.size,
      recentActivity: [],
    };
  }

  async createBroadcast(insertBroadcast: InsertBroadcast): Promise<Broadcast> {
    const id = randomUUID();
    const broadcast: Broadcast = {
      id,
      ...insertBroadcast,
      scheduledFor: insertBroadcast.scheduledFor || null,
      sentAt: new Date(),
      createdAt: new Date(),
    };
    this.broadcasts.set(id, broadcast);

    await this.logAdminAction({
      adminId: insertBroadcast.createdBy,
      actionType: 'create_broadcast',
      targetType: 'broadcast',
      targetId: id,
      details: `Created broadcast: ${insertBroadcast.title}`,
    });

    return broadcast;
  }

  async getAllBroadcasts(): Promise<Array<Broadcast & { admin: User; viewCount: number }>> {
    const allBroadcasts = Array.from(this.broadcasts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return allBroadcasts.map(broadcast => {
      const admin = this.users.get(broadcast.createdBy);
      if (!admin) throw new Error('Admin not found');
      
      const viewCount = Array.from(this.broadcastViews.values())
        .filter(view => view.broadcastId === broadcast.id).length;

      return { ...broadcast, admin, viewCount };
    });
  }

  async getLatestBroadcast(userId: string): Promise<(Broadcast & { admin: User; hasViewed: boolean; hasDismissed: boolean }) | undefined> {
    const latestBroadcast = Array.from(this.broadcasts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!latestBroadcast) return undefined;

    const admin = this.users.get(latestBroadcast.createdBy);
    if (!admin) return undefined;

    const userView = Array.from(this.broadcastViews.values()).find(
      view => view.broadcastId === latestBroadcast.id && view.userId === userId
    );

    return {
      ...latestBroadcast,
      admin,
      hasViewed: !!userView,
      hasDismissed: userView?.dismissed === 1,
    };
  }

  async markBroadcastAsViewed(broadcastId: string, userId: string): Promise<void> {
    const existing = Array.from(this.broadcastViews.values()).find(
      view => view.broadcastId === broadcastId && view.userId === userId
    );

    if (!existing) {
      const id = randomUUID();
      const view: BroadcastView = {
        id,
        broadcastId,
        userId,
        dismissed: 0,
        viewedAt: new Date(),
      };
      this.broadcastViews.set(id, view);
    }
  }

  async dismissBroadcast(broadcastId: string, userId: string): Promise<void> {
    const existing = Array.from(this.broadcastViews.values()).find(
      view => view.broadcastId === broadcastId && view.userId === userId
    );

    if (existing) {
      existing.dismissed = 1;
      this.broadcastViews.set(existing.id, existing);
    } else {
      const id = randomUUID();
      const view: BroadcastView = {
        id,
        broadcastId,
        userId,
        dismissed: 1,
        viewedAt: new Date(),
      };
      this.broadcastViews.set(id, view);
    }
  }

  async logAdminAction(insertAction: InsertAdminAction): Promise<AdminAction> {
    const id = randomUUID();
    const action: AdminAction = {
      id,
      ...insertAction,
      details: insertAction.details || null,
      createdAt: new Date(),
    };
    this.adminActions.set(id, action);
    return action;
  }

  async getAdminActions(filters?: { adminId?: string; actionType?: string; startDate?: Date; endDate?: Date }): Promise<Array<AdminAction & { admin: User }>> {
    let actions = Array.from(this.adminActions.values());

    if (filters?.adminId) {
      actions = actions.filter(a => a.adminId === filters.adminId);
    }
    if (filters?.actionType) {
      actions = actions.filter(a => a.actionType === filters.actionType);
    }
    if (filters?.startDate) {
      actions = actions.filter(a => a.createdAt >= filters.startDate!);
    }
    if (filters?.endDate) {
      actions = actions.filter(a => a.createdAt <= filters.endDate!);
    }

    actions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return actions.map(action => {
      const admin = this.users.get(action.adminId);
      if (!admin) throw new Error('Admin not found');
      return { ...action, admin };
    });
  }

  async getAllCategories(): Promise<ForumCategory[]> {
    throw new Error('Not implemented');
  }

  async getCategory(id: string): Promise<ForumCategory | undefined> {
    throw new Error('Not implemented');
  }

  async getCategoryBySlug(slug: string): Promise<ForumCategory | undefined> {
    throw new Error('Not implemented');
  }

  async createCategory(category: InsertForumCategory): Promise<ForumCategory> {
    throw new Error('Not implemented');
  }

  async createPost(post: InsertForumPost): Promise<ForumPost> {
    throw new Error('Not implemented');
  }

  async getAllPosts(options: { categoryId?: string; sortBy?: string; limit?: number; offset?: number }): Promise<Array<ForumPost & { author: User; category: ForumCategory }>> {
    throw new Error('Not implemented');
  }

  async getPost(id: string): Promise<(ForumPost & { author: User; category: ForumCategory }) | undefined> {
    throw new Error('Not implemented');
  }

  async updatePost(id: string, updates: Partial<ForumPost>, userId: string): Promise<ForumPost> {
    throw new Error('Not implemented');
  }

  async deletePost(id: string, userId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async incrementViewCount(postId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async createReply(reply: InsertForumReply): Promise<ForumReply> {
    throw new Error('Not implemented');
  }

  async getPostReplies(postId: string): Promise<Array<ForumReply & { author: User }>> {
    throw new Error('Not implemented');
  }

  async markAsBestAnswer(replyId: string, postId: string, userId: string): Promise<ForumReply> {
    throw new Error('Not implemented');
  }

  async deleteReply(id: string, userId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async vote(vote: InsertForumVote): Promise<ForumVote> {
    throw new Error('Not implemented');
  }

  async removeVote(userId: string, targetType: string, targetId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getUserVote(userId: string, targetType: string, targetId: string): Promise<ForumVote | undefined> {
    throw new Error('Not implemented');
  }

  async getVoteCounts(targetType: string, targetId: string): Promise<{ upvotes: number; downvotes: number }> {
    throw new Error('Not implemented');
  }

  async createReport(report: InsertForumReport): Promise<ForumReport> {
    throw new Error('Not implemented');
  }

  async getAllReports(): Promise<Array<ForumReport & { reporter: User; resolver?: User }>> {
    throw new Error('Not implemented');
  }

  async resolveReport(reportId: string, adminId: string, action: string): Promise<ForumReport> {
    throw new Error('Not implemented');
  }
}

export class PostgresStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserPointsAndBadges(id: string, points: number, badges: string[]): Promise<User> {
    const result = await db
      .update(users)
      .set({ points, badges })
      .where(eq(users.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error('User not found');
    }
    
    return result[0];
  }

  async searchUsers(filters: SearchFilters): Promise<User[]> {
    const conditions = [];

    if (filters.excludeUserId) {
      conditions.push(sql`${users.id} != ${filters.excludeUserId}`);
    }

    if (filters.techStack && filters.techStack.length > 0) {
      conditions.push(
        sql`${users.techStack} && ARRAY[${sql.join(filters.techStack.map(tech => sql`${tech}`), sql`, `)}]::text[]`
      );
    }

    if (filters.minExperience !== undefined) {
      conditions.push(gte(users.yearsOfExperience, filters.minExperience));
    }

    if (filters.maxExperience !== undefined) {
      conditions.push(lte(users.yearsOfExperience, filters.maxExperience));
    }

    if (filters.flatBlock) {
      conditions.push(like(users.flatNumber, `${filters.flatBlock}%`));
    }

    if (conditions.length === 0) {
      return await db.select().from(users);
    }

    return await db.select().from(users).where(and(...conditions));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByCategory(categoryId: string, roleFilter?: 'provider' | 'seeker'): Promise<User[]> {
    const conditions = [
      eq(users.isActive, 1),
      sql`${users.serviceCategories} @> ARRAY[${categoryId}]::text[]`
    ];

    if (roleFilter) {
      // Check if categoryRoles jsonb contains the role in the category's array
      // categoryRoles format: {"categoryId": ["provider", "seeker"]}
      conditions.push(
        sql`${users.categoryRoles}->>${categoryId} LIKE '%${roleFilter}%'`
      );
    }

    return await db.select().from(users).where(and(...conditions));
  }

  async getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    const existing = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(eq(conversations.user1Id, user1Id), eq(conversations.user2Id, user2Id)),
          and(eq(conversations.user1Id, user2Id), eq(conversations.user2Id, user1Id))
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db
      .insert(conversations)
      .values({ user1Id, user2Id, lastMessageAt: new Date() })
      .returning();
    
    return result[0];
  }

  async getUserConversations(userId: string): Promise<Array<Conversation & { otherUser: User; unreadCount: number; lastMessage?: Message }>> {
    const userConvs = await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.user1Id, userId),
          eq(conversations.user2Id, userId)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));

    const result = await Promise.all(
      userConvs.map(async (conv) => {
        const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
        const otherUserResult = await db
          .select()
          .from(users)
          .where(eq(users.id, otherUserId))
          .limit(1);
        
        const otherUser = otherUserResult[0];

        const unreadMessages = await db
          .select()
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conv.id),
              eq(messages.isRead, 0),
              sql`${messages.senderId} != ${userId}`
            )
          );

        const lastMessageResult = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        return {
          ...conv,
          otherUser,
          unreadCount: unreadMessages.length,
          lastMessage: lastMessageResult[0],
        };
      })
    );

    return result;
  }

  async isConversationParticipant(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          or(
            eq(conversations.user1Id, userId),
            eq(conversations.user2Id, userId)
          )
        )
      )
      .limit(1);

    return conversation.length > 0;
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    const isParticipant = await this.isConversationParticipant(conversationId, senderId);
    if (!isParticipant) {
      throw new Error('Unauthorized: Not a participant of this conversation');
    }

    const result = await db
      .insert(messages)
      .values({ conversationId, senderId, content, isRead: 0 })
      .returning();

    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return result[0];
  }

  async sendMessageWithFile(conversationId: string, senderId: string, content: string | null, fileUrl: string, fileName: string, fileType: string): Promise<Message> {
    const isParticipant = await this.isConversationParticipant(conversationId, senderId);
    if (!isParticipant) {
      throw new Error('Unauthorized: Not a participant of this conversation');
    }

    const result = await db
      .insert(messages)
      .values({ 
        conversationId, 
        senderId, 
        content, 
        fileUrl,
        fileName,
        fileType,
        isRead: 0 
      })
      .returning();

    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return result[0];
  }

  async getConversationMessages(conversationId: string, userId: string): Promise<Message[]> {
    const isParticipant = await this.isConversationParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new Error('Unauthorized: Not a participant of this conversation');
    }

    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const isParticipant = await this.isConversationParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new Error('Unauthorized: Not a participant of this conversation');
    }

    await db
      .update(messages)
      .set({ isRead: 1 })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`${messages.senderId} != ${userId}`
        )
      );
  }

  async getUnreadCount(userId: string): Promise<number> {
    const userConvs = await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.user1Id, userId),
          eq(conversations.user2Id, userId)
        )
      );

    const conversationIds = userConvs.map((conv) => conv.id);
    
    if (conversationIds.length === 0) {
      return 0;
    }

    const unreadMessages = await db
      .select()
      .from(messages)
      .where(
        and(
          sql`${messages.conversationId} = ANY(ARRAY[${sql.join(conversationIds.map(id => sql`${id}`), sql`, `)}]::varchar[])`,
          eq(messages.isRead, 0),
          sql`${messages.senderId} != ${userId}`
        )
      );

    return unreadMessages.length;
  }

  async addMessageReaction(messageId: string, userId: string, emoji: string): Promise<MessageReaction> {
    const existing = await db
      .select()
      .from(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, messageId),
          eq(messageReactions.userId, userId),
          eq(messageReactions.emoji, emoji)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db
      .insert(messageReactions)
      .values({ messageId, userId, emoji })
      .returning();

    return result[0];
  }

  async removeMessageReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    await db
      .delete(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, messageId),
          eq(messageReactions.userId, userId),
          eq(messageReactions.emoji, emoji)
        )
      );
  }

  async getMessageReactions(messageId: string): Promise<MessageReaction[]> {
    return await db
      .select()
      .from(messageReactions)
      .where(eq(messageReactions.messageId, messageId))
      .orderBy(messageReactions.createdAt);
  }

  async updateReadReceipt(conversationId: string, userId: string, lastReadMessageId?: string): Promise<void> {
    const isParticipant = await this.isConversationParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new Error('Unauthorized: Not a participant of this conversation');
    }

    const existing = await db
      .select()
      .from(readReceipts)
      .where(
        and(
          eq(readReceipts.conversationId, conversationId),
          eq(readReceipts.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(readReceipts)
        .set({
          lastReadMessageId: lastReadMessageId || null,
          lastReadAt: new Date(),
        })
        .where(eq(readReceipts.id, existing[0].id));
    } else {
      await db
        .insert(readReceipts)
        .values({
          conversationId,
          userId,
          lastReadMessageId: lastReadMessageId || null,
        });
    }
  }

  async getReadReceipts(conversationId: string, userId: string): Promise<ReadReceipt[]> {
    const isParticipant = await this.isConversationParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new Error('Unauthorized: Not a participant of this conversation');
    }

    return await db
      .select()
      .from(readReceipts)
      .where(eq(readReceipts.conversationId, conversationId));
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const result = await db.insert(jobs).values(insertJob).returning();
    return result[0];
  }

  async getAllJobs(): Promise<Array<Job & { poster: User }>> {
    const allJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.status, 'active'))
      .orderBy(desc(jobs.createdAt));

    const result = await Promise.all(
      allJobs.map(async (job) => {
        const posterResult = await db
          .select()
          .from(users)
          .where(eq(users.id, job.posterId))
          .limit(1);
        
        return {
          ...job,
          poster: posterResult[0],
        };
      })
    );

    return result;
  }

  async getJob(id: string): Promise<(Job & { poster: User }) | undefined> {
    const jobResult = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1);

    if (jobResult.length === 0) return undefined;

    const posterResult = await db
      .select()
      .from(users)
      .where(eq(users.id, jobResult[0].posterId))
      .limit(1);

    if (posterResult.length === 0) return undefined;

    return {
      ...jobResult[0],
      poster: posterResult[0],
    };
  }

  async getUserJobs(userId: string): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.posterId, userId))
      .orderBy(desc(jobs.createdAt));
  }

  async getJobCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobs)
      .where(and(
        eq(jobs.status, 'active'),
        ne(jobs.posterId, userId)
      ));
    
    return result[0]?.count || 0;
  }

  async deleteJob(id: string, userId: string): Promise<void> {
    const jobResult = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1);

    if (jobResult.length === 0) {
      throw new Error('Job not found');
    }

    if (jobResult[0].posterId !== userId) {
      throw new Error('Unauthorized: You can only delete your own jobs');
    }

    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async createJobApplication(insertApplication: InsertJobApplication): Promise<JobApplication> {
    const result = await db.insert(jobApplications).values(insertApplication).returning();
    return result[0];
  }

  async getJobApplications(jobId: string): Promise<Array<JobApplication & { applicant: User }>> {
    const applications = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.jobId, jobId))
      .orderBy(desc(jobApplications.createdAt));

    const result = await Promise.all(
      applications.map(async (app) => {
        const applicantResult = await db
          .select()
          .from(users)
          .where(eq(users.id, app.applicantId))
          .limit(1);
        
        return {
          ...app,
          applicant: applicantResult[0],
        };
      })
    );

    return result;
  }

  async getUserApplications(userId: string): Promise<Array<JobApplication & { job: Job }>> {
    const applications = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.applicantId, userId))
      .orderBy(desc(jobApplications.createdAt));

    const result = await Promise.all(
      applications.map(async (app) => {
        const jobResult = await db
          .select()
          .from(jobs)
          .where(eq(jobs.id, app.jobId))
          .limit(1);
        
        return {
          ...app,
          job: jobResult[0],
        };
      })
    );

    return result;
  }

  async hasUserApplied(jobId: string, userId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.jobId, jobId),
          eq(jobApplications.applicantId, userId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  async updateApplicationStatus(applicationId: string, status: string, userId: string): Promise<JobApplication> {
    const applicationResult = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.id, applicationId))
      .limit(1);

    if (applicationResult.length === 0) {
      throw new Error('Application not found');
    }

    const application = applicationResult[0];

    const jobResult = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, application.jobId))
      .limit(1);

    if (jobResult.length === 0) {
      throw new Error('Job not found');
    }

    if (jobResult[0].posterId !== userId) {
      throw new Error('Unauthorized: Only the job poster can update application status');
    }

    const result = await db
      .update(jobApplications)
      .set({ status })
      .where(eq(jobApplications.id, applicationId))
      .returning();

    return result[0];
  }

  async getJobApplicationStats(jobId: string): Promise<{ total: number; pending: number; underReview: number; shortlisted: number; accepted: number; rejected: number }> {
    const applications = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.jobId, jobId));
    
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      underReview: applications.filter(app => app.status === 'under-review').length,
      shortlisted: applications.filter(app => app.status === 'shortlisted').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };
  }

  async withdrawApplication(applicationId: string, userId: string): Promise<void> {
    const applicationResult = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.id, applicationId))
      .limit(1);

    if (applicationResult.length === 0) {
      throw new Error('Application not found');
    }

    if (applicationResult[0].applicantId !== userId) {
      throw new Error('Unauthorized: You can only withdraw your own applications');
    }

    await db.delete(jobApplications).where(eq(jobApplications.id, applicationId));
  }

  async createIdea(insertIdea: InsertIdea): Promise<Idea> {
    const result = await db.insert(ideas).values(insertIdea).returning();
    return result[0];
  }

  async getAllIdeas(): Promise<Array<Idea & { poster: User }>> {
    const result = await db
      .select()
      .from(ideas)
      .leftJoin(users, eq(ideas.posterId, users.id))
      .orderBy(desc(ideas.createdAt));

    return result.map(row => ({
      ...row.ideas,
      poster: row.users!,
    }));
  }

  async getApprovedIdeas(): Promise<Array<Idea & { poster: User }>> {
    const result = await db
      .select()
      .from(ideas)
      .leftJoin(users, eq(ideas.posterId, users.id))
      .where(eq(ideas.status, 'approved'))
      .orderBy(desc(ideas.createdAt));

    return result.map(row => ({
      ...row.ideas,
      poster: row.users!,
    }));
  }

  async getIdea(id: string): Promise<(Idea & { poster: User }) | undefined> {
    const result = await db
      .select()
      .from(ideas)
      .leftJoin(users, eq(ideas.posterId, users.id))
      .where(eq(ideas.id, id))
      .limit(1);

    if (result.length === 0) return undefined;

    return {
      ...result[0].ideas,
      poster: result[0].users!,
    };
  }

  async getUserIdeas(userId: string): Promise<Idea[]> {
    return await db
      .select()
      .from(ideas)
      .where(eq(ideas.posterId, userId))
      .orderBy(desc(ideas.createdAt));
  }

  async getInterestedIdeasForUser(userId: string): Promise<IdeaInterest[]> {
    return await db
      .select()
      .from(ideaInterests)
      .where(eq(ideaInterests.userId, userId))
      .orderBy(desc(ideaInterests.createdAt));
  }

  async updateIdea(id: string, updates: Partial<Idea>, userId: string): Promise<Idea> {
    const ideaResult = await db
      .select()
      .from(ideas)
      .where(eq(ideas.id, id))
      .limit(1);

    if (ideaResult.length === 0) {
      throw new Error('Idea not found');
    }

    if (ideaResult[0].posterId !== userId) {
      throw new Error('Unauthorized: You can only update your own ideas');
    }

    const result = await db
      .update(ideas)
      .set(updates)
      .where(eq(ideas.id, id))
      .returning();

    return result[0];
  }

  async deleteIdea(id: string, userId: string): Promise<void> {
    const ideaResult = await db
      .select()
      .from(ideas)
      .where(eq(ideas.id, id))
      .limit(1);

    if (ideaResult.length === 0) {
      throw new Error('Idea not found');
    }

    if (ideaResult[0].posterId !== userId) {
      throw new Error('Unauthorized: You can only delete your own ideas');
    }

    await db.delete(ideaInterests).where(eq(ideaInterests.ideaId, id));
    await db.delete(ideas).where(eq(ideas.id, id));
  }

  async expressInterest(insertInterest: InsertIdeaInterest): Promise<IdeaInterest> {
    const result = await db.insert(ideaInterests).values(insertInterest).returning();
    
    await db
      .update(ideas)
      .set({ interestCount: sql`${ideas.interestCount} + 1` })
      .where(eq(ideas.id, insertInterest.ideaId));

    return result[0];
  }

  async getIdeaInterests(ideaId: string): Promise<Array<IdeaInterest & { user: User }>> {
    const result = await db
      .select()
      .from(ideaInterests)
      .leftJoin(users, eq(ideaInterests.userId, users.id))
      .where(eq(ideaInterests.ideaId, ideaId))
      .orderBy(desc(ideaInterests.createdAt));

    return result.map(row => ({
      ...row.idea_interests,
      user: row.users!,
    }));
  }

  async hasUserExpressedInterest(ideaId: string, userId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(ideaInterests)
      .where(and(
        eq(ideaInterests.ideaId, ideaId),
        eq(ideaInterests.userId, userId)
      ))
      .limit(1);

    return result.length > 0;
  }

  async getInterestCountForUserIdeas(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COALESCE(SUM(${ideas.interestCount}), 0)` })
      .from(ideas)
      .where(eq(ideas.posterId, userId));

    return Number(result[0]?.count || 0);
  }

  async toggleUpvote(ideaId: string, userId: string): Promise<{ upvoted: boolean; upvoteCount: number }> {
    const existing = await db
      .select()
      .from(ideaUpvotes)
      .where(and(
        eq(ideaUpvotes.ideaId, ideaId),
        eq(ideaUpvotes.userId, userId)
      ))
      .limit(1);

    if (existing.length > 0) {
      await db.delete(ideaUpvotes).where(eq(ideaUpvotes.id, existing[0].id));
      await db.update(ideas)
        .set({ upvoteCount: sql`${ideas.upvoteCount} - 1` })
        .where(eq(ideas.id, ideaId));
    } else {
      await db.insert(ideaUpvotes).values({ ideaId, userId });
      await db.update(ideas)
        .set({ upvoteCount: sql`${ideas.upvoteCount} + 1` })
        .where(eq(ideas.id, ideaId));
    }

    const idea = await db.select().from(ideas).where(eq(ideas.id, ideaId)).limit(1);
    return { upvoted: existing.length === 0, upvoteCount: idea[0]?.upvoteCount || 0 };
  }

  async hasUserUpvoted(ideaId: string, userId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(ideaUpvotes)
      .where(and(
        eq(ideaUpvotes.ideaId, ideaId),
        eq(ideaUpvotes.userId, userId)
      ))
      .limit(1);

    return result.length > 0;
  }

  async createComment(insertComment: InsertIdeaComment): Promise<IdeaComment> {
    const result = await db.insert(ideaComments).values(insertComment).returning();
    
    await db.update(ideas)
      .set({ commentCount: sql`${ideas.commentCount} + 1` })
      .where(eq(ideas.id, insertComment.ideaId));

    return result[0];
  }

  async getIdeaComments(ideaId: string): Promise<Array<IdeaComment & { user: User }>> {
    const result = await db
      .select()
      .from(ideaComments)
      .leftJoin(users, eq(ideaComments.userId, users.id))
      .where(eq(ideaComments.ideaId, ideaId))
      .orderBy(desc(ideaComments.createdAt));

    return result.map(row => ({
      ...row.idea_comments,
      user: row.users as User,
    }));
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await db.select().from(ideaComments).where(eq(ideaComments.id, commentId)).limit(1);

    if (comment.length === 0) {
      throw new Error('Comment not found');
    }

    if (comment[0].userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own comments');
    }

    await db.delete(ideaComments).where(eq(ideaComments.id, commentId));

    await db.update(ideas)
      .set({ commentCount: sql`GREATEST(${ideas.commentCount} - 1, 0)` })
      .where(eq(ideas.id, comment[0].ideaId));
  }

  async applyToTeam(insertApplication: InsertIdeaTeamApplication): Promise<IdeaTeamApplication> {
    const result = await db.insert(ideaTeamApplications).values(insertApplication).returning();
    return result[0];
  }

  async getIdeaTeamApplications(ideaId: string): Promise<Array<IdeaTeamApplication & { applicant: User }>> {
    const result = await db
      .select()
      .from(ideaTeamApplications)
      .leftJoin(users, eq(ideaTeamApplications.applicantId, users.id))
      .where(eq(ideaTeamApplications.ideaId, ideaId))
      .orderBy(desc(ideaTeamApplications.createdAt));

    return result.map(row => ({
      ...row.idea_team_applications,
      applicant: row.users as User,
    }));
  }

  async getUserTeamApplications(userId: string): Promise<Array<IdeaTeamApplication & { idea: Idea }>> {
    const result = await db
      .select()
      .from(ideaTeamApplications)
      .leftJoin(ideas, eq(ideaTeamApplications.ideaId, ideas.id))
      .where(eq(ideaTeamApplications.applicantId, userId))
      .orderBy(desc(ideaTeamApplications.createdAt));

    return result.map(row => ({
      ...row.idea_team_applications,
      idea: row.ideas as Idea,
    }));
  }

  async hasUserAppliedToTeam(ideaId: string, userId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(ideaTeamApplications)
      .where(and(
        eq(ideaTeamApplications.ideaId, ideaId),
        eq(ideaTeamApplications.applicantId, userId)
      ))
      .limit(1);

    return result.length > 0;
  }

  async updateTeamApplicationStatus(applicationId: string, status: string, userId: string): Promise<IdeaTeamApplication> {
    const applicationResult = await db
      .select()
      .from(ideaTeamApplications)
      .where(eq(ideaTeamApplications.id, applicationId))
      .limit(1);

    if (applicationResult.length === 0) {
      throw new Error('Application not found');
    }

    const ideaResult = await db
      .select()
      .from(ideas)
      .where(eq(ideas.id, applicationResult[0].ideaId))
      .limit(1);

    if (ideaResult.length === 0 || ideaResult[0].posterId !== userId) {
      throw new Error('Unauthorized: Only idea owner can update application status');
    }

    const result = await db
      .update(ideaTeamApplications)
      .set({ status })
      .where(eq(ideaTeamApplications.id, applicationId))
      .returning();

    return result[0];
  }

  async getAcceptedTeamMembers(ideaId: string): Promise<Array<IdeaTeamApplication & { applicant: User }>> {
    const result = await db
      .select()
      .from(ideaTeamApplications)
      .leftJoin(users, eq(ideaTeamApplications.applicantId, users.id))
      .where(and(
        eq(ideaTeamApplications.ideaId, ideaId),
        eq(ideaTeamApplications.status, 'accepted')
      ));

    return result.map(row => ({
      ...row.idea_team_applications,
      applicant: row.users as User,
    }));
  }

  async withdrawTeamApplication(applicationId: string, userId: string): Promise<void> {
    const applicationResult = await db
      .select()
      .from(ideaTeamApplications)
      .where(eq(ideaTeamApplications.id, applicationId))
      .limit(1);

    if (applicationResult.length === 0) {
      throw new Error('Application not found');
    }

    if (applicationResult[0].applicantId !== userId) {
      throw new Error('Unauthorized: You can only withdraw your own applications');
    }

    if (applicationResult[0].status !== 'pending') {
      throw new Error('Can only withdraw pending applications');
    }

    await db.delete(ideaTeamApplications).where(eq(ideaTeamApplications.id, applicationId));
  }

  async getTeamApplicationStats(ideaId: string): Promise<{ total: number; pending: number; accepted: number; rejected: number }> {
    const result = await db
      .select({
        total: sql<number>`COUNT(*)`,
        pending: sql<number>`COUNT(CASE WHEN ${ideaTeamApplications.status} = 'pending' THEN 1 END)`,
        accepted: sql<number>`COUNT(CASE WHEN ${ideaTeamApplications.status} = 'accepted' THEN 1 END)`,
        rejected: sql<number>`COUNT(CASE WHEN ${ideaTeamApplications.status} = 'rejected' THEN 1 END)`,
      })
      .from(ideaTeamApplications)
      .where(eq(ideaTeamApplications.ideaId, ideaId));

    return {
      total: Number(result[0]?.total || 0),
      pending: Number(result[0]?.pending || 0),
      accepted: Number(result[0]?.accepted || 0),
      rejected: Number(result[0]?.rejected || 0),
    };
  }

  async updateUserSkills(userId: string, skillsToTeach: string[], skillsToLearn: string[]): Promise<User> {
    const result = await db
      .update(users)
      .set({ skillsToTeach, skillsToLearn })
      .where(eq(users.id, userId))
      .returning();

    if (!result[0]) {
      throw new Error('User not found');
    }

    return result[0];
  }

  async updateUserSettings(userId: string, settings: Partial<Pick<User, 'isActive' | 'profileVisibility' | 'allowMessages' | 'showEmail' | 'showPhone' | 'notificationPreferences'>>): Promise<User> {
    const result = await db
      .update(users)
      .set(settings)
      .where(eq(users.id, userId))
      .returning();

    if (!result[0]) {
      throw new Error('User not found');
    }

    return result[0];
  }

  async getUserSettings(userId: string): Promise<Pick<User, 'isActive' | 'profileVisibility' | 'allowMessages' | 'showEmail' | 'showPhone' | 'notificationPreferences'>> {
    const result = await db
      .select({
        isActive: users.isActive,
        profileVisibility: users.profileVisibility,
        allowMessages: users.allowMessages,
        showEmail: users.showEmail,
        showPhone: users.showPhone,
        notificationPreferences: users.notificationPreferences,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!result[0]) {
      throw new Error('User not found');
    }

    return result[0];
  }

  async updateUserProfile(userId: string, companyHistory: string[], specialties: string[]): Promise<User> {
    const result = await db
      .update(users)
      .set({ companyHistory, specialties })
      .where(eq(users.id, userId))
      .returning();

    if (!result[0]) {
      throw new Error('User not found');
    }

    return result[0];
  }

  async completeOnboarding(userId: string): Promise<User> {
    const result = await db
      .update(users)
      .set({ onboardingCompleted: 1 })
      .where(eq(users.id, userId))
      .returning();

    if (!result[0]) {
      throw new Error('User not found');
    }

    return result[0];
  }

  async globalSearch(query: string, type?: string) {
    const searchTerm = `%${query}%`;
    
    const results: any = {
      users: [],
      jobs: [],
      posts: [],
      ideas: [],
      events: [],
    };

    if (!type || type === 'users') {
      results.users = await db
        .select()
        .from(users)
        .where(
          or(
            sql`${users.fullName} ILIKE ${searchTerm}`,
            sql`${users.company} ILIKE ${searchTerm}`,
            sql`EXISTS (SELECT 1 FROM unnest(${users.techStack}) AS skill WHERE skill ILIKE ${searchTerm})`
          )
        )
        .limit(5);
    }

    if (!type || type === 'jobs') {
      results.jobs = await db
        .select()
        .from(jobs)
        .where(
          or(
            sql`${jobs.jobTitle} ILIKE ${searchTerm}`,
            sql`${jobs.companyName} ILIKE ${searchTerm}`
          )
        )
        .limit(5);
    }

    if (!type || type === 'posts') {
      results.posts = await db
        .select()
        .from(forumPosts)
        .where(
          or(
            sql`${forumPosts.title} ILIKE ${searchTerm}`,
            sql`${forumPosts.content} ILIKE ${searchTerm}`
          )
        )
        .limit(5);
    }

    if (!type || type === 'ideas') {
      results.ideas = await db
        .select()
        .from(ideas)
        .where(
          or(
            sql`${ideas.title} ILIKE ${searchTerm}`,
            sql`${ideas.description} ILIKE ${searchTerm}`
          )
        )
        .limit(5);
    }

    if (!type || type === 'events') {
      results.events = await db
        .select()
        .from(events)
        .where(
          or(
            sql`${events.title} ILIKE ${searchTerm}`,
            sql`${events.description} ILIKE ${searchTerm}`
          )
        )
        .limit(5);
    }

    return results;
  }

  async getExperts(options: { specialty?: string; minYears?: number }): Promise<User[]> {
    const { specialty, minYears = 10 } = options;

    let query = db
      .select()
      .from(users)
      .where(gte(users.yearsOfExperience, minYears));

    if (specialty) {
      query = query.where(sql`${specialty} = ANY(${users.specialties})`);
    }

    const result = await query.orderBy(desc(users.yearsOfExperience));
    return result;
  }

  async findMentors(userId: string, skillToLearn?: string): Promise<User[]> {
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (currentUser.length === 0) {
      throw new Error('User not found');
    }

    if (skillToLearn) {
      const result = await db
        .select()
        .from(users)
        .where(
          and(
            ne(users.id, userId),
            sql`${skillToLearn} = ANY(${users.skillsToTeach})`
          )
        )
        .orderBy(desc(users.mentorRating));
      
      return result;
    } else {
      const skillsToLearn = currentUser[0].skillsToLearn;
      if (skillsToLearn.length === 0) {
        return [];
      }

      const result = await db
        .select()
        .from(users)
        .where(
          and(
            ne(users.id, userId),
            sql`${users.skillsToTeach} && ARRAY[${sql.join(skillsToLearn.map(skill => sql`${skill}`), sql`, `)}]::text[]`
          )
        )
        .orderBy(desc(users.mentorRating));
      
      return result;
    }
  }

  async createSkillSwapSession(insertSession: InsertSkillSwapSession): Promise<SkillSwapSession> {
    const meetingLink = insertSession.meetingLink || `https://meet.google.com/${randomUUID().substring(0, 3)}-${randomUUID().substring(0, 4)}-${randomUUID().substring(0, 3)}`;
    
    const result = await db
      .insert(skillSwapSessions)
      .values({
        ...insertSession,
        meetingLink,
      })
      .returning();

    await db
      .update(users)
      .set({ totalSessionsTaught: sql`${users.totalSessionsTaught} + 1` })
      .where(eq(users.id, insertSession.mentorId));

    await db
      .update(users)
      .set({ totalSessionsLearned: sql`${users.totalSessionsLearned} + 1` })
      .where(eq(users.id, insertSession.learnerId));

    return result[0];
  }

  async getUserSessions(userId: string): Promise<Array<SkillSwapSession & { mentor: User; learner: User }>> {
    const sessions = await db
      .select()
      .from(skillSwapSessions)
      .where(
        or(
          eq(skillSwapSessions.mentorId, userId),
          eq(skillSwapSessions.learnerId, userId)
        )
      )
      .orderBy(desc(skillSwapSessions.createdAt));

    const result = await Promise.all(
      sessions.map(async (session) => {
        const mentorResult = await db
          .select()
          .from(users)
          .where(eq(users.id, session.mentorId))
          .limit(1);

        const learnerResult = await db
          .select()
          .from(users)
          .where(eq(users.id, session.learnerId))
          .limit(1);

        return {
          ...session,
          mentor: mentorResult[0],
          learner: learnerResult[0],
        };
      })
    );

    return result;
  }

  async getSession(sessionId: string): Promise<(SkillSwapSession & { mentor: User; learner: User }) | undefined> {
    const sessionResult = await db
      .select()
      .from(skillSwapSessions)
      .where(eq(skillSwapSessions.id, sessionId))
      .limit(1);

    if (sessionResult.length === 0) return undefined;

    const mentorResult = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionResult[0].mentorId))
      .limit(1);

    const learnerResult = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionResult[0].learnerId))
      .limit(1);

    if (mentorResult.length === 0 || learnerResult.length === 0) return undefined;

    return {
      ...sessionResult[0],
      mentor: mentorResult[0],
      learner: learnerResult[0],
    };
  }

  async updateSessionStatus(sessionId: string, status: string, userId: string): Promise<SkillSwapSession> {
    const sessionResult = await db
      .select()
      .from(skillSwapSessions)
      .where(eq(skillSwapSessions.id, sessionId))
      .limit(1);

    if (sessionResult.length === 0) {
      throw new Error('Session not found');
    }

    const session = sessionResult[0];
    if (session.mentorId !== userId && session.learnerId !== userId) {
      throw new Error('Unauthorized: Only session participants can update status');
    }

    const result = await db
      .update(skillSwapSessions)
      .set({ status })
      .where(eq(skillSwapSessions.id, sessionId))
      .returning();

    return result[0];
  }

  async cancelSession(sessionId: string, userId: string): Promise<void> {
    const sessionResult = await db
      .select()
      .from(skillSwapSessions)
      .where(eq(skillSwapSessions.id, sessionId))
      .limit(1);

    if (sessionResult.length === 0) {
      throw new Error('Session not found');
    }

    const session = sessionResult[0];
    if (session.mentorId !== userId && session.learnerId !== userId) {
      throw new Error('Unauthorized: Only session participants can cancel');
    }

    await db.delete(skillSwapSessions).where(eq(skillSwapSessions.id, sessionId));

    await db
      .update(users)
      .set({ totalSessionsTaught: sql`GREATEST(${users.totalSessionsTaught} - 1, 0)` })
      .where(eq(users.id, session.mentorId));

    await db
      .update(users)
      .set({ totalSessionsLearned: sql`GREATEST(${users.totalSessionsLearned} - 1, 0)` })
      .where(eq(users.id, session.learnerId));
  }

  async createReview(insertReview: InsertSkillSwapReview): Promise<SkillSwapReview> {
    const result = await db.insert(skillSwapReviews).values(insertReview).returning();

    const reviews = await db
      .select()
      .from(skillSwapReviews)
      .where(eq(skillSwapReviews.revieweeId, insertReview.revieweeId));

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Math.round(totalRating / reviews.length);

    await db
      .update(users)
      .set({ mentorRating: averageRating })
      .where(eq(users.id, insertReview.revieweeId));

    return result[0];
  }

  async getUserReviews(userId: string): Promise<SkillSwapReview[]> {
    return await db
      .select()
      .from(skillSwapReviews)
      .where(eq(skillSwapReviews.revieweeId, userId))
      .orderBy(desc(skillSwapReviews.createdAt));
  }

  async hasUserReviewedSession(sessionId: string, userId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(skillSwapReviews)
      .where(
        and(
          eq(skillSwapReviews.sessionId, sessionId),
          eq(skillSwapReviews.reviewerId, userId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  async getMentorStats(userId: string): Promise<{ averageRating: number; totalReviews: number; totalSessionsTaught: number }> {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      throw new Error('User not found');
    }

    const reviews = await db
      .select()
      .from(skillSwapReviews)
      .where(eq(skillSwapReviews.revieweeId, userId));

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews)
      : 0;

    return {
      averageRating,
      totalReviews,
      totalSessionsTaught: userResult[0].totalSessionsTaught,
    };
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const result = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    return result.length > 0 && result[0].isAdmin === 1;
  }

  async getPendingIdeas(): Promise<Array<Idea & { poster: User }>> {
    const result = await db
      .select()
      .from(ideas)
      .leftJoin(users, eq(ideas.posterId, users.id))
      .where(eq(ideas.status, 'pending'))
      .orderBy(desc(ideas.createdAt));

    return result.map(row => ({
      ...row.ideas,
      poster: row.users!,
    }));
  }

  async approveIdea(ideaId: string, adminId: string): Promise<Idea> {
    const result = await db
      .update(ideas)
      .set({ status: 'approved' })
      .where(eq(ideas.id, ideaId))
      .returning();

    if (result.length === 0) {
      throw new Error('Idea not found');
    }

    await this.logAdminAction({
      adminId,
      actionType: 'approve_idea',
      targetType: 'idea',
      targetId: ideaId,
      details: `Approved idea: ${result[0].title}`,
    });

    return result[0];
  }

  async rejectIdea(ideaId: string, adminId: string, reason: string): Promise<Idea> {
    const result = await db
      .update(ideas)
      .set({ status: 'rejected' })
      .where(eq(ideas.id, ideaId))
      .returning();

    if (result.length === 0) {
      throw new Error('Idea not found');
    }

    await this.logAdminAction({
      adminId,
      actionType: 'reject_idea',
      targetType: 'idea',
      targetId: ideaId,
      details: `Rejected idea: ${result[0].title}. Reason: ${reason}`,
    });

    return result[0];
  }

  async getAnalytics(): Promise<{
    totalUsers: number;
    totalIdeas: number;
    pendingIdeas: number;
    approvedIdeas: number;
    rejectedIdeas: number;
    totalJobs: number;
    totalSessions: number;
    recentActivity: Array<{ type: string; count: number; date: string }>;
  }> {
    const [userCount, ideaStats, jobCount, sessionCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      db.select({
        total: sql<number>`count(*)::int`,
        pending: sql<number>`count(*) FILTER (WHERE status = 'pending')::int`,
        approved: sql<number>`count(*) FILTER (WHERE status = 'approved')::int`,
        rejected: sql<number>`count(*) FILTER (WHERE status = 'rejected')::int`,
      }).from(ideas),
      db.select({ count: sql<number>`count(*)::int` }).from(jobs),
      db.select({ count: sql<number>`count(*)::int` }).from(skillSwapSessions),
    ]);

    return {
      totalUsers: userCount[0]?.count || 0,
      totalIdeas: ideaStats[0]?.total || 0,
      pendingIdeas: ideaStats[0]?.pending || 0,
      approvedIdeas: ideaStats[0]?.approved || 0,
      rejectedIdeas: ideaStats[0]?.rejected || 0,
      totalJobs: jobCount[0]?.count || 0,
      totalSessions: sessionCount[0]?.count || 0,
      recentActivity: [],
    };
  }

  async createBroadcast(insertBroadcast: InsertBroadcast): Promise<Broadcast> {
    const result = await db
      .insert(broadcasts)
      .values({
        ...insertBroadcast,
        sentAt: new Date(),
      })
      .returning();

    await this.logAdminAction({
      adminId: insertBroadcast.createdBy,
      actionType: 'create_broadcast',
      targetType: 'broadcast',
      targetId: result[0].id,
      details: `Created broadcast: ${insertBroadcast.title}`,
    });

    return result[0];
  }

  async getAllBroadcasts(): Promise<Array<Broadcast & { admin: User; viewCount: number }>> {
    const result = await db
      .select({
        broadcast: broadcasts,
        admin: users,
        viewCount: sql<number>`count(DISTINCT ${broadcastViews.id})::int`,
      })
      .from(broadcasts)
      .leftJoin(users, eq(broadcasts.createdBy, users.id))
      .leftJoin(broadcastViews, eq(broadcasts.id, broadcastViews.broadcastId))
      .groupBy(broadcasts.id, users.id)
      .orderBy(desc(broadcasts.createdAt));

    return result.map(row => ({
      ...row.broadcast,
      admin: row.admin!,
      viewCount: row.viewCount || 0,
    }));
  }

  async getLatestBroadcast(userId: string): Promise<(Broadcast & { admin: User; hasViewed: boolean; hasDismissed: boolean }) | undefined> {
    const result = await db
      .select({
        broadcast: broadcasts,
        admin: users,
        viewId: broadcastViews.id,
        dismissed: broadcastViews.dismissed,
      })
      .from(broadcasts)
      .leftJoin(users, eq(broadcasts.createdBy, users.id))
      .leftJoin(
        broadcastViews,
        and(
          eq(broadcasts.id, broadcastViews.broadcastId),
          eq(broadcastViews.userId, userId)
        )
      )
      .orderBy(desc(broadcasts.createdAt))
      .limit(1);

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.broadcast,
      admin: row.admin!,
      hasViewed: !!row.viewId,
      hasDismissed: row.dismissed === 1,
    };
  }

  async markBroadcastAsViewed(broadcastId: string, userId: string): Promise<void> {
    const existing = await db
      .select()
      .from(broadcastViews)
      .where(
        and(
          eq(broadcastViews.broadcastId, broadcastId),
          eq(broadcastViews.userId, userId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(broadcastViews).values({
        broadcastId,
        userId,
        dismissed: 0,
      });
    }
  }

  async dismissBroadcast(broadcastId: string, userId: string): Promise<void> {
    const existing = await db
      .select()
      .from(broadcastViews)
      .where(
        and(
          eq(broadcastViews.broadcastId, broadcastId),
          eq(broadcastViews.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(broadcastViews)
        .set({ dismissed: 1 })
        .where(eq(broadcastViews.id, existing[0].id));
    } else {
      await db.insert(broadcastViews).values({
        broadcastId,
        userId,
        dismissed: 1,
      });
    }
  }

  async logAdminAction(insertAction: InsertAdminAction): Promise<AdminAction> {
    const result = await db
      .insert(adminActions)
      .values(insertAction)
      .returning();

    return result[0];
  }

  async getAdminActions(filters?: { adminId?: string; actionType?: string; startDate?: Date; endDate?: Date }): Promise<Array<AdminAction & { admin: User }>> {
    let query = db
      .select()
      .from(adminActions)
      .leftJoin(users, eq(adminActions.adminId, users.id))
      .orderBy(desc(adminActions.createdAt))
      .$dynamic();

    const conditions = [];
    if (filters?.adminId) {
      conditions.push(eq(adminActions.adminId, filters.adminId));
    }
    if (filters?.actionType) {
      conditions.push(eq(adminActions.actionType, filters.actionType));
    }
    if (filters?.startDate) {
      conditions.push(gte(adminActions.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(adminActions.createdAt, filters.endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;

    return result.map(row => ({
      ...row.admin_actions,
      admin: row.users!,
    }));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const result = await db
      .insert(events)
      .values(insertEvent)
      .returning();

    return result[0];
  }

  async getEvents(filters?: { status?: string; organizerId?: string }): Promise<Array<Event & { organizer: User; rsvpCount: number; checkinCount: number }>> {
    let query = db
      .select({
        event: events,
        organizer: users,
        rsvpCount: sql<number>`count(DISTINCT ${eventRsvps.id})::int`,
        checkinCount: sql<number>`count(DISTINCT ${eventCheckins.id}) FILTER (WHERE ${eventCheckins.checkedInAt} IS NOT NULL)::int`,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
      .leftJoin(eventCheckins, eq(events.id, eventCheckins.eventId))
      .groupBy(events.id, users.id)
      .orderBy(desc(events.eventDate))
      .$dynamic();

    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(events.status, filters.status));
    }
    if (filters?.organizerId) {
      conditions.push(eq(events.organizerId, filters.organizerId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;

    return result.map(row => ({
      ...row.event,
      organizer: row.organizer!,
      rsvpCount: row.rsvpCount || 0,
      checkinCount: row.checkinCount || 0,
    }));
  }

  async getEvent(id: string): Promise<(Event & { organizer: User; rsvpCount: number; checkinCount: number }) | undefined> {
    const result = await db
      .select({
        event: events,
        organizer: users,
        rsvpCount: sql<number>`count(DISTINCT ${eventRsvps.id})::int`,
        checkinCount: sql<number>`count(DISTINCT ${eventCheckins.id}) FILTER (WHERE ${eventCheckins.checkedInAt} IS NOT NULL)::int`,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
      .leftJoin(eventCheckins, eq(events.id, eventCheckins.eventId))
      .where(eq(events.id, id))
      .groupBy(events.id, users.id)
      .limit(1);

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.event,
      organizer: row.organizer!,
      rsvpCount: row.rsvpCount || 0,
      checkinCount: row.checkinCount || 0,
    };
  }

  async getUpcomingEvents(): Promise<Array<Event & { organizer: User; rsvpCount: number; checkinCount: number }>> {
    const result = await db
      .select({
        event: events,
        organizer: users,
        rsvpCount: sql<number>`count(DISTINCT ${eventRsvps.id})::int`,
        checkinCount: sql<number>`count(DISTINCT ${eventCheckins.id}) FILTER (WHERE ${eventCheckins.checkedInAt} IS NOT NULL)::int`,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
      .leftJoin(eventCheckins, eq(events.id, eventCheckins.eventId))
      .where(
        and(
          sql`(DATE(${events.eventDate}) + ${events.eventTime}::time) > NOW()`,
          eq(events.status, 'upcoming')
        )
      )
      .groupBy(events.id, users.id)
      .orderBy(events.eventDate);

    return result.map(row => ({
      ...row.event,
      organizer: row.organizer!,
      rsvpCount: row.rsvpCount || 0,
      checkinCount: row.checkinCount || 0,
    }));
  }

  async getPastEvents(): Promise<Array<Event & { organizer: User; rsvpCount: number; checkinCount: number }>> {
    const result = await db
      .select({
        event: events,
        organizer: users,
        rsvpCount: sql<number>`count(DISTINCT ${eventRsvps.id})::int`,
        checkinCount: sql<number>`count(DISTINCT ${eventCheckins.id}) FILTER (WHERE ${eventCheckins.checkedInAt} IS NOT NULL)::int`,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
      .leftJoin(eventCheckins, eq(events.id, eventCheckins.eventId))
      .where(
        or(
          sql`(DATE(${events.eventDate}) + ${events.eventTime}::time) <= NOW()`,
          eq(events.status, 'completed')
        )
      )
      .groupBy(events.id, users.id)
      .orderBy(desc(events.eventDate));

    return result.map(row => ({
      ...row.event,
      organizer: row.organizer!,
      rsvpCount: row.rsvpCount || 0,
      checkinCount: row.checkinCount || 0,
    }));
  }

  async getUserEvents(organizerId: string): Promise<Array<Event & { rsvpCount: number; checkinCount: number }>> {
    const result = await db
      .select({
        event: events,
        rsvpCount: sql<number>`count(DISTINCT ${eventRsvps.id})::int`,
        checkinCount: sql<number>`count(DISTINCT ${eventCheckins.id}) FILTER (WHERE ${eventCheckins.checkedInAt} IS NOT NULL)::int`,
      })
      .from(events)
      .leftJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
      .leftJoin(eventCheckins, eq(events.id, eventCheckins.eventId))
      .where(eq(events.organizerId, organizerId))
      .groupBy(events.id)
      .orderBy(desc(events.eventDate));

    return result.map(row => ({
      ...row.event,
      rsvpCount: row.rsvpCount || 0,
      checkinCount: row.checkinCount || 0,
    }));
  }

  async updateEvent(id: string, updates: Partial<Event>, userId: string): Promise<Event> {
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (event.length === 0) {
      throw new Error('Event not found');
    }

    if (event[0].organizerId !== userId) {
      throw new Error('Unauthorized: You can only update your own events');
    }

    const result = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();

    return result[0];
  }

  async deleteEvent(id: string, userId: string): Promise<void> {
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (event.length === 0) {
      throw new Error('Event not found');
    }

    if (event[0].organizerId !== userId) {
      throw new Error('Unauthorized: You can only delete your own events');
    }

    await db.delete(events).where(eq(events.id, id));
  }

  async rsvpToEvent(eventId: string, userId: string): Promise<EventRsvp> {
    const existing = await db
      .select()
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error('You have already RSVPed to this event');
    }

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (event.length === 0) {
      throw new Error('Event not found');
    }

    const rsvpCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(eventRsvps)
      .where(eq(eventRsvps.eventId, eventId));

    if (rsvpCount[0].count >= event[0].maxAttendees) {
      throw new Error('Event is at full capacity');
    }

    const result = await db
      .insert(eventRsvps)
      .values({
        eventId,
        userId,
      })
      .returning();

    return result[0];
  }

  async cancelRsvp(eventId: string, userId: string): Promise<void> {
    await db
      .delete(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, userId)
        )
      );
  }

  async getEventRsvps(eventId: string): Promise<Array<EventRsvp & { user: User }>> {
    const result = await db
      .select()
      .from(eventRsvps)
      .leftJoin(users, eq(eventRsvps.userId, users.id))
      .where(eq(eventRsvps.eventId, eventId))
      .orderBy(desc(eventRsvps.rsvpedAt));

    return result.map(row => ({
      ...row.event_rsvps,
      user: row.users!,
    }));
  }

  async hasUserRsvped(eventId: string, userId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, userId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  async getRsvpCount(eventId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(eventRsvps)
      .where(eq(eventRsvps.eventId, eventId));

    return result[0]?.count || 0;
  }

  async getUserEventsAttending(userId: string): Promise<Array<EventRsvp & { event: Event & { organizer: User }; checkedIn: boolean }>> {
    const result = await db
      .select({
        rsvp: eventRsvps,
        event: events,
        organizer: users,
        checkedIn: sql<boolean>`${eventCheckins.checkedInAt} IS NOT NULL`,
      })
      .from(eventRsvps)
      .leftJoin(events, eq(eventRsvps.eventId, events.id))
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(
        eventCheckins,
        and(
          eq(eventCheckins.eventId, eventRsvps.eventId),
          eq(eventCheckins.userId, userId)
        )
      )
      .where(eq(eventRsvps.userId, userId))
      .orderBy(desc(events.eventDate));

    return result.map(row => ({
      ...row.rsvp,
      event: {
        ...row.event!,
        organizer: row.organizer!,
      },
      checkedIn: row.checkedIn || false,
    }));
  }

  async generateQRCodeForAttendee(eventId: string, userId: string): Promise<string> {
    const hasRsvped = await this.hasUserRsvped(eventId, userId);
    if (!hasRsvped) {
      throw new Error('You must RSVP to this event before generating a QR code');
    }

    const existing = await db
      .select()
      .from(eventCheckins)
      .where(
        and(
          eq(eventCheckins.eventId, eventId),
          eq(eventCheckins.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0].qrCode;
    }

    const qrCode = randomUUID();

    await db.insert(eventCheckins).values({
      eventId,
      userId,
      qrCode,
    });

    return qrCode;
  }

  async checkInAttendee(qrCode: string, organizerId: string): Promise<{ success: boolean; message: string; user?: User; event?: Event; pointsAwarded?: number }> {
    const checkin = await db
      .select()
      .from(eventCheckins)
      .where(eq(eventCheckins.qrCode, qrCode))
      .limit(1);

    if (checkin.length === 0) {
      return {
        success: false,
        message: 'Invalid QR code',
      };
    }

    const checkinRecord = checkin[0];

    if (checkinRecord.checkedInAt) {
      return {
        success: false,
        message: 'This attendee has already been checked in',
      };
    }

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, checkinRecord.eventId))
      .limit(1);

    if (event.length === 0) {
      return {
        success: false,
        message: 'Event not found',
      };
    }

    if (event[0].organizerId !== organizerId) {
      return {
        success: false,
        message: 'Unauthorized: Only the event organizer can check in attendees',
      };
    }

    const pointsAwarded = 200;

    await db
      .update(eventCheckins)
      .set({
        checkedInAt: new Date(),
        pointsAwarded,
      })
      .where(eq(eventCheckins.id, checkinRecord.id));

    await db
      .update(users)
      .set({
        points: sql`${users.points} + 200`,
      })
      .where(eq(users.id, checkinRecord.userId));

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, checkinRecord.userId))
      .limit(1);

    return {
      success: true,
      message: 'Check-in successful',
      user: user[0],
      event: event[0],
      pointsAwarded,
    };
  }

  async hasUserCheckedIn(eventId: string, userId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(eventCheckins)
      .where(
        and(
          eq(eventCheckins.eventId, eventId),
          eq(eventCheckins.userId, userId),
          sql`${eventCheckins.checkedInAt} IS NOT NULL`
        )
      )
      .limit(1);

    return result.length > 0;
  }

  async getEventCheckins(eventId: string): Promise<Array<EventCheckin & { user: User }>> {
    const result = await db
      .select()
      .from(eventCheckins)
      .leftJoin(users, eq(eventCheckins.userId, users.id))
      .where(eq(eventCheckins.eventId, eventId))
      .orderBy(desc(eventCheckins.checkedInAt));

    return result.map(row => ({
      ...row.event_checkins,
      user: row.users!,
    }));
  }

  async getCheckinCount(eventId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(eventCheckins)
      .where(
        and(
          eq(eventCheckins.eventId, eventId),
          sql`${eventCheckins.checkedInAt} IS NOT NULL`
        )
      );

    return result[0]?.count || 0;
  }

  async getEventStats(eventId: string): Promise<{ rsvpCount: number; checkinCount: number; capacity: number; availableSpots: number }> {
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (event.length === 0) {
      throw new Error('Event not found');
    }

    const rsvpCount = await this.getRsvpCount(eventId);
    const checkinCount = await this.getCheckinCount(eventId);
    const capacity = event[0].maxAttendees;
    const availableSpots = Math.max(0, capacity - rsvpCount);

    return {
      rsvpCount,
      checkinCount,
      capacity,
      availableSpots,
    };
  }

  async getAllCategories(): Promise<ForumCategory[]> {
    const result = await db
      .select()
      .from(forumCategories)
      .orderBy(forumCategories.name);
    
    return result;
  }

  async getCategory(id: string): Promise<ForumCategory | undefined> {
    const result = await db
      .select()
      .from(forumCategories)
      .where(eq(forumCategories.id, id))
      .limit(1);
    
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<ForumCategory | undefined> {
    const result = await db
      .select()
      .from(forumCategories)
      .where(eq(forumCategories.slug, slug))
      .limit(1);
    
    return result[0];
  }

  async createCategory(category: InsertForumCategory): Promise<ForumCategory> {
    const result = await db
      .insert(forumCategories)
      .values(category)
      .returning();
    
    return result[0];
  }

  async createPost(post: InsertForumPost): Promise<ForumPost> {
    const result = await db.transaction(async (tx) => {
      const [newPost] = await tx
        .insert(forumPosts)
        .values(post)
        .returning();

      await tx
        .update(forumCategories)
        .set({ postCount: sql`${forumCategories.postCount} + 1` })
        .where(eq(forumCategories.id, post.categoryId));

      return newPost;
    });

    return result;
  }

  async getAllPosts(options: { categoryId?: string; sortBy?: string; limit?: number; offset?: number }): Promise<Array<ForumPost & { author: User; category: ForumCategory }>> {
    const { categoryId, sortBy = 'recent', limit = 20, offset = 0 } = options;

    const conditions = [eq(forumPosts.status, 'active')];
    
    if (categoryId) {
      conditions.push(eq(forumPosts.categoryId, categoryId));
    }

    let orderByClause;
    if (sortBy === 'popular') {
      orderByClause = desc(forumPosts.upvoteCount);
    } else if (sortBy === 'mostReplies') {
      orderByClause = desc(forumPosts.replyCount);
    } else {
      orderByClause = desc(forumPosts.createdAt);
    }

    const result = await db
      .select()
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.authorId, users.id))
      .leftJoin(forumCategories, eq(forumPosts.categoryId, forumCategories.id))
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.forum_posts,
      author: row.users!,
      category: row.forum_categories!,
    }));
  }

  async getPost(id: string): Promise<(ForumPost & { author: User; category: ForumCategory }) | undefined> {
    const result = await db
      .select()
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.authorId, users.id))
      .leftJoin(forumCategories, eq(forumPosts.categoryId, forumCategories.id))
      .where(eq(forumPosts.id, id))
      .limit(1);

    if (result.length === 0) {
      return undefined;
    }

    return {
      ...result[0].forum_posts,
      author: result[0].users!,
      category: result[0].forum_categories!,
    };
  }

  async updatePost(id: string, updates: Partial<ForumPost>, userId: string): Promise<ForumPost> {
    const post = await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.id, id))
      .limit(1);

    if (post.length === 0) {
      throw new Error('Post not found');
    }

    if (post[0].authorId !== userId) {
      throw new Error('Unauthorized: Only the author can update this post');
    }

    const result = await db
      .update(forumPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumPosts.id, id))
      .returning();

    return result[0];
  }

  async deletePost(id: string, userId: string): Promise<void> {
    const post = await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.id, id))
      .limit(1);

    if (post.length === 0) {
      throw new Error('Post not found');
    }

    const isAdmin = await this.isUserAdmin(userId);
    if (post[0].authorId !== userId && !isAdmin) {
      throw new Error('Unauthorized: Only the author or admin can delete this post');
    }

    await db.transaction(async (tx) => {
      await tx
        .update(forumPosts)
        .set({ status: 'deleted' })
        .where(eq(forumPosts.id, id));

      await tx
        .update(forumCategories)
        .set({ postCount: sql`${forumCategories.postCount} - 1` })
        .where(eq(forumCategories.id, post[0].categoryId));
    });
  }

  async incrementViewCount(postId: string): Promise<void> {
    await db
      .update(forumPosts)
      .set({ viewCount: sql`${forumPosts.viewCount} + 1` })
      .where(eq(forumPosts.id, postId));
  }

  async createReply(reply: InsertForumReply): Promise<ForumReply> {
    const result = await db.transaction(async (tx) => {
      const [newReply] = await tx
        .insert(forumReplies)
        .values(reply)
        .returning();

      await tx
        .update(forumPosts)
        .set({ replyCount: sql`${forumPosts.replyCount} + 1` })
        .where(eq(forumPosts.id, reply.postId));

      return newReply;
    });

    return result;
  }

  async getPostReplies(postId: string): Promise<Array<ForumReply & { author: User }>> {
    const result = await db
      .select()
      .from(forumReplies)
      .leftJoin(users, eq(forumReplies.authorId, users.id))
      .where(eq(forumReplies.postId, postId))
      .orderBy(forumReplies.createdAt);

    return result.map(row => ({
      ...row.forum_replies,
      author: row.users!,
    }));
  }

  async markAsBestAnswer(replyId: string, postId: string, userId: string): Promise<ForumReply> {
    const post = await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.id, postId))
      .limit(1);

    if (post.length === 0) {
      throw new Error('Post not found');
    }

    if (post[0].authorId !== userId) {
      throw new Error('Unauthorized: Only the post author can mark best answer');
    }

    const result = await db.transaction(async (tx) => {
      if (post[0].bestReplyId) {
        await tx
          .update(forumReplies)
          .set({ isBestAnswer: 0 })
          .where(eq(forumReplies.id, post[0].bestReplyId));
      }

      const [updatedReply] = await tx
        .update(forumReplies)
        .set({ isBestAnswer: 1 })
        .where(eq(forumReplies.id, replyId))
        .returning();

      await tx
        .update(forumPosts)
        .set({ bestReplyId: replyId })
        .where(eq(forumPosts.id, postId));

      return updatedReply;
    });

    return result;
  }

  async getUserForumPosts(userId: string): Promise<ForumPost[]> {
    return await db
      .select()
      .from(forumPosts)
      .where(and(eq(forumPosts.authorId, userId), eq(forumPosts.status, 'active')))
      .orderBy(desc(forumPosts.createdAt));
  }

  async getUserForumReplies(userId: string): Promise<ForumReply[]> {
    return await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.authorId, userId))
      .orderBy(desc(forumReplies.createdAt));
  }

  async deleteReply(id: string, userId: string): Promise<void> {
    const reply = await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.id, id))
      .limit(1);

    if (reply.length === 0) {
      throw new Error('Reply not found');
    }

    const isAdmin = await this.isUserAdmin(userId);
    if (reply[0].authorId !== userId && !isAdmin) {
      throw new Error('Unauthorized: Only the author or admin can delete this reply');
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(forumReplies)
        .where(eq(forumReplies.id, id));

      await tx
        .update(forumPosts)
        .set({ replyCount: sql`${forumPosts.replyCount} - 1` })
        .where(eq(forumPosts.id, reply[0].postId));

      const post = await tx
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.id, reply[0].postId))
        .limit(1);

      if (post[0]?.bestReplyId === id) {
        await tx
          .update(forumPosts)
          .set({ bestReplyId: null })
          .where(eq(forumPosts.id, reply[0].postId));
      }
    });
  }

  async vote(vote: InsertForumVote): Promise<ForumVote> {
    const existingVote = await db
      .select()
      .from(forumVotes)
      .where(
        and(
          eq(forumVotes.userId, vote.userId),
          eq(forumVotes.targetType, vote.targetType),
          eq(forumVotes.targetId, vote.targetId)
        )
      )
      .limit(1);

    const result = await db.transaction(async (tx) => {
      let newVote: ForumVote;

      if (existingVote.length > 0) {
        const oldVoteType = existingVote[0].voteType;

        if (oldVoteType === vote.voteType) {
          await tx
            .delete(forumVotes)
            .where(eq(forumVotes.id, existingVote[0].id));

          if (vote.targetType === 'post') {
            if (vote.voteType === 'upvote') {
              await tx
                .update(forumPosts)
                .set({ upvoteCount: sql`${forumPosts.upvoteCount} - 1` })
                .where(eq(forumPosts.id, vote.targetId));
            } else {
              await tx
                .update(forumPosts)
                .set({ downvoteCount: sql`${forumPosts.downvoteCount} - 1` })
                .where(eq(forumPosts.id, vote.targetId));
            }
          } else if (vote.targetType === 'reply') {
            if (vote.voteType === 'upvote') {
              await tx
                .update(forumReplies)
                .set({ upvoteCount: sql`${forumReplies.upvoteCount} - 1` })
                .where(eq(forumReplies.id, vote.targetId));
            } else {
              await tx
                .update(forumReplies)
                .set({ downvoteCount: sql`${forumReplies.downvoteCount} - 1` })
                .where(eq(forumReplies.id, vote.targetId));
            }
          }

          return existingVote[0];
        } else {
          const [updated] = await tx
            .update(forumVotes)
            .set({ voteType: vote.voteType })
            .where(eq(forumVotes.id, existingVote[0].id))
            .returning();

          if (vote.targetType === 'post') {
            if (oldVoteType === 'upvote') {
              await tx
                .update(forumPosts)
                .set({
                  upvoteCount: sql`${forumPosts.upvoteCount} - 1`,
                  downvoteCount: sql`${forumPosts.downvoteCount} + 1`,
                })
                .where(eq(forumPosts.id, vote.targetId));
            } else {
              await tx
                .update(forumPosts)
                .set({
                  upvoteCount: sql`${forumPosts.upvoteCount} + 1`,
                  downvoteCount: sql`${forumPosts.downvoteCount} - 1`,
                })
                .where(eq(forumPosts.id, vote.targetId));
            }
          } else if (vote.targetType === 'reply') {
            if (oldVoteType === 'upvote') {
              await tx
                .update(forumReplies)
                .set({
                  upvoteCount: sql`${forumReplies.upvoteCount} - 1`,
                  downvoteCount: sql`${forumReplies.downvoteCount} + 1`,
                })
                .where(eq(forumReplies.id, vote.targetId));
            } else {
              await tx
                .update(forumReplies)
                .set({
                  upvoteCount: sql`${forumReplies.upvoteCount} + 1`,
                  downvoteCount: sql`${forumReplies.downvoteCount} - 1`,
                })
                .where(eq(forumReplies.id, vote.targetId));
            }
          }

          newVote = updated;
        }
      } else {
        const [created] = await tx
          .insert(forumVotes)
          .values(vote)
          .returning();

        if (vote.targetType === 'post') {
          if (vote.voteType === 'upvote') {
            await tx
              .update(forumPosts)
              .set({ upvoteCount: sql`${forumPosts.upvoteCount} + 1` })
              .where(eq(forumPosts.id, vote.targetId));
          } else {
            await tx
              .update(forumPosts)
              .set({ downvoteCount: sql`${forumPosts.downvoteCount} + 1` })
              .where(eq(forumPosts.id, vote.targetId));
          }
        } else if (vote.targetType === 'reply') {
          if (vote.voteType === 'upvote') {
            await tx
              .update(forumReplies)
              .set({ upvoteCount: sql`${forumReplies.upvoteCount} + 1` })
              .where(eq(forumReplies.id, vote.targetId));
          } else {
            await tx
              .update(forumReplies)
              .set({ downvoteCount: sql`${forumReplies.downvoteCount} + 1` })
              .where(eq(forumReplies.id, vote.targetId));
          }
        }

        newVote = created;
      }

      return newVote;
    });

    return result;
  }

  async removeVote(userId: string, targetType: string, targetId: string): Promise<void> {
    const existingVote = await db
      .select()
      .from(forumVotes)
      .where(
        and(
          eq(forumVotes.userId, userId),
          eq(forumVotes.targetType, targetType),
          eq(forumVotes.targetId, targetId)
        )
      )
      .limit(1);

    if (existingVote.length === 0) {
      return;
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(forumVotes)
        .where(eq(forumVotes.id, existingVote[0].id));

      if (targetType === 'post') {
        if (existingVote[0].voteType === 'upvote') {
          await tx
            .update(forumPosts)
            .set({ upvoteCount: sql`${forumPosts.upvoteCount} - 1` })
            .where(eq(forumPosts.id, targetId));
        } else {
          await tx
            .update(forumPosts)
            .set({ downvoteCount: sql`${forumPosts.downvoteCount} - 1` })
            .where(eq(forumPosts.id, targetId));
        }
      } else if (targetType === 'reply') {
        if (existingVote[0].voteType === 'upvote') {
          await tx
            .update(forumReplies)
            .set({ upvoteCount: sql`${forumReplies.upvoteCount} - 1` })
            .where(eq(forumReplies.id, targetId));
        } else {
          await tx
            .update(forumReplies)
            .set({ downvoteCount: sql`${forumReplies.downvoteCount} - 1` })
            .where(eq(forumReplies.id, targetId));
        }
      }
    });
  }

  async getUserVote(userId: string, targetType: string, targetId: string): Promise<ForumVote | undefined> {
    const result = await db
      .select()
      .from(forumVotes)
      .where(
        and(
          eq(forumVotes.userId, userId),
          eq(forumVotes.targetType, targetType),
          eq(forumVotes.targetId, targetId)
        )
      )
      .limit(1);

    return result[0];
  }

  async getVoteCounts(targetType: string, targetId: string): Promise<{ upvotes: number; downvotes: number }> {
    const result = await db
      .select({
        upvotes: sql<number>`count(*) filter (where ${forumVotes.voteType} = 'upvote')::int`,
        downvotes: sql<number>`count(*) filter (where ${forumVotes.voteType} = 'downvote')::int`,
      })
      .from(forumVotes)
      .where(
        and(
          eq(forumVotes.targetType, targetType),
          eq(forumVotes.targetId, targetId)
        )
      );

    return {
      upvotes: result[0]?.upvotes || 0,
      downvotes: result[0]?.downvotes || 0,
    };
  }

  async createReport(report: InsertForumReport): Promise<ForumReport> {
    const result = await db
      .insert(forumReports)
      .values(report)
      .returning();

    return result[0];
  }

  async getAllReports(): Promise<Array<ForumReport & { reporter: User; resolver?: User }>> {
    const result = await db
      .select()
      .from(forumReports)
      .leftJoin(users, eq(forumReports.reporterId, users.id))
      .orderBy(desc(forumReports.createdAt));

    const reportsWithReporter = await Promise.all(
      result.map(async (row) => {
        let resolver: User | undefined;
        if (row.forum_reports.resolvedBy) {
          const resolverResult = await db
            .select()
            .from(users)
            .where(eq(users.id, row.forum_reports.resolvedBy))
            .limit(1);
          resolver = resolverResult[0];
        }

        return {
          ...row.forum_reports,
          reporter: row.users!,
          resolver,
        };
      })
    );

    return reportsWithReporter;
  }

  async resolveReport(reportId: string, adminId: string, action: string): Promise<ForumReport> {
    const isAdmin = await this.isUserAdmin(adminId);
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admins can resolve reports');
    }

    const result = await db
      .update(forumReports)
      .set({
        status: 'resolved',
        resolvedBy: adminId,
        resolvedAt: new Date(),
      })
      .where(eq(forumReports.id, reportId))
      .returning();

    if (result.length === 0) {
      throw new Error('Report not found');
    }

    return result[0];
  }

  async getLostAndFoundItems(): Promise<LostAndFound[]> {
    const result = await db
      .select()
      .from(lostAndFound)
      .orderBy(desc(lostAndFound.createdAt));

    return result;
  }

  async createLostAndFoundItem(item: InsertLostAndFound): Promise<LostAndFound> {
    const result = await db
      .insert(lostAndFound)
      .values(item)
      .returning();

    return result[0];
  }

  async resolveLostAndFoundItem(itemId: string, userId: string): Promise<LostAndFound> {
    const item = await db
      .select()
      .from(lostAndFound)
      .where(eq(lostAndFound.id, itemId))
      .limit(1);

    if (item.length === 0) {
      throw new Error('Item not found');
    }

    if (item[0].userId !== userId) {
      throw new Error('Unauthorized');
    }

    const result = await db
      .update(lostAndFound)
      .set({
        status: 'resolved',
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(lostAndFound.id, itemId))
      .returning();

    return result[0];
  }

  async getApprovedAnnouncements(): Promise<CommunityAnnouncement[]> {
    const result = await db
      .select()
      .from(communityAnnouncements)
      .where(eq(communityAnnouncements.status, 'approved'))
      .orderBy(desc(communityAnnouncements.createdAt));

    return result;
  }

  async getPendingAnnouncements(): Promise<CommunityAnnouncement[]> {
    const result = await db
      .select()
      .from(communityAnnouncements)
      .where(eq(communityAnnouncements.status, 'pending'))
      .orderBy(desc(communityAnnouncements.createdAt));

    return result;
  }

  async createAnnouncement(announcement: InsertCommunityAnnouncement): Promise<CommunityAnnouncement> {
    const result = await db
      .insert(communityAnnouncements)
      .values(announcement)
      .returning();

    return result[0];
  }

  async approveAnnouncement(announcementId: string, adminId: string): Promise<CommunityAnnouncement> {
    const result = await db
      .update(communityAnnouncements)
      .set({
        status: 'approved',
        approvedBy: adminId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(communityAnnouncements.id, announcementId))
      .returning();

    if (result.length === 0) {
      throw new Error('Announcement not found');
    }

    return result[0];
  }

  async rejectAnnouncement(announcementId: string, reason: string): Promise<CommunityAnnouncement> {
    const result = await db
      .update(communityAnnouncements)
      .set({
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(communityAnnouncements.id, announcementId))
      .returning();

    if (result.length === 0) {
      throw new Error('Announcement not found');
    }

    return result[0];
  }

  // Activity Feed Methods
  async getActivityFeed(options?: { userId?: string; limit?: number; offset?: number }): Promise<Array<any>> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    let query = db
      .select({
        id: activityFeed.id,
        userId: activityFeed.userId,
        activityType: activityFeed.activityType,
        targetType: activityFeed.targetType,
        targetId: activityFeed.targetId,
        content: activityFeed.content,
        metadata: activityFeed.metadata,
        likeCount: activityFeed.likeCount,
        createdAt: activityFeed.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          profilePhotoUrl: users.profilePhotoUrl,
        },
      })
      .from(activityFeed)
      .leftJoin(users, eq(activityFeed.userId, users.id))
      .orderBy(desc(activityFeed.createdAt))
      .limit(limit)
      .offset(offset);

    const result = await query;
    return result;
  }

  async createActivityEntry(entry: { userId: string; activityType: string; targetType: string; targetId: string; content: string; metadata?: string }): Promise<any> {
    const result = await db
      .insert(activityFeed)
      .values({
        userId: entry.userId,
        activityType: entry.activityType,
        targetType: entry.targetType,
        targetId: entry.targetId,
        content: entry.content,
        metadata: entry.metadata || '{}',
      })
      .returning();

    return result[0];
  }

  async likeActivity(activityId: string, userId: string): Promise<void> {
    // Check if already liked
    const existing = await db
      .select()
      .from(activityLikes)
      .where(and(eq(activityLikes.activityId, activityId), eq(activityLikes.userId, userId)));

    if (existing.length > 0) {
      return; // Already liked
    }

    // Add like
    await db.insert(activityLikes).values({ activityId, userId });

    // Increment like count
    await db
      .update(activityFeed)
      .set({ likeCount: sql`${activityFeed.likeCount} + 1` })
      .where(eq(activityFeed.id, activityId));
  }

  async unlikeActivity(activityId: string, userId: string): Promise<void> {
    // Remove like
    await db
      .delete(activityLikes)
      .where(and(eq(activityLikes.activityId, activityId), eq(activityLikes.userId, userId)));

    // Decrement like count
    await db
      .update(activityFeed)
      .set({ likeCount: sql`${activityFeed.likeCount} - 1` })
      .where(eq(activityFeed.id, activityId));
  }

  // Photo Galleries Methods
  async getGalleries(filters?: { tags?: string[]; creatorId?: string }): Promise<Array<any>> {
    let query = db
      .select({
        id: galleries.id,
        creatorId: galleries.creatorId,
        title: galleries.title,
        description: galleries.description,
        tags: galleries.tags,
        likeCount: galleries.likeCount,
        imageCount: galleries.imageCount,
        createdAt: galleries.createdAt,
        creator: {
          id: users.id,
          fullName: users.fullName,
          profilePhotoUrl: users.profilePhotoUrl,
        },
      })
      .from(galleries)
      .leftJoin(users, eq(galleries.creatorId, users.id))
      .orderBy(desc(galleries.createdAt));

    const result = await query;
    return result;
  }

  async getGallery(galleryId: string): Promise<any> {
    const result = await db
      .select({
        id: galleries.id,
        creatorId: galleries.creatorId,
        title: galleries.title,
        description: galleries.description,
        tags: galleries.tags,
        likeCount: galleries.likeCount,
        imageCount: galleries.imageCount,
        createdAt: galleries.createdAt,
        creator: {
          id: users.id,
          fullName: users.fullName,
          profilePhotoUrl: users.profilePhotoUrl,
        },
      })
      .from(galleries)
      .leftJoin(users, eq(galleries.creatorId, users.id))
      .where(eq(galleries.id, galleryId));

    if (result.length === 0) return undefined;

    // Get images for this gallery
    const images = await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.galleryId, galleryId))
      .orderBy(galleryImages.sortOrder);

    return { ...result[0], images };
  }

  async createGallery(gallery: { creatorId: string; title: string; description?: string; tags?: string[] }): Promise<any> {
    const result = await db
      .insert(galleries)
      .values({
        creatorId: gallery.creatorId,
        title: gallery.title,
        description: gallery.description || null,
        tags: gallery.tags || [],
      })
      .returning();

    return result[0];
  }

  async uploadGalleryImage(galleryId: string, image: { imageUrl: string; caption?: string; sortOrder?: number }): Promise<any> {
    const result = await db
      .insert(galleryImages)
      .values({
        galleryId,
        imageUrl: image.imageUrl,
        caption: image.caption || null,
        sortOrder: image.sortOrder || 0,
      })
      .returning();

    // Increment image count
    await db
      .update(galleries)
      .set({ imageCount: sql`${galleries.imageCount} + 1` })
      .where(eq(galleries.id, galleryId));

    return result[0];
  }

  async likeGallery(galleryId: string, userId: string): Promise<void> {
    // Check if already liked
    const existing = await db
      .select()
      .from(galleryLikes)
      .where(and(eq(galleryLikes.galleryId, galleryId), eq(galleryLikes.userId, userId)));

    if (existing.length > 0) {
      return; // Already liked
    }

    // Add like
    await db.insert(galleryLikes).values({ galleryId, userId });

    // Increment like count
    await db
      .update(galleries)
      .set({ likeCount: sql`${galleries.likeCount} + 1` })
      .where(eq(galleries.id, galleryId));
  }

  async unlikeGallery(galleryId: string, userId: string): Promise<void> {
    // Remove like
    await db
      .delete(galleryLikes)
      .where(and(eq(galleryLikes.galleryId, galleryId), eq(galleryLikes.userId, userId)));

    // Decrement like count
    await db
      .update(galleries)
      .set({ likeCount: sql`${galleries.likeCount} - 1` })
      .where(eq(galleries.id, galleryId));
  }

  // User Presence Methods
  async updateUserPresence(userId: string, status: 'online' | 'offline'): Promise<void> {
    const existing = await db
      .select()
      .from(userPresence)
      .where(eq(userPresence.userId, userId));

    if (existing.length === 0) {
      // Create presence record
      await db.insert(userPresence).values({
        userId,
        status,
        lastSeenAt: new Date(),
      });
    } else {
      // Update presence record
      await db
        .update(userPresence)
        .set({
          status,
          lastSeenAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userPresence.userId, userId));
    }
  }

  async getOnlineUsers(): Promise<Array<any>> {
    const result = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        profilePhotoUrl: users.profilePhotoUrl,
        occupation: users.occupation,
        company: users.company,
        flatNumber: users.flatNumber,
        lastSeenAt: userPresence.lastSeenAt,
      })
      .from(userPresence)
      .leftJoin(users, eq(userPresence.userId, users.id))
      .where(eq(userPresence.status, 'online'))
      .orderBy(desc(userPresence.lastSeenAt));

    return result;
  }

  async getUserPresence(userId: string): Promise<any> {
    const result = await db
      .select()
      .from(userPresence)
      .where(eq(userPresence.userId, userId));

    return result.length > 0 ? result[0] : null;
  }

  // Marketplace Methods
  async createMarketplaceItem(data: any): Promise<any> {
    const result = await db.insert(marketplaceItems).values(data).returning();
    return result[0];
  }

  async getMarketplaceItems(filters?: {
    category?: string;
    listingType?: string;
    status?: string;
    sellerId?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
  }): Promise<Array<any>> {
    let query = db
      .select({
        id: marketplaceItems.id,
        seller: {
          id: users.id,
          fullName: users.fullName,
          profilePhotoUrl: users.profilePhotoUrl,
          flatNumber: users.flatNumber,
        },
        title: marketplaceItems.title,
        description: marketplaceItems.description,
        category: marketplaceItems.category,
        condition: marketplaceItems.condition,
        listingType: marketplaceItems.listingType,
        price: marketplaceItems.price,
        negotiable: marketplaceItems.negotiable,
        images: marketplaceItems.images,
        location: marketplaceItems.location,
        status: marketplaceItems.status,
        viewCount: marketplaceItems.viewCount,
        favoriteCount: marketplaceItems.favoriteCount,
        createdAt: marketplaceItems.createdAt,
        updatedAt: marketplaceItems.updatedAt,
      })
      .from(marketplaceItems)
      .leftJoin(users, eq(marketplaceItems.sellerId, users.id))
      .orderBy(desc(marketplaceItems.createdAt))
      .$dynamic();

    const conditions = [];
    
    if (filters?.category) {
      conditions.push(eq(marketplaceItems.category, filters.category));
    }
    if (filters?.listingType) {
      conditions.push(eq(marketplaceItems.listingType, filters.listingType));
    }
    if (filters?.status) {
      conditions.push(eq(marketplaceItems.status, filters.status));
    } else {
      conditions.push(eq(marketplaceItems.status, 'available'));
    }
    if (filters?.sellerId) {
      conditions.push(eq(marketplaceItems.sellerId, filters.sellerId));
    }
    if (filters?.minPrice) {
      conditions.push(gte(marketplaceItems.price, filters.minPrice));
    }
    if (filters?.maxPrice) {
      conditions.push(lte(marketplaceItems.price, filters.maxPrice));
    }
    if (filters?.searchQuery) {
      conditions.push(
        or(
          ilike(marketplaceItems.title, `%${filters.searchQuery}%`),
          ilike(marketplaceItems.description, `%${filters.searchQuery}%`)
        )!
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)!);
    }

    const result = await query;
    return result;
  }

  async getMarketplaceItem(id: string): Promise<any> {
    const result = await db
      .select({
        id: marketplaceItems.id,
        seller: {
          id: users.id,
          fullName: users.fullName,
          profilePhotoUrl: users.profilePhotoUrl,
          flatNumber: users.flatNumber,
          phoneNumber: users.phoneNumber,
          email: users.email,
        },
        title: marketplaceItems.title,
        description: marketplaceItems.description,
        category: marketplaceItems.category,
        condition: marketplaceItems.condition,
        listingType: marketplaceItems.listingType,
        price: marketplaceItems.price,
        negotiable: marketplaceItems.negotiable,
        images: marketplaceItems.images,
        location: marketplaceItems.location,
        status: marketplaceItems.status,
        viewCount: marketplaceItems.viewCount,
        favoriteCount: marketplaceItems.favoriteCount,
        soldAt: marketplaceItems.soldAt,
        soldTo: marketplaceItems.soldTo,
        createdAt: marketplaceItems.createdAt,
        updatedAt: marketplaceItems.updatedAt,
      })
      .from(marketplaceItems)
      .leftJoin(users, eq(marketplaceItems.sellerId, users.id))
      .where(eq(marketplaceItems.id, id));

    // Increment view count
    if (result.length > 0) {
      await db
        .update(marketplaceItems)
        .set({ viewCount: sql`${marketplaceItems.viewCount} + 1` })
        .where(eq(marketplaceItems.id, id));
    }

    return result.length > 0 ? result[0] : null;
  }

  async updateMarketplaceItem(id: string, sellerId: string, data: any): Promise<any> {
    // Verify seller owns the item
    const item = await db
      .select()
      .from(marketplaceItems)
      .where(and(eq(marketplaceItems.id, id), eq(marketplaceItems.sellerId, sellerId))!);

    if (item.length === 0) {
      throw new Error('Unauthorized');
    }

    const result = await db
      .update(marketplaceItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(marketplaceItems.id, id))
      .returning();

    return result[0];
  }

  async deleteMarketplaceItem(id: string, sellerId: string): Promise<void> {
    // Verify seller owns the item
    const item = await db
      .select()
      .from(marketplaceItems)
      .where(and(eq(marketplaceItems.id, id), eq(marketplaceItems.sellerId, sellerId))!);

    if (item.length === 0) {
      throw new Error('Unauthorized');
    }

    await db
      .update(marketplaceItems)
      .set({ status: 'deleted', updatedAt: new Date() })
      .where(eq(marketplaceItems.id, id));
  }

  async markItemAsSold(id: string, sellerId: string, buyerId: string): Promise<any> {
    // Verify seller owns the item
    const item = await db
      .select()
      .from(marketplaceItems)
      .where(and(eq(marketplaceItems.id, id), eq(marketplaceItems.sellerId, sellerId))!);

    if (item.length === 0) {
      throw new Error('Unauthorized');
    }

    const result = await db
      .update(marketplaceItems)
      .set({
        status: 'sold',
        soldAt: new Date(),
        soldTo: buyerId,
        updatedAt: new Date(),
      })
      .where(eq(marketplaceItems.id, id))
      .returning();

    return result[0];
  }

  async toggleMarketplaceFavorite(itemId: string, userId: string): Promise<{ isFavorited: boolean }> {
    const existing = await db
      .select()
      .from(marketplaceFavorites)
      .where(and(eq(marketplaceFavorites.itemId, itemId), eq(marketplaceFavorites.userId, userId))!);

    if (existing.length > 0) {
      await db
        .delete(marketplaceFavorites)
        .where(and(eq(marketplaceFavorites.itemId, itemId), eq(marketplaceFavorites.userId, userId))!);
      
      await db
        .update(marketplaceItems)
        .set({ favoriteCount: sql`${marketplaceItems.favoriteCount} - 1` })
        .where(eq(marketplaceItems.id, itemId));

      return { isFavorited: false };
    } else {
      await db.insert(marketplaceFavorites).values({ itemId, userId });
      
      await db
        .update(marketplaceItems)
        .set({ favoriteCount: sql`${marketplaceItems.favoriteCount} + 1` })
        .where(eq(marketplaceItems.id, itemId));

      return { isFavorited: true };
    }
  }

  async createMarketplaceOffer(data: any): Promise<any> {
    const result = await db.insert(marketplaceOffers).values(data).returning();
    return result[0];
  }

  async getMarketplaceOffers(itemId: string, sellerId: string): Promise<Array<any>> {
    // Verify seller owns the item
    const item = await db
      .select()
      .from(marketplaceItems)
      .where(and(eq(marketplaceItems.id, itemId), eq(marketplaceItems.sellerId, sellerId))!);

    if (item.length === 0) {
      throw new Error('Unauthorized');
    }

    const result = await db
      .select({
        id: marketplaceOffers.id,
        buyer: {
          id: users.id,
          fullName: users.fullName,
          profilePhotoUrl: users.profilePhotoUrl,
          flatNumber: users.flatNumber,
        },
        offerAmount: marketplaceOffers.offerAmount,
        exchangeOffer: marketplaceOffers.exchangeOffer,
        message: marketplaceOffers.message,
        status: marketplaceOffers.status,
        createdAt: marketplaceOffers.createdAt,
        respondedAt: marketplaceOffers.respondedAt,
      })
      .from(marketplaceOffers)
      .leftJoin(users, eq(marketplaceOffers.buyerId, users.id))
      .where(eq(marketplaceOffers.itemId, itemId))
      .orderBy(desc(marketplaceOffers.createdAt));

    return result;
  }

  async updateOfferStatus(offerId: string, sellerId: string, status: string): Promise<any> {
    // Verify seller owns the item
    const offer = await db
      .select({
        offer: marketplaceOffers,
        item: marketplaceItems,
      })
      .from(marketplaceOffers)
      .leftJoin(marketplaceItems, eq(marketplaceOffers.itemId, marketplaceItems.id))
      .where(eq(marketplaceOffers.id, offerId));

    if (offer.length === 0 || !offer[0].item || offer[0].item.sellerId !== sellerId) {
      throw new Error('Unauthorized');
    }

    const result = await db
      .update(marketplaceOffers)
      .set({ status, respondedAt: new Date() })
      .where(eq(marketplaceOffers.id, offerId))
      .returning();

    return result[0];
  }

  async createMarketplaceReview(data: any): Promise<any> {
    const result = await db.insert(marketplaceReviews).values(data).returning();
    return result[0];
  }

  async getUserMarketplaceFavorites(userId: string): Promise<Array<any>> {
    const result = await db
      .select({
        id: marketplaceItems.id,
        seller: {
          id: users.id,
          fullName: users.fullName,
          profilePhotoUrl: users.profilePhotoUrl,
          flatNumber: users.flatNumber,
        },
        title: marketplaceItems.title,
        description: marketplaceItems.description,
        category: marketplaceItems.category,
        condition: marketplaceItems.condition,
        listingType: marketplaceItems.listingType,
        price: marketplaceItems.price,
        negotiable: marketplaceItems.negotiable,
        images: marketplaceItems.images,
        location: marketplaceItems.location,
        status: marketplaceItems.status,
        viewCount: marketplaceItems.viewCount,
        favoriteCount: marketplaceItems.favoriteCount,
        createdAt: marketplaceItems.createdAt,
        favoritedAt: marketplaceFavorites.createdAt,
      })
      .from(marketplaceFavorites)
      .leftJoin(marketplaceItems, eq(marketplaceFavorites.itemId, marketplaceItems.id))
      .leftJoin(users, eq(marketplaceItems.sellerId, users.id))
      .where(eq(marketplaceFavorites.userId, userId))
      .orderBy(desc(marketplaceFavorites.createdAt));

    return result;
  }

  async getRentalItems(filters: any = {}): Promise<Array<any>> {
    let query = db
      .select({
        id: rentalItems.id,
        owner: {
          id: users.id,
          fullName: users.fullName,
          profilePhotoUrl: users.profilePhotoUrl,
          flatNumber: users.flatNumber,
        },
        itemName: rentalItems.itemName,
        description: rentalItems.description,
        category: rentalItems.category,
        condition: rentalItems.condition,
        images: rentalItems.images,
        rentalPrice: rentalItems.rentalPrice,
        priceUnit: rentalItems.priceUnit,
        deposit: rentalItems.deposit,
        minRentalDuration: rentalItems.minRentalDuration,
        maxRentalDuration: rentalItems.maxRentalDuration,
        location: rentalItems.location,
        availability: rentalItems.availability,
        favoriteCount: rentalItems.favoriteCount,
        totalRentals: rentalItems.totalRentals,
        averageRating: rentalItems.averageRating,
        createdAt: rentalItems.createdAt,
      })
      .from(rentalItems)
      .leftJoin(users, eq(rentalItems.ownerId, users.id));

    const conditions = [];

    // Only filter by availability for public queries (not owner queries)
    if (!filters.ownerId && filters.availability !== undefined) {
      conditions.push(eq(rentalItems.availability, filters.availability));
    } else if (!filters.ownerId) {
      // Default: show only available items for public browsing
      conditions.push(eq(rentalItems.availability, 'available'));
    }

    if (filters.category) {
      conditions.push(eq(rentalItems.category, filters.category));
    }

    if (filters.ownerId) {
      conditions.push(eq(rentalItems.ownerId, filters.ownerId));
    }

    if (filters.minPrice) {
      conditions.push(gte(rentalItems.rentalPrice, filters.minPrice));
    }

    if (filters.maxPrice) {
      conditions.push(lte(rentalItems.rentalPrice, filters.maxPrice));
    }

    if (filters.searchQuery) {
      conditions.push(
        or(
          ilike(rentalItems.itemName, `%${filters.searchQuery}%`),
          ilike(rentalItems.description, `%${filters.searchQuery}%`)
        )!
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(rentalItems.createdAt));
    return result;
  }

  async createRentalItem(data: any): Promise<any> {
    const result = await db.insert(rentalItems).values({
      id: randomUUID(),
      ...data,
    }).returning();
    return result[0];
  }

  async getRentalItem(itemId: string): Promise<any> {
    const result = await db
      .select({
        id: rentalItems.id,
        owner: {
          id: users.id,
          fullName: users.fullName,
          profilePhotoUrl: users.profilePhotoUrl,
          flatNumber: users.flatNumber,
          phoneNumber: users.phoneNumber,
        },
        itemName: rentalItems.itemName,
        description: rentalItems.description,
        category: rentalItems.category,
        condition: rentalItems.condition,
        images: rentalItems.images,
        rentalPrice: rentalItems.rentalPrice,
        priceUnit: rentalItems.priceUnit,
        deposit: rentalItems.deposit,
        minRentalDuration: rentalItems.minRentalDuration,
        maxRentalDuration: rentalItems.maxRentalDuration,
        location: rentalItems.location,
        availability: rentalItems.availability,
        favoriteCount: rentalItems.favoriteCount,
        totalRentals: rentalItems.totalRentals,
        averageRating: rentalItems.averageRating,
        createdAt: rentalItems.createdAt,
      })
      .from(rentalItems)
      .leftJoin(users, eq(rentalItems.ownerId, users.id))
      .where(eq(rentalItems.id, itemId));

    return result[0] || null;
  }

  async updateRentalItem(itemId: string, ownerId: string, updates: any): Promise<any> {
    const existingItem = await db
      .select()
      .from(rentalItems)
      .where(eq(rentalItems.id, itemId));

    if (existingItem.length === 0 || existingItem[0].ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    const result = await db
      .update(rentalItems)
      .set(updates)
      .where(eq(rentalItems.id, itemId))
      .returning();

    return result[0];
  }

  async deleteRentalItem(itemId: string, ownerId: string): Promise<void> {
    const existingItem = await db
      .select()
      .from(rentalItems)
      .where(eq(rentalItems.id, itemId));

    if (existingItem.length === 0 || existingItem[0].ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    await db.delete(rentalItems).where(eq(rentalItems.id, itemId));
  }

  async checkRentalAvailability(itemId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const conflicts = await db
      .select()
      .from(rentalBookings)
      .where(
        and(
          eq(rentalBookings.itemId, itemId),
          or(
            eq(rentalBookings.status, 'confirmed'),
            eq(rentalBookings.status, 'active')
          ),
          or(
            and(
              lte(rentalBookings.startDate, startDate),
              gte(rentalBookings.endDate, startDate)
            ),
            and(
              lte(rentalBookings.startDate, endDate),
              gte(rentalBookings.endDate, endDate)
            ),
            and(
              gte(rentalBookings.startDate, startDate),
              lte(rentalBookings.endDate, endDate)
            )
          )
        )
      );

    return conflicts.length === 0;
  }

  async createRentalBooking(data: any): Promise<any> {
    const isAvailable = await this.checkRentalAvailability(data.itemId, data.startDate, data.endDate);
    if (!isAvailable) {
      throw new Error('Item not available for selected dates');
    }

    const result = await db.insert(rentalBookings).values({
      id: randomUUID(),
      ...data,
      status: 'pending',
    }).returning();

    return result[0];
  }

  async getRentalBookings(itemId: string, ownerId: string): Promise<Array<any>> {
    const item = await db
      .select()
      .from(rentalItems)
      .where(eq(rentalItems.id, itemId));

    if (item.length === 0 || item[0].ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    const result = await db
      .select({
        id: rentalBookings.id,
        renter: {
          id: users.id,
          fullName: users.fullName,
          profilePhotoUrl: users.profilePhotoUrl,
          flatNumber: users.flatNumber,
        },
        startDate: rentalBookings.startDate,
        endDate: rentalBookings.endDate,
        totalAmount: rentalBookings.totalAmount,
        depositPaid: rentalBookings.depositPaid,
        status: rentalBookings.status,
        notes: rentalBookings.notes,
        createdAt: rentalBookings.createdAt,
        confirmedAt: rentalBookings.confirmedAt,
        completedAt: rentalBookings.completedAt,
      })
      .from(rentalBookings)
      .leftJoin(users, eq(rentalBookings.renterId, users.id))
      .where(eq(rentalBookings.itemId, itemId))
      .orderBy(desc(rentalBookings.createdAt));

    return result;
  }

  async getUserRentalBookings(userId: string): Promise<Array<any>> {
    const result = await db
      .select({
        id: rentalBookings.id,
        item: {
          id: rentalItems.id,
          itemName: rentalItems.itemName,
          images: rentalItems.images,
          rentalPrice: rentalItems.rentalPrice,
          priceUnit: rentalItems.priceUnit,
        },
        owner: {
          id: users.id,
          fullName: users.fullName,
          profilePhotoUrl: users.profilePhotoUrl,
          flatNumber: users.flatNumber,
        },
        startDate: rentalBookings.startDate,
        endDate: rentalBookings.endDate,
        totalAmount: rentalBookings.totalAmount,
        depositPaid: rentalBookings.depositPaid,
        status: rentalBookings.status,
        notes: rentalBookings.notes,
        createdAt: rentalBookings.createdAt,
        confirmedAt: rentalBookings.confirmedAt,
        completedAt: rentalBookings.completedAt,
      })
      .from(rentalBookings)
      .leftJoin(rentalItems, eq(rentalBookings.itemId, rentalItems.id))
      .leftJoin(users, eq(rentalItems.ownerId, users.id))
      .where(eq(rentalBookings.renterId, userId))
      .orderBy(desc(rentalBookings.createdAt));

    return result;
  }

  async updateBookingStatus(bookingId: string, ownerId: string, status: string): Promise<any> {
    const booking = await db
      .select({
        booking: rentalBookings,
        item: rentalItems,
      })
      .from(rentalBookings)
      .leftJoin(rentalItems, eq(rentalBookings.itemId, rentalItems.id))
      .where(eq(rentalBookings.id, bookingId));

    if (booking.length === 0 || !booking[0].item || booking[0].item.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    const updates: any = { status };
    if (status === 'confirmed') updates.confirmedAt = new Date();
    if (status === 'completed') updates.completedAt = new Date();

    const result = await db
      .update(rentalBookings)
      .set(updates)
      .where(eq(rentalBookings.id, bookingId))
      .returning();

    return result[0];
  }

  async toggleRentalFavorite(itemId: string, userId: string): Promise<{ favorited: boolean }> {
    const existing = await db
      .select()
      .from(rentalFavorites)
      .where(
        and(
          eq(rentalFavorites.itemId, itemId),
          eq(rentalFavorites.userId, userId)
        )
      );

    if (existing.length > 0) {
      await db
        .delete(rentalFavorites)
        .where(
          and(
            eq(rentalFavorites.itemId, itemId),
            eq(rentalFavorites.userId, userId)
          )
        );

      await db
        .update(rentalItems)
        .set({ favoriteCount: sql`${rentalItems.favoriteCount} - 1` })
        .where(eq(rentalItems.id, itemId));

      return { favorited: false };
    } else {
      await db.insert(rentalFavorites).values({
        id: randomUUID(),
        itemId,
        userId,
      });

      await db
        .update(rentalItems)
        .set({ favoriteCount: sql`${rentalItems.favoriteCount} + 1` })
        .where(eq(rentalItems.id, itemId));

      return { favorited: true };
    }
  }

  async getUserRentalFavorites(userId: string): Promise<Array<any>> {
    const result = await db
      .select({
        id: rentalItems.id,
        owner: {
          id: users.id,
          fullName: users.fullName,
          profilePhotoUrl: users.profilePhotoUrl,
          flatNumber: users.flatNumber,
        },
        itemName: rentalItems.itemName,
        description: rentalItems.description,
        category: rentalItems.category,
        condition: rentalItems.condition,
        images: rentalItems.images,
        rentalPrice: rentalItems.rentalPrice,
        priceUnit: rentalItems.priceUnit,
        deposit: rentalItems.deposit,
        location: rentalItems.location,
        availability: rentalItems.availability,
        favoriteCount: rentalItems.favoriteCount,
        averageRating: rentalItems.averageRating,
        createdAt: rentalItems.createdAt,
        favoritedAt: rentalFavorites.createdAt,
      })
      .from(rentalFavorites)
      .leftJoin(rentalItems, eq(rentalFavorites.itemId, rentalItems.id))
      .leftJoin(users, eq(rentalItems.ownerId, users.id))
      .where(eq(rentalFavorites.userId, userId))
      .orderBy(desc(rentalFavorites.createdAt));

    return result;
  }

  async createRentalReview(data: any): Promise<any> {
    const result = await db.insert(rentalReviews).values({
      id: randomUUID(),
      ...data,
    }).returning();

    const reviews = await db
      .select()
      .from(rentalReviews)
      .where(eq(rentalReviews.itemId, data.itemId));

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await db
      .update(rentalItems)
      .set({ averageRating: avgRating })
      .where(eq(rentalItems.id, data.itemId));

    return result[0];
  }

  async getAdvertisements(filters: any = {}): Promise<Array<any>> {
    let query = db
      .select({
        id: advertisements.id,
        advertiser: {
          id: users.id,
          fullName: users.fullName,
          profilePhotoUrl: users.profilePhotoUrl,
          flatNumber: users.flatNumber,
        },
        title: advertisements.title,
        description: advertisements.description,
        serviceCategory: advertisements.serviceCategory,
        imageUrl: advertisements.imageUrl,
        pricing: advertisements.pricing,
        contactInfo: advertisements.contactInfo,
        duration: advertisements.duration,
        startDate: advertisements.startDate,
        endDate: advertisements.endDate,
        status: advertisements.status,
        viewCount: advertisements.viewCount,
        clickCount: advertisements.clickCount,
        createdAt: advertisements.createdAt,
      })
      .from(advertisements)
      .leftJoin(users, eq(advertisements.advertiserId, users.id));

    const conditions = [];

    if (filters.status) {
      conditions.push(eq(advertisements.status, filters.status));
    } else if (!filters.advertiserId) {
      // Public: only show active ads
      conditions.push(eq(advertisements.status, 'active'));
    }

    if (filters.advertiserId) {
      conditions.push(eq(advertisements.advertiserId, filters.advertiserId));
    }

    if (filters.serviceCategory) {
      conditions.push(eq(advertisements.serviceCategory, filters.serviceCategory));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(advertisements.createdAt));
    return result;
  }

  async createAdvertisement(data: any): Promise<any> {
    const result = await db.insert(advertisements).values({
      id: randomUUID(),
      ...data,
      status: 'pending',
    }).returning();
    return result[0];
  }

  async getAdvertisement(adId: string): Promise<any> {
    const result = await db
      .select({
        id: advertisements.id,
        advertiser: {
          id: users.id,
          fullName: users.fullName,
          profilePhotoUrl: users.profilePhotoUrl,
          flatNumber: users.flatNumber,
          phoneNumber: users.phoneNumber,
          email: users.email,
        },
        title: advertisements.title,
        description: advertisements.description,
        serviceCategory: advertisements.serviceCategory,
        imageUrl: advertisements.imageUrl,
        servicePageContent: advertisements.servicePageContent,
        pricing: advertisements.pricing,
        contactInfo: advertisements.contactInfo,
        duration: advertisements.duration,
        startDate: advertisements.startDate,
        endDate: advertisements.endDate,
        status: advertisements.status,
        viewCount: advertisements.viewCount,
        clickCount: advertisements.clickCount,
        rejectionReason: advertisements.rejectionReason,
        createdAt: advertisements.createdAt,
      })
      .from(advertisements)
      .leftJoin(users, eq(advertisements.advertiserId, users.id))
      .where(eq(advertisements.id, adId));

    return result[0] || null;
  }

  async updateAdvertisement(adId: string, advertiserId: string, updates: any): Promise<any> {
    const existingAd = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.id, adId));

    if (existingAd.length === 0 || existingAd[0].advertiserId !== advertiserId) {
      throw new Error('Unauthorized');
    }

    const result = await db
      .update(advertisements)
      .set(updates)
      .where(eq(advertisements.id, adId))
      .returning();

    return result[0];
  }

  async deleteAdvertisement(adId: string, advertiserId: string): Promise<void> {
    const existingAd = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.id, adId));

    if (existingAd.length === 0 || existingAd[0].advertiserId !== advertiserId) {
      throw new Error('Unauthorized');
    }

    await db.delete(advertisements).where(eq(advertisements.id, adId));
  }

  async approveAdvertisement(adId: string, duration: number): Promise<any> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const result = await db
      .update(advertisements)
      .set({
        status: 'active',
        startDate,
        endDate,
      })
      .where(eq(advertisements.id, adId))
      .returning();

    return result[0];
  }

  async rejectAdvertisement(adId: string, reason: string): Promise<any> {
    const result = await db
      .update(advertisements)
      .set({
        status: 'rejected',
        rejectionReason: reason,
      })
      .where(eq(advertisements.id, adId))
      .returning();

    return result[0];
  }

  async trackAdView(adId: string, userId?: string): Promise<void> {
    await db
      .update(advertisements)
      .set({ viewCount: sql`${advertisements.viewCount} + 1` })
      .where(eq(advertisements.id, adId));

    await db.insert(adAnalytics).values({
      id: randomUUID(),
      advertisementId: adId,
      userId: userId || null,
      action: 'view',
    });
  }

  async trackAdClick(adId: string, userId?: string): Promise<void> {
    await db
      .update(advertisements)
      .set({ clickCount: sql`${advertisements.clickCount} + 1` })
      .where(eq(advertisements.id, adId));

    await db.insert(adAnalytics).values({
      id: randomUUID(),
      advertisementId: adId,
      userId: userId || null,
      action: 'click',
    });
  }

  async createAdPayment(data: any): Promise<any> {
    const result = await db.insert(adPayments).values({
      id: randomUUID(),
      ...data,
      status: 'pending',
    }).returning();
    return result[0];
  }

  async getAdPayment(paymentId: string): Promise<any> {
    const result = await db
      .select()
      .from(adPayments)
      .where(eq(adPayments.id, paymentId));

    return result[0] || null;
  }

  async updateAdPaymentStatus(paymentId: string, updates: any): Promise<any> {
    const result = await db
      .update(adPayments)
      .set(updates)
      .where(eq(adPayments.id, paymentId))
      .returning();

    return result[0];
  }

  async getAdAnalytics(adId: string): Promise<any> {
    const analytics = await db
      .select()
      .from(adAnalytics)
      .where(eq(adAnalytics.advertisementId, adId))
      .orderBy(desc(adAnalytics.createdAt));

    const viewCount = analytics.filter(a => a.action === 'view').length;
    const clickCount = analytics.filter(a => a.action === 'click').length;

    return {
      totalViews: viewCount,
      totalClicks: clickCount,
      clickThroughRate: viewCount > 0 ? (clickCount / viewCount) * 100 : 0,
      analytics,
    };
  }
}

export const storage = new PostgresStorage();
