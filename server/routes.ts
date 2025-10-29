import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { getPhoneNumberFromToken, verifyIdToken } from "./firebase-admin";
import { insertUserSchema, insertMessageSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";

interface AuthRequest extends Request {
  userId?: string;
}

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  conversationId?: string;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

async function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    req.userId = decodedToken.uid;
    next();
  } catch (error: any) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ error: "ID token required" });
      }

      const phoneNumber = await getPhoneNumberFromToken(idToken);
      
      const existingUser = await storage.getUserByPhone(phoneNumber);
      
      return res.json({
        phoneNumber,
        userExists: !!existingUser,
        user: existingUser || null,
      });
    } catch (error: any) {
      console.error('Auth verification error:', error);
      return res.status(401).json({ error: error.message || "Authentication failed" });
    }
  });

  app.post("/api/users/register", async (req, res) => {
    try {
      const { idToken, ...userData } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ error: "ID token required" });
      }

      const decodedToken = await verifyIdToken(idToken);
      const phoneNumber = decodedToken.phone_number;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number not found in token" });
      }
      
      const existingUser = await storage.getUserByPhone(phoneNumber);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const validatedData = insertUserSchema.parse({
        ...userData,
        phoneNumber,
      });

      const user = await storage.createUser(validatedData);
      
      const techStackBadges = getBadgesFromTechStack(user.techStack);
      const badges = ['First Member', ...techStackBadges];
      const points = 50;
      
      const updatedUser = await storage.updateUserPointsAndBadges(user.id, points, badges);
      
      return res.status(201).json(updatedUser);
    } catch (error: any) {
      if (error.message === 'Invalid token') {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return res.status(400).json({ error: "Registration failed" });
    }
  });

  app.post("/api/users/upload-photo", upload.single('photo'), async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await verifyIdToken(idToken);
      const userId = decodedToken.uid;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const uploadsDir = path.join(process.cwd(), 'uploads', 'profiles');
      await fs.mkdir(uploadsDir, { recursive: true });

      const ext = path.extname(req.file.originalname).toLowerCase();
      const safeFilename = `${userId}-${randomUUID()}${ext}`;
      const filepath = path.join(uploadsDir, safeFilename);
      
      await fs.writeFile(filepath, req.file.buffer);

      const photoUrl = `/uploads/profiles/${safeFilename}`;
      
      return res.json({ photoUrl });
    } catch (error: any) {
      if (error.message === 'Invalid token') {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return res.status(500).json({ error: "Upload failed" });
    }
  });

  app.get("/api/users/search", async (req, res) => {
    try {
      const { techStack, minExperience, maxExperience, flatBlock } = req.query;
      
      const filters: any = {};
      
      if (techStack) {
        filters.techStack = Array.isArray(techStack) ? techStack : [techStack];
      }
      
      if (minExperience) {
        filters.minExperience = parseInt(minExperience as string, 10);
      }
      
      if (maxExperience) {
        filters.maxExperience = parseInt(maxExperience as string, 10);
      }
      
      if (flatBlock) {
        filters.flatBlock = flatBlock as string;
      }
      
      const users = await storage.searchUsers(filters);
      
      return res.json({ users });
    } catch (error: any) {
      console.error('Search error:', error);
      return res.status(500).json({ error: "Search failed" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      return res.json(user);
    } catch (error: any) {
      console.error('Get user error:', error);
      return res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.post("/api/conversations/create", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { otherUserId } = req.body;
      const userId = req.userId!;

      if (!otherUserId) {
        return res.status(400).json({ error: "Other user ID required" });
      }

      const conversation = await storage.getOrCreateConversation(userId, otherUserId);
      return res.json({ conversation });
    } catch (error: any) {
      console.error('Create conversation error:', error);
      return res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const conversations = await storage.getUserConversations(userId);
      return res.json({ conversations });
    } catch (error: any) {
      console.error('Get conversations error:', error);
      return res.status(500).json({ error: "Failed to get conversations" });
    }
  });

  app.post("/api/messages/send", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { conversationId, content } = req.body;
      const senderId = req.userId!;

      if (!conversationId || !content) {
        return res.status(400).json({ error: "Conversation ID and content required" });
      }

      if (!content.trim() || content.length > 5000) {
        return res.status(400).json({ error: "Message content must be between 1 and 5000 characters" });
      }

      const message = await storage.sendMessage(conversationId, senderId, content);
      return res.json({ message });
    } catch (error: any) {
      console.error('Send message error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/messages/:conversationId", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.userId!;
      const messages = await storage.getConversationMessages(conversationId, userId);
      return res.json({ messages });
    } catch (error: any) {
      console.error('Get messages error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to get messages" });
    }
  });

  app.post("/api/messages/:conversationId/read", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.userId!;
      
      await storage.markMessagesAsRead(conversationId, userId);
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Mark as read error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  app.get("/api/messages/unread/count", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const count = await storage.getUnreadCount(userId);
      return res.json({ count });
    } catch (error: any) {
      console.error('Get unread count error:', error);
      return res.status(500).json({ error: "Failed to get unread count" });
    }
  });

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'Token required');
      return;
    }

    try {
      const decodedToken = await verifyIdToken(token);
      ws.userId = decodedToken.uid;

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());

          if (message.type === 'subscribe') {
            const isParticipant = await storage.isConversationParticipant(
              message.conversationId,
              ws.userId!
            );
            if (!isParticipant) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Unauthorized: Not a participant of this conversation',
              }));
              return;
            }
            ws.conversationId = message.conversationId;
          } else if (message.type === 'message') {
            if (!message.content || !message.content.trim()) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Message content required',
              }));
              return;
            }

            if (message.content.length > 5000) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Message too long (max 5000 characters)',
              }));
              return;
            }

            const newMessage = await storage.sendMessage(
              message.conversationId,
              ws.userId!,
              message.content.trim()
            );

            wss.clients.forEach((client) => {
              const authClient = client as AuthenticatedWebSocket;
              if (
                client.readyState === WebSocket.OPEN &&
                authClient.conversationId === message.conversationId
              ) {
                client.send(JSON.stringify({
                  type: 'new_message',
                  message: newMessage,
                }));
              }
            });
          }
        } catch (error: any) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: error.message || 'An error occurred',
          }));
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });

      ws.send(JSON.stringify({ type: 'connected', userId: ws.userId }));
    } catch (error) {
      console.error('WebSocket auth error:', error);
      ws.close(1008, 'Authentication failed');
    }
  });

  return httpServer;
}

function getBadgesFromTechStack(techStack: string[]): string[] {
  const badges: string[] = [];
  if (techStack.includes('React')) badges.push('React Ninja');
  if (techStack.includes('Python')) badges.push('Python Pro');
  if (techStack.includes('AWS')) badges.push('AWS Guru');
  if (techStack.includes('Node.js')) badges.push('Node.js Expert');
  return badges;
}
