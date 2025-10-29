import { type User, type InsertUser, type Conversation, type InsertConversation, type Message, type InsertMessage, users, conversations, messages } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, gte, lte, like, sql, or, desc } from "drizzle-orm";

export interface SearchFilters {
  techStack?: string[];
  minExperience?: number;
  maxExperience?: number;
  flatBlock?: string;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPointsAndBadges(id: string, points: number, badges: string[]): Promise<User>;
  searchUsers(filters: SearchFilters): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  
  getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Array<Conversation & { otherUser: User; unreadCount: number; lastMessage?: Message }>>;
  sendMessage(conversationId: string, senderId: string, content: string): Promise<Message>;
  getConversationMessages(conversationId: string, userId: string): Promise<Message[]>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  isConversationParticipant(conversationId: string, userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
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
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      linkedinUrl: insertUser.linkedinUrl || null,
      githubUrl: insertUser.githubUrl || null,
      profilePhotoUrl: insertUser.profilePhotoUrl || null,
      id,
      points: 0,
      badges: [],
      createdAt: new Date(),
    };
    this.users.set(id, user);
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
}

export const storage = new PostgresStorage();
