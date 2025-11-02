import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { getPhoneNumberFromToken, verifyIdToken } from "./firebase-admin";
import { insertUserSchema, insertMessageSchema } from "@shared/schema";
import { createRazorpayOrder, verifyRazorpaySignature, getRazorpayKeyId } from "./razorpay";
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

const uploadPhoto = multer({
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

const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, or DOCX files are allowed'));
  },
});

const uploadJobAttachment = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf'
    ];
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPG, PNG, or PDF files are allowed'));
  },
});

const uploadChatFile = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (JPG, PNG, GIF, WebP), PDFs, and documents (DOC, DOCX) are allowed'));
  },
});

const uploadGalleryImage = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'galleries');
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
      const ext = path.extname(file.originalname);
      cb(null, `gallery-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per image
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'));
  },
});

const uploadLostFoundImage = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'lost-found');
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
      const ext = path.extname(file.originalname);
      cb(null, `lostfound-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per image
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'));
  },
});

const uploadAnnouncementImage = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'announcements');
      await fs.mkdir(uploadDir, { recursive: true});
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
      const ext = path.extname(file.originalname);
      cb(null, `announcement-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per image
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'));
  },
});

const uploadMarketplaceImage = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'marketplace');
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
      const ext = path.extname(file.originalname);
      cb(null, `marketplace-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per image
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'));
  },
});

const uploadRentalImage = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'rentals');
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
      const ext = path.extname(file.originalname);
      cb(null, `rental-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per image
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'));
  },
});

const uploadAdvertisementImage = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'advertisements');
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
      const ext = path.extname(file.originalname);
      cb(null, `advertisement-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per image
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'));
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

async function authorizeAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await storage.getUser(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    next();
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
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
      const userId = decodedToken.uid;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number not found in token" });
      }
      
      const existingUser = await storage.getUserByPhone(phoneNumber);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const validatedData = insertUserSchema.parse({
        id: userId,
        ...userData,
        phoneNumber,
      });

      const user = await storage.createUser(validatedData);
      
      const techStackBadges = getBadgesFromTechStack(user.techStack || []);
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

  app.post("/api/users/upload-photo", (req, res, next) => {
    uploadPhoto.single('photo')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: "File size too large. Maximum size is 5MB." });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message || "File upload failed" });
      }
      next();
    });
  }, async (req, res) => {
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

  app.post("/api/events/upload-image", (req, res, next) => {
    uploadPhoto.single('image')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: "File size too large. Maximum size is 5MB." });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message || "File upload failed" });
      }
      next();
    });
  }, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await verifyIdToken(idToken);

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const uploadsDir = path.join(process.cwd(), 'uploads', 'events');
      await fs.mkdir(uploadsDir, { recursive: true });

      const ext = path.extname(req.file.originalname).toLowerCase();
      const safeFilename = `event-${randomUUID()}${ext}`;
      const filepath = path.join(uploadsDir, safeFilename);
      
      await fs.writeFile(filepath, req.file.buffer);

      const imageUrl = `/uploads/events/${safeFilename}`;
      
      return res.json({ imageUrl });
    } catch (error: any) {
      if (error.message === 'Invalid token') {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return res.status(500).json({ error: "Upload failed" });
    }
  });

  app.get("/api/users/search", async (req, res) => {
    try {
      const { techStack, minExperience, maxExperience, flatBlock, excludeUserId } = req.query;
      
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
      
      if (excludeUserId) {
        filters.excludeUserId = excludeUserId as string;
      }
      
      const users = await storage.searchUsers(filters);
      
      return res.json({ users });
    } catch (error: any) {
      console.error('Search error:', error);
      return res.status(500).json({ error: "Search failed" });
    }
  });

  app.get("/api/services/:categoryId/users", async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { role } = req.query;
      
      const roleFilter = role === 'provider' || role === 'seeker' ? role : undefined;
      const users = await storage.getUsersByCategory(categoryId, roleFilter);
      
      return res.json({ users });
    } catch (error: any) {
      console.error('Get category users error:', error);
      return res.status(500).json({ error: "Failed to get users" });
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

  app.post("/api/messages/send-file", authenticateUser, (req: AuthRequest, res: Response, next: NextFunction) => {
    uploadChatFile.single('file')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: "File size too large. Maximum size is 10MB." });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message || "File upload failed" });
      }
      next();
    });
  }, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { conversationId, content } = req.body;

      if (!conversationId) {
        return res.status(400).json({ error: "Conversation ID required" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "File required" });
      }

      const uploadDir = path.join(process.cwd(), 'uploads', 'chat_files');
      await fs.mkdir(uploadDir, { recursive: true });

      const fileExt = path.extname(req.file.originalname);
      const fileName = `chat_${randomUUID()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.writeFile(filePath, req.file.buffer);

      const fileUrl = `/uploads/chat_files/${fileName}`;
      const fileType = req.file.mimetype;
      const originalFileName = req.file.originalname;

      const message = await storage.sendMessageWithFile(
        conversationId,
        userId,
        content || null,
        fileUrl,
        originalFileName,
        fileType
      );

      return res.status(201).json({ message });
    } catch (error: any) {
      console.error('Send file message error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to send file message" });
    }
  });

  app.post("/api/messages/:id/reactions", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: messageId } = req.params;
      const { emoji } = req.body;
      const userId = req.userId!;

      if (!emoji || typeof emoji !== 'string' || emoji.length > 10) {
        return res.status(400).json({ error: "Valid emoji required" });
      }

      const reaction = await storage.addMessageReaction(messageId, userId, emoji);
      return res.json({ reaction });
    } catch (error: any) {
      console.error('Add reaction error:', error);
      return res.status(500).json({ error: "Failed to add reaction" });
    }
  });

  app.delete("/api/messages/:id/reactions", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: messageId } = req.params;
      const { emoji } = req.body;
      const userId = req.userId!;

      if (!emoji) {
        return res.status(400).json({ error: "Emoji required" });
      }

      await storage.removeMessageReaction(messageId, userId, emoji);
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Remove reaction error:', error);
      return res.status(500).json({ error: "Failed to remove reaction" });
    }
  });

  app.get("/api/messages/:id/reactions", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: messageId } = req.params;
      const reactions = await storage.getMessageReactions(messageId);
      return res.json({ reactions });
    } catch (error: any) {
      console.error('Get reactions error:', error);
      return res.status(500).json({ error: "Failed to get reactions" });
    }
  });

  app.put("/api/conversations/:id/read-receipt", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: conversationId } = req.params;
      const { lastReadMessageId } = req.body;
      const userId = req.userId!;

      await storage.updateReadReceipt(conversationId, userId, lastReadMessageId);
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Update read receipt error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to update read receipt" });
    }
  });

  app.get("/api/conversations/:id/read-receipts", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: conversationId } = req.params;
      const userId = req.userId!;

      const receipts = await storage.getReadReceipts(conversationId, userId);
      return res.json({ receipts });
    } catch (error: any) {
      console.error('Get read receipts error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to get read receipts" });
    }
  });

  app.post("/api/jobs", authenticateUser, (req: AuthRequest, res: Response, next: NextFunction) => {
    uploadJobAttachment.single('attachment')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: "File size too large. Maximum size is 10MB." });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message || "File upload failed" });
      }
      next();
    });
  }, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      
      let attachmentUrl: string | undefined;
      if (req.file) {
        const uploadDir = path.join(process.cwd(), 'uploads', 'job_attachments');
        await fs.mkdir(uploadDir, { recursive: true });

        const fileExt = path.extname(req.file.originalname);
        const fileName = `job_${randomUUID()}${fileExt}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.writeFile(filePath, req.file.buffer);
        attachmentUrl = `/uploads/job_attachments/${fileName}`;
      }

      const requiredTechStack = typeof req.body.requiredTechStack === 'string' 
        ? JSON.parse(req.body.requiredTechStack)
        : req.body.requiredTechStack;

      const jobData = {
        ...req.body,
        requiredTechStack,
        posterId: userId,
        attachmentUrl,
      };
      
      const job = await storage.createJob(jobData);
      return res.status(201).json({ job });
    } catch (error: any) {
      console.error('Create job error:', error);
      return res.status(500).json({ error: "Failed to create job" });
    }
  });

  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      return res.json({ jobs });
    } catch (error: any) {
      console.error('Get jobs error:', error);
      return res.status(500).json({ error: "Failed to get jobs" });
    }
  });

  app.get("/api/jobs/count", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const count = await storage.getJobCount(userId);
      return res.json({ count });
    } catch (error: any) {
      console.error('Get job count error:', error);
      return res.status(500).json({ error: "Failed to get job count" });
    }
  });

  app.get("/api/jobs/my-jobs", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const jobs = await storage.getUserJobs(userId);
      return res.json({ jobs });
    } catch (error: any) {
      console.error('Get user jobs error:', error);
      return res.status(500).json({ error: "Failed to get user jobs" });
    }
  });

  app.get("/api/jobs/my-applications", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const applications = await storage.getUserApplications(userId);
      return res.json({ applications });
    } catch (error: any) {
      console.error('Get user applications error:', error);
      return res.status(500).json({ error: "Failed to get user applications" });
    }
  });

  app.get("/api/jobs/my-stats", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const jobs = await storage.getUserJobs(userId);
      const applications = await storage.getUserApplications(userId);
      return res.json({ 
        postedJobs: jobs.length,
        appliedJobs: applications.length 
      });
    } catch (error: any) {
      console.error('Get user job stats error:', error);
      return res.status(500).json({ error: "Failed to get user job stats" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      return res.json({ job });
    } catch (error: any) {
      console.error('Get job error:', error);
      return res.status(500).json({ error: "Failed to get job" });
    }
  });

  app.delete("/api/jobs/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      
      await storage.deleteJob(id, userId);
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Delete job error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to delete job" });
    }
  });

  app.post("/api/jobs/:id/apply", authenticateUser, (req: AuthRequest, res: Response, next: NextFunction) => {
    uploadResume.single('resume')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: "File size too large. Maximum size is 5MB." });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message || "File upload failed" });
      }
      next();
    });
  }, async (req: AuthRequest, res) => {
    try {
      const { id: jobId } = req.params;
      const userId = req.userId!;
      const { coverLetter } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "Resume file required" });
      }

      if (!coverLetter || coverLetter.trim().length === 0) {
        return res.status(400).json({ error: "Cover letter required" });
      }

      const hasApplied = await storage.hasUserApplied(jobId, userId);
      if (hasApplied) {
        return res.status(400).json({ error: "You have already applied to this job" });
      }

      const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
      await fs.mkdir(uploadsDir, { recursive: true });

      const ext = path.extname(req.file.originalname).toLowerCase();
      const safeFilename = `${userId}-${randomUUID()}${ext}`;
      const filepath = path.join(uploadsDir, safeFilename);
      
      await fs.writeFile(filepath, req.file.buffer);

      const resumeUrl = `/uploads/resumes/${safeFilename}`;

      const application = await storage.createJobApplication({
        jobId,
        applicantId: userId,
        resumeUrl,
        coverLetter,
      });

      return res.status(201).json({ application });
    } catch (error: any) {
      console.error('Apply to job error:', error);
      return res.status(500).json({ error: "Failed to apply to job" });
    }
  });

  app.get("/api/jobs/:id/applications", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: jobId } = req.params;
      const userId = req.userId!;

      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      if (job.posterId !== userId) {
        return res.status(403).json({ error: "Unauthorized: You can only view applications for your own jobs" });
      }

      const applications = await storage.getJobApplications(jobId);
      return res.json({ applications });
    } catch (error: any) {
      console.error('Get job applications error:', error);
      return res.status(500).json({ error: "Failed to get job applications" });
    }
  });

  app.get("/api/jobs/:id/applicants", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: jobId } = req.params;
      const userId = req.userId!;

      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      if (job.posterId !== userId) {
        return res.status(403).json({ error: "Unauthorized: You can only view applicants for your own jobs" });
      }

      const applications = await storage.getJobApplications(jobId);
      return res.json({ applications });
    } catch (error: any) {
      console.error('Get job applicants error:', error);
      return res.status(500).json({ error: "Failed to get job applicants" });
    }
  });

  app.get("/api/jobs/:id/stats", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: jobId } = req.params;
      const userId = req.userId!;

      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      if (job.posterId !== userId) {
        return res.status(403).json({ error: "Unauthorized: You can only view stats for your own jobs" });
      }

      const stats = await storage.getJobApplicationStats(jobId);
      return res.json({ stats });
    } catch (error: any) {
      console.error('Get job stats error:', error);
      return res.status(500).json({ error: "Failed to get job stats" });
    }
  });

  app.patch("/api/applications/:id/status", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: applicationId } = req.params;
      const { status } = req.body;
      const userId = req.userId!;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const validStatuses = ['pending', 'under-review', 'shortlisted', 'accepted', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }

      const application = await storage.updateApplicationStatus(applicationId, status, userId);
      return res.json({ application });
    } catch (error: any) {
      console.error('Update application status error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to update application status" });
    }
  });

  app.delete("/api/applications/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: applicationId } = req.params;
      const userId = req.userId!;

      await storage.withdrawApplication(applicationId, userId);
      return res.json({ message: "Application withdrawn successfully" });
    } catch (error: any) {
      console.error('Withdraw application error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to withdraw application" });
    }
  });

  app.post("/api/ideas", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { title, description, rolesNeeded, payStructure } = req.body;

      if (!title || !description || !rolesNeeded || !payStructure) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (description.length < 200) {
        return res.status(400).json({ error: "Description must be at least 200 characters" });
      }

      if (!Array.isArray(rolesNeeded) || rolesNeeded.length === 0) {
        return res.status(400).json({ error: "At least one role is required" });
      }

      const idea = await storage.createIdea({
        posterId: userId,
        title,
        description,
        rolesNeeded,
        payStructure,
      });

      return res.status(201).json({ idea });
    } catch (error: any) {
      console.error('Create idea error:', error);
      return res.status(500).json({ error: "Failed to create idea" });
    }
  });

  app.get("/api/ideas", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const ideas = await storage.getApprovedIdeas();
      return res.json({ ideas });
    } catch (error: any) {
      console.error('Get ideas error:', error);
      return res.status(500).json({ error: "Failed to fetch ideas" });
    }
  });

  app.get("/api/ideas/my-ideas", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const ideas = await storage.getUserIdeas(userId);
      return res.json({ ideas });
    } catch (error: any) {
      console.error('Get user ideas error:', error);
      return res.status(500).json({ error: "Failed to fetch user ideas" });
    }
  });

  app.get("/api/ideas/interests-count", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const count = await storage.getInterestCountForUserIdeas(userId);
      return res.json({ count });
    } catch (error: any) {
      console.error('Get interests count error:', error);
      return res.status(500).json({ error: "Failed to fetch interests count" });
    }
  });

  app.get("/api/ideas/my-stats", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const postedIdeas = await storage.getUserIdeas(userId);
      const interests = await storage.getInterestedIdeasForUser(userId);
      return res.json({ 
        postedIdeas: postedIdeas.length,
        interestedIdeas: interests.length 
      });
    } catch (error: any) {
      console.error('Get user idea stats error:', error);
      return res.status(500).json({ error: "Failed to get user idea stats" });
    }
  });

  app.get("/api/ideas/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const idea = await storage.getIdea(id);
      
      if (!idea) {
        return res.status(404).json({ error: "Idea not found" });
      }

      return res.json({ idea });
    } catch (error: any) {
      console.error('Get idea error:', error);
      return res.status(500).json({ error: "Failed to fetch idea" });
    }
  });

  app.patch("/api/ideas/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const updates = req.body;

      const idea = await storage.updateIdea(id, updates, userId);
      return res.json({ idea });
    } catch (error: any) {
      console.error('Update idea error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to update idea" });
    }
  });

  app.delete("/api/ideas/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      await storage.deleteIdea(id, userId);
      return res.json({ message: "Idea deleted successfully" });
    } catch (error: any) {
      console.error('Delete idea error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to delete idea" });
    }
  });

  app.post("/api/ideas/:id/express-interest", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: ideaId } = req.params;
      const userId = req.userId!;
      const { message } = req.body;

      const hasExpressed = await storage.hasUserExpressedInterest(ideaId, userId);
      if (hasExpressed) {
        return res.status(400).json({ error: "You have already expressed interest in this idea" });
      }

      const interest = await storage.expressInterest({
        ideaId,
        userId,
        message: message || null,
      });

      return res.status(201).json({ interest });
    } catch (error: any) {
      console.error('Express interest error:', error);
      return res.status(500).json({ error: "Failed to express interest" });
    }
  });

  app.get("/api/ideas/:id/interests", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: ideaId } = req.params;
      const userId = req.userId!;

      const idea = await storage.getIdea(ideaId);
      if (!idea) {
        return res.status(404).json({ error: "Idea not found" });
      }

      if (idea.posterId !== userId) {
        return res.status(403).json({ error: "Unauthorized: You can only view interests for your own ideas" });
      }

      const interests = await storage.getIdeaInterests(ideaId);
      return res.json({ interests });
    } catch (error: any) {
      console.error('Get idea interests error:', error);
      return res.status(500).json({ error: "Failed to fetch idea interests" });
    }
  });

  app.get("/api/ideas/:id/has-expressed-interest", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: ideaId } = req.params;
      const userId = req.userId!;

      const hasExpressed = await storage.hasUserExpressedInterest(ideaId, userId);
      return res.json({ hasExpressed });
    } catch (error: any) {
      console.error('Check interest error:', error);
      return res.status(500).json({ error: "Failed to check interest status" });
    }
  });

  app.post("/api/ideas/:id/upvote", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: ideaId } = req.params;
      const userId = req.userId!;

      const result = await storage.toggleUpvote(ideaId, userId);
      return res.json(result);
    } catch (error: any) {
      console.error('Toggle upvote error:', error);
      return res.status(500).json({ error: "Failed to toggle upvote" });
    }
  });

  app.get("/api/ideas/:id/has-upvoted", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: ideaId } = req.params;
      const userId = req.userId!;

      const hasUpvoted = await storage.hasUserUpvoted(ideaId, userId);
      return res.json({ hasUpvoted });
    } catch (error: any) {
      console.error('Check upvote error:', error);
      return res.status(500).json({ error: "Failed to check upvote status" });
    }
  });

  app.post("/api/ideas/:id/comments", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: ideaId } = req.params;
      const userId = req.userId!;
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: "Comment content is required" });
      }

      const comment = await storage.createComment({
        ideaId,
        userId,
        content: content.trim(),
      });

      return res.status(201).json({ comment });
    } catch (error: any) {
      console.error('Create comment error:', error);
      return res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.get("/api/ideas/:id/comments", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: ideaId } = req.params;

      const comments = await storage.getIdeaComments(ideaId);
      return res.json({ comments });
    } catch (error: any) {
      console.error('Get comments error:', error);
      return res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.delete("/api/comments/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: commentId } = req.params;
      const userId = req.userId!;

      await storage.deleteComment(commentId, userId);
      return res.json({ message: "Comment deleted successfully" });
    } catch (error: any) {
      console.error('Delete comment error:', error);
      const status = error.message.includes('Unauthorized') ? 403 : 
                     error.message.includes('not found') ? 404 : 500;
      return res.status(status).json({ error: error.message });
    }
  });

  app.post("/api/ideas/:id/apply-team", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: ideaId } = req.params;
      const userId = req.userId!;
      const { roleAppliedFor, message } = req.body;

      if (!roleAppliedFor || !message) {
        return res.status(400).json({ error: "Role and message are required" });
      }

      const hasApplied = await storage.hasUserAppliedToTeam(ideaId, userId);
      if (hasApplied) {
        return res.status(400).json({ error: "You have already applied to join this team" });
      }

      const application = await storage.applyToTeam({
        ideaId,
        applicantId: userId,
        roleAppliedFor,
        message,
      });

      return res.status(201).json({ application });
    } catch (error: any) {
      console.error('Apply to team error:', error);
      return res.status(500).json({ error: "Failed to apply to team" });
    }
  });

  app.get("/api/ideas/:id/team-applications", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: ideaId } = req.params;
      const userId = req.userId!;

      const idea = await storage.getIdea(ideaId);
      if (!idea) {
        return res.status(404).json({ error: "Idea not found" });
      }

      if (idea.posterId !== userId) {
        return res.status(403).json({ error: "Unauthorized: You can only view applications for your own ideas" });
      }

      const applications = await storage.getIdeaTeamApplications(ideaId);
      return res.json({ applications });
    } catch (error: any) {
      console.error('Get team applications error:', error);
      return res.status(500).json({ error: "Failed to fetch team applications" });
    }
  });

  app.get("/api/team-applications/my-applications", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;

      const applications = await storage.getUserTeamApplications(userId);
      return res.json({ applications });
    } catch (error: any) {
      console.error('Get my team applications error:', error);
      return res.status(500).json({ error: "Failed to fetch your team applications" });
    }
  });

  app.get("/api/ideas/:id/has-applied-team", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: ideaId } = req.params;
      const userId = req.userId!;

      const hasApplied = await storage.hasUserAppliedToTeam(ideaId, userId);
      return res.json({ hasApplied });
    } catch (error: any) {
      console.error('Check team application error:', error);
      return res.status(500).json({ error: "Failed to check application status" });
    }
  });

  app.patch("/api/team-applications/:id/status", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: applicationId } = req.params;
      const userId = req.userId!;
      const { status } = req.body;

      if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const application = await storage.updateTeamApplicationStatus(applicationId, status, userId);
      return res.json({ application });
    } catch (error: any) {
      console.error('Update application status error:', error);
      const statusCode = error.message.includes('Unauthorized') ? 403 : 
                        error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message });
    }
  });

  app.get("/api/ideas/:id/team-roster", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: ideaId } = req.params;

      const teamMembers = await storage.getAcceptedTeamMembers(ideaId);
      return res.json({ teamMembers });
    } catch (error: any) {
      console.error('Get team roster error:', error);
      return res.status(500).json({ error: "Failed to fetch team roster" });
    }
  });

  app.delete("/api/team-applications/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: applicationId } = req.params;
      const userId = req.userId!;

      await storage.withdrawTeamApplication(applicationId, userId);
      return res.json({ message: "Application withdrawn successfully" });
    } catch (error: any) {
      console.error('Withdraw team application error:', error);
      const status = error.message.includes('Unauthorized') ? 403 : 
                     error.message.includes('not found') ? 404 : 
                     error.message.includes('Can only withdraw') ? 400 : 500;
      return res.status(status).json({ error: error.message });
    }
  });

  app.get("/api/ideas/:id/team-stats", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: ideaId } = req.params;

      const stats = await storage.getTeamApplicationStats(ideaId);
      return res.json(stats);
    } catch (error: any) {
      console.error('Get team stats error:', error);
      return res.status(500).json({ error: "Failed to fetch team application stats" });
    }
  });

  app.put("/api/users/skills", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { skillsToTeach, skillsToLearn } = req.body;

      if (!Array.isArray(skillsToTeach) || !Array.isArray(skillsToLearn)) {
        return res.status(400).json({ error: "Skills must be arrays" });
      }

      const user = await storage.updateUserSkills(userId, skillsToTeach, skillsToLearn);
      return res.json({ user });
    } catch (error: any) {
      console.error('Update user skills error:', error);
      return res.status(500).json({ error: "Failed to update skills" });
    }
  });

  app.get("/api/users/settings", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const settings = await storage.getUserSettings(userId);
      return res.json({ settings });
    } catch (error: any) {
      console.error('Get user settings error:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/users/settings", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { isActive, profileVisibility, allowMessages, showEmail, showPhone, notificationPreferences } = req.body;

      const updates: any = {};

      if (isActive !== undefined) {
        if (typeof isActive !== 'number' || (isActive !== 0 && isActive !== 1)) {
          return res.status(400).json({ error: "isActive must be 0 or 1" });
        }
        updates.isActive = isActive;
      }

      if (profileVisibility !== undefined) {
        if (!['everyone', 'members', 'private'].includes(profileVisibility)) {
          return res.status(400).json({ error: "profileVisibility must be 'everyone', 'members', or 'private'" });
        }
        updates.profileVisibility = profileVisibility;
      }

      if (allowMessages !== undefined) {
        if (!['everyone', 'connections', 'nobody'].includes(allowMessages)) {
          return res.status(400).json({ error: "allowMessages must be 'everyone', 'connections', or 'nobody'" });
        }
        updates.allowMessages = allowMessages;
      }

      if (showEmail !== undefined) {
        if (typeof showEmail !== 'number' || (showEmail !== 0 && showEmail !== 1)) {
          return res.status(400).json({ error: "showEmail must be 0 or 1" });
        }
        updates.showEmail = showEmail;
      }

      if (showPhone !== undefined) {
        if (typeof showPhone !== 'number' || (showPhone !== 0 && showPhone !== 1)) {
          return res.status(400).json({ error: "showPhone must be 0 or 1" });
        }
        updates.showPhone = showPhone;
      }

      if (notificationPreferences !== undefined) {
        if (typeof notificationPreferences !== 'string') {
          return res.status(400).json({ error: "notificationPreferences must be a JSON string" });
        }
        try {
          JSON.parse(notificationPreferences);
        } catch {
          return res.status(400).json({ error: "notificationPreferences must be valid JSON" });
        }
        updates.notificationPreferences = notificationPreferences;
      }

      const user = await storage.updateUserSettings(userId, updates);
      return res.json({ user });
    } catch (error: any) {
      console.error('Update user settings error:', error);
      return res.status(500).json({ error: "Failed to update settings" });
    }
  });

  app.put("/api/users/profile", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { companyHistory, specialties } = req.body;

      if (companyHistory && !Array.isArray(companyHistory)) {
        return res.status(400).json({ error: "Company history must be an array" });
      }

      if (specialties && !Array.isArray(specialties)) {
        return res.status(400).json({ error: "Specialties must be an array" });
      }

      const user = await storage.updateUserProfile(userId, companyHistory, specialties);
      return res.json({ user });
    } catch (error: any) {
      console.error('Update user profile error:', error);
      return res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.post("/api/users/complete-onboarding", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      
      const user = await storage.completeOnboarding(userId);
      return res.json({ user });
    } catch (error: any) {
      console.error('Complete onboarding error:', error);
      return res.status(500).json({ error: "Failed to complete onboarding" });
    }
  });

  app.get("/api/search", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { q: query, type } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Search query required" });
      }

      const results = await storage.globalSearch(query, type as string | undefined);
      return res.json(results);
    } catch (error: any) {
      console.error('Global search error:', error);
      return res.status(500).json({ error: "Failed to perform search" });
    }
  });

  app.get("/api/users/experts", async (req, res) => {
    try {
      const { specialty, minYears } = req.query;
      
      const experts = await storage.getExperts({
        specialty: specialty as string,
        minYears: minYears ? parseInt(minYears as string, 10) : 10,
      });
      
      return res.json({ experts });
    } catch (error: any) {
      console.error('Get experts error:', error);
      return res.status(500).json({ error: "Failed to get experts" });
    }
  });

  app.get("/api/users/:id/mentor-stats", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: userId } = req.params;

      const stats = await storage.getMentorStats(userId);
      return res.json(stats);
    } catch (error: any) {
      console.error('Get mentor stats error:', error);
      const status = error.message.includes('not found') ? 404 : 500;
      return res.status(status).json({ error: error.message });
    }
  });

  app.get("/api/skill-swap/matches", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { skill } = req.query;

      const mentors = await storage.findMentors(userId, skill as string);
      return res.json({ mentors });
    } catch (error: any) {
      console.error('Find mentors error:', error);
      const status = error.message.includes('not found') ? 404 : 500;
      return res.status(status).json({ error: error.message });
    }
  });

  app.post("/api/skill-swap/sessions", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { mentorId, skillTopic, sessionDate, sessionTime, duration, sessionType, message } = req.body;

      if (!mentorId || !skillTopic || !sessionDate || !sessionTime || !sessionType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let meetingLink = null;
      let calendarEventId = null;

      if (sessionType === 'virtual') {
        try {
          const { createCalendarEventWithMeet } = await import('./googleCalendar');
          
          const mentor = await storage.getUser(mentorId);
          const learner = await storage.getUser(userId);

          if (!mentor || !learner) {
            return res.status(404).json({ error: "User not found" });
          }

          const sessionId = randomUUID();
          const calendarEvent = await createCalendarEventWithMeet({
            sessionId,
            mentorEmail: mentor.email,
            learnerEmail: learner.email,
            mentorName: mentor.fullName,
            learnerName: learner.fullName,
            skillTopic,
            sessionDate,
            sessionTime,
            duration: duration || 60,
            message,
          });

          meetingLink = calendarEvent.meetLink;
          calendarEventId = calendarEvent.eventId;
        } catch (calendarError: any) {
          console.error('Google Calendar integration error:', calendarError.message);
          return res.status(503).json({ 
            error: "Unable to create virtual meeting. Please contact support or try booking an in-person session instead.",
            details: calendarError.message
          });
        }
      }

      const session = await storage.createSkillSwapSession({
        mentorId,
        learnerId: userId,
        skillTopic,
        sessionDate,
        sessionTime,
        duration: duration || 60,
        sessionType,
        message: message || null,
        meetingLink,
        calendarEventId,
      });

      return res.status(201).json({ session });
    } catch (error: any) {
      console.error('Create skill swap session error:', error);
      return res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.get("/api/skill-swap/my-sessions", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;

      const sessions = await storage.getUserSessions(userId);
      return res.json({ sessions });
    } catch (error: any) {
      console.error('Get user sessions error:', error);
      return res.status(500).json({ error: "Failed to get sessions" });
    }
  });

  app.get("/api/skill-swap/sessions/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: sessionId } = req.params;
      const userId = req.userId!;

      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.mentorId !== userId && session.learnerId !== userId) {
        return res.status(403).json({ error: "Unauthorized: You are not a participant of this session" });
      }

      return res.json({ session });
    } catch (error: any) {
      console.error('Get session error:', error);
      return res.status(500).json({ error: "Failed to get session" });
    }
  });

  app.put("/api/skill-swap/sessions/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: sessionId } = req.params;
      const userId = req.userId!;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const session = await storage.updateSessionStatus(sessionId, status, userId);
      return res.json({ session });
    } catch (error: any) {
      console.error('Update session status error:', error);
      const statusCode = error.message.includes('Unauthorized') ? 403 :
                         error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message });
    }
  });

  app.delete("/api/skill-swap/sessions/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: sessionId } = req.params;
      const userId = req.userId!;

      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.mentorId !== userId && session.learnerId !== userId) {
        return res.status(403).json({ error: "Unauthorized: You are not a participant of this session" });
      }

      if (session.calendarEventId) {
        try {
          const { deleteCalendarEvent } = await import('./googleCalendar');
          await deleteCalendarEvent(session.calendarEventId);
        } catch (calendarError: any) {
          console.warn('Failed to delete Google Calendar event:', calendarError.message);
        }
      }

      await storage.cancelSession(sessionId, userId);
      return res.json({ message: "Session cancelled successfully" });
    } catch (error: any) {
      console.error('Cancel session error:', error);
      const statusCode = error.message.includes('Unauthorized') ? 403 :
                         error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({ error: error.message });
    }
  });

  app.post("/api/skill-swap/sessions/:id/review", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: sessionId } = req.params;
      const userId = req.userId!;
      const { revieweeId, rating, comment } = req.body;

      if (!revieweeId || !rating) {
        return res.status(400).json({ error: "Reviewee ID and rating are required" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.mentorId !== userId && session.learnerId !== userId) {
        return res.status(403).json({ error: "Unauthorized: You are not a participant of this session" });
      }

      const hasReviewed = await storage.hasUserReviewedSession(sessionId, userId);
      if (hasReviewed) {
        return res.status(400).json({ error: "You have already reviewed this session" });
      }

      const review = await storage.createReview({
        sessionId,
        reviewerId: userId,
        revieweeId,
        rating,
        comment: comment || null,
      });

      return res.status(201).json({ review });
    } catch (error: any) {
      console.error('Create review error:', error);
      return res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.get("/api/admin/check", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const isAdmin = await storage.isUserAdmin(userId);
      return res.json({ isAdmin });
    } catch (error: any) {
      console.error('Admin check error:', error);
      return res.status(500).json({ error: "Failed to check admin status" });
    }
  });

  app.get("/api/admin/analytics", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }

      const analytics = await storage.getAnalytics();
      return res.json(analytics);
    } catch (error: any) {
      console.error('Get analytics error:', error);
      return res.status(500).json({ error: "Failed to get analytics" });
    }
  });

  app.get("/api/admin/pending-ideas", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }

      const pendingIdeas = await storage.getPendingIdeas();
      return res.json({ ideas: pendingIdeas });
    } catch (error: any) {
      console.error('Get pending ideas error:', error);
      return res.status(500).json({ error: "Failed to get pending ideas" });
    }
  });

  app.post("/api/admin/ideas/:id/approve", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { id: ideaId } = req.params;
      
      const isAdmin = await storage.isUserAdmin(userId);
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }

      const idea = await storage.approveIdea(ideaId, userId);
      return res.json({ idea });
    } catch (error: any) {
      console.error('Approve idea error:', error);
      const status = error.message.includes('not found') ? 404 : 500;
      return res.status(status).json({ error: error.message });
    }
  });

  app.post("/api/admin/ideas/:id/reject", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { id: ideaId } = req.params;
      const { reason } = req.body;
      
      const isAdmin = await storage.isUserAdmin(userId);
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }

      const idea = await storage.rejectIdea(ideaId, userId, reason || 'No reason provided');
      return res.json({ idea });
    } catch (error: any) {
      console.error('Reject idea error:', error);
      const status = error.message.includes('not found') ? 404 : 500;
      return res.status(status).json({ error: error.message });
    }
  });

  app.post("/api/admin/broadcasts", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { title, message, scheduledFor } = req.body;
      
      const isAdmin = await storage.isUserAdmin(userId);
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }

      if (!title || !message) {
        return res.status(400).json({ error: "Title and message are required" });
      }

      const broadcast = await storage.createBroadcast({
        title,
        message,
        createdBy: userId,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      });

      return res.status(201).json({ broadcast });
    } catch (error: any) {
      console.error('Create broadcast error:', error);
      return res.status(500).json({ error: "Failed to create broadcast" });
    }
  });

  app.get("/api/admin/broadcasts", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }

      const broadcasts = await storage.getAllBroadcasts();
      return res.json({ broadcasts });
    } catch (error: any) {
      console.error('Get broadcasts error:', error);
      return res.status(500).json({ error: "Failed to get broadcasts" });
    }
  });

  app.get("/api/broadcasts/latest", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const broadcast = await storage.getLatestBroadcast(userId);
      return res.json({ broadcast });
    } catch (error: any) {
      console.error('Get latest broadcast error:', error);
      return res.status(500).json({ error: "Failed to get latest broadcast" });
    }
  });

  app.post("/api/broadcasts/:id/view", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { id: broadcastId } = req.params;
      
      await storage.markBroadcastAsViewed(broadcastId, userId);
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Mark broadcast viewed error:', error);
      return res.status(500).json({ error: "Failed to mark broadcast as viewed" });
    }
  });

  app.post("/api/broadcasts/:id/dismiss", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { id: broadcastId } = req.params;
      
      await storage.dismissBroadcast(broadcastId, userId);
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Dismiss broadcast error:', error);
      return res.status(500).json({ error: "Failed to dismiss broadcast" });
    }
  });

  app.get("/api/admin/activity-log", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }

      const { adminId, actionType, startDate, endDate } = req.query;

      const filters: any = {};
      if (adminId) filters.adminId = adminId as string;
      if (actionType) filters.actionType = actionType as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const actions = await storage.getAdminActions(filters);
      return res.json({ actions });
    } catch (error: any) {
      console.error('Get admin actions error:', error);
      return res.status(500).json({ error: "Failed to get admin actions" });
    }
  });

  app.get("/api/admin/export/users", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }

      const { format } = req.query;
      const users = await storage.getAllUsers();

      await storage.logAdminAction({
        adminId: userId,
        actionType: 'export_users',
        targetType: 'users',
        targetId: 'all',
        details: `Exported ${users.length} users in ${format} format`,
      });

      if (format === 'json') {
        return res.json({ users });
      } else {
        const csvHeader = 'ID,Name,Email,Phone,Company,Tech Stack,Years of Experience,Points,Level,Created At\n';
        const csvRows = users.map(user => 
          `${user.id},"${user.fullName}","${user.email}","${user.phoneNumber}","${user.company}","${(user.techStack || []).join('; ')}",${user.yearsOfExperience},${user.points},${Math.floor(user.points / 100)},${user.createdAt.toISOString()}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        return res.send(csvHeader + csvRows);
      }
    } catch (error: any) {
      console.error('Export users error:', error);
      return res.status(500).json({ error: "Failed to export users" });
    }
  });

  app.get("/api/admin/export/ideas", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }

      const { format, status } = req.query;
      let ideas = await storage.getAllIdeas();
      
      if (status) {
        ideas = ideas.filter(idea => idea.status === status);
      }

      await storage.logAdminAction({
        adminId: userId,
        actionType: 'export_ideas',
        targetType: 'ideas',
        targetId: 'all',
        details: `Exported ${ideas.length} ideas in ${format} format`,
      });

      if (format === 'json') {
        return res.json({ ideas });
      } else {
        const csvHeader = 'ID,Title,Founder,Status,Roles Needed,Pay Structure,Upvotes,Comments,Interests,Created At\n';
        const csvRows = ideas.map(idea => 
          `${idea.id},"${idea.title.replace(/"/g, '""')}","${idea.poster.fullName}","${idea.status}","${idea.rolesNeeded.join('; ')}","${idea.payStructure}",${idea.upvoteCount},${idea.commentCount},${idea.interestCount},${idea.createdAt.toISOString()}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=ideas.csv');
        return res.send(csvHeader + csvRows);
      }
    } catch (error: any) {
      console.error('Export ideas error:', error);
      return res.status(500).json({ error: "Failed to export ideas" });
    }
  });

  app.get("/api/admin/export/jobs", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }

      const { format } = req.query;
      const jobs = await storage.getAllJobs();

      await storage.logAdminAction({
        adminId: userId,
        actionType: 'export_jobs',
        targetType: 'jobs',
        targetId: 'all',
        details: `Exported ${jobs.length} jobs in ${format} format`,
      });

      if (format === 'json') {
        return res.json({ jobs });
      } else {
        const csvHeader = 'ID,Title,Company,Posted By,Tech Stack,Experience Level,Salary,Work Mode,Job Type,Status,Created At\n';
        const csvRows = jobs.map(job => 
          `${job.id},"${job.jobTitle}","${job.companyName}","${job.poster.fullName}","${job.requiredTechStack.join('; ')}","${job.experienceLevel}","${job.salaryBudget}","${job.workMode}","${job.jobType}","${job.status}",${job.createdAt.toISOString()}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=jobs.csv');
        return res.send(csvHeader + csvRows);
      }
    } catch (error: any) {
      console.error('Export jobs error:', error);
      return res.status(500).json({ error: "Failed to export jobs" });
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getUpcomingEvents();
      return res.json({ events });
    } catch (error: any) {
      console.error('Get upcoming events error:', error);
      return res.status(500).json({ error: "Failed to get upcoming events" });
    }
  });

  app.get("/api/events/past", async (req, res) => {
    try {
      const events = await storage.getPastEvents();
      return res.json({ events });
    } catch (error: any) {
      console.error('Get past events error:', error);
      return res.status(500).json({ error: "Failed to get past events" });
    }
  });

  app.get("/api/events/my-rsvps", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const rsvps = await storage.getUserEventsAttending(userId);
      return res.json({ rsvps });
    } catch (error: any) {
      console.error('Get user RSVPs error:', error);
      return res.status(500).json({ error: "Failed to get user RSVPs" });
    }
  });

  app.get("/api/events/my-events", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const events = await storage.getUserEvents(userId);
      return res.json({ events });
    } catch (error: any) {
      console.error('Get user events error:', error);
      return res.status(500).json({ error: "Failed to get user events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      return res.json({ event });
    } catch (error: any) {
      console.error('Get event error:', error);
      return res.status(500).json({ error: "Failed to get event" });
    }
  });

  app.post("/api/events", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const eventData = {
        ...req.body,
        organizerId: userId,
        eventDate: req.body.eventDate ? new Date(req.body.eventDate) : undefined,
      };
      
      const event = await storage.createEvent(eventData);
      return res.status(201).json({ event });
    } catch (error: any) {
      console.error('Create event error:', error);
      return res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (event.organizerId !== userId) {
        return res.status(403).json({ error: "Unauthorized: Only the event organizer can update this event" });
      }
      
      const updateData = {
        ...req.body,
        eventDate: req.body.eventDate ? new Date(req.body.eventDate) : undefined,
      };
      
      const updatedEvent = await storage.updateEvent(id, updateData, userId);
      return res.json({ event: updatedEvent });
    } catch (error: any) {
      console.error('Update event error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (event.organizerId !== userId) {
        return res.status(403).json({ error: "Unauthorized: Only the event organizer can delete this event" });
      }
      
      await storage.deleteEvent(id, userId);
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Delete event error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to delete event" });
    }
  });

  app.post("/api/events/:id/rsvp", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: eventId } = req.params;
      const userId = req.userId!;
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      const hasRsvped = await storage.hasUserRsvped(eventId, userId);
      if (hasRsvped) {
        return res.status(400).json({ error: "You have already RSVPed to this event" });
      }
      
      const stats = await storage.getEventStats(eventId);
      if (stats.availableSpots <= 0) {
        return res.status(400).json({ error: "Event is at full capacity" });
      }
      
      const rsvp = await storage.rsvpToEvent(eventId, userId);
      return res.status(201).json({ rsvp });
    } catch (error: any) {
      console.error('RSVP to event error:', error);
      return res.status(500).json({ error: "Failed to RSVP to event" });
    }
  });

  app.delete("/api/events/:id/rsvp", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: eventId } = req.params;
      const userId = req.userId!;
      
      const hasRsvped = await storage.hasUserRsvped(eventId, userId);
      if (!hasRsvped) {
        return res.status(400).json({ error: "You have not RSVPed to this event" });
      }
      
      await storage.cancelRsvp(eventId, userId);
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Cancel RSVP error:', error);
      return res.status(500).json({ error: "Failed to cancel RSVP" });
    }
  });

  app.get("/api/events/:id/rsvps", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: eventId } = req.params;
      const userId = req.userId!;
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (event.organizerId !== userId) {
        return res.status(403).json({ error: "Unauthorized: Only the event organizer can view RSVPs" });
      }
      
      const rsvps = await storage.getEventRsvps(eventId);
      return res.json({ rsvps });
    } catch (error: any) {
      console.error('Get event RSVPs error:', error);
      return res.status(500).json({ error: "Failed to get event RSVPs" });
    }
  });

  app.get("/api/events/:id/stats", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: eventId } = req.params;
      const userId = req.userId!;
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (event.organizerId !== userId) {
        return res.status(403).json({ error: "Unauthorized: Only the event organizer can view stats" });
      }
      
      const stats = await storage.getEventStats(eventId);
      return res.json({ stats });
    } catch (error: any) {
      console.error('Get event stats error:', error);
      return res.status(500).json({ error: "Failed to get event stats" });
    }
  });

  app.post("/api/events/:id/generate-qr", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: eventId } = req.params;
      const userId = req.userId!;
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      const hasRsvped = await storage.hasUserRsvped(eventId, userId);
      if (!hasRsvped) {
        return res.status(400).json({ error: "You must RSVP to this event first" });
      }
      
      const qrCode = await storage.generateQRCodeForAttendee(eventId, userId);
      return res.json({ qrCode });
    } catch (error: any) {
      console.error('Generate QR code error:', error);
      return res.status(500).json({ error: "Failed to generate QR code" });
    }
  });

  app.post("/api/events/:id/generate-qr-for-attendee", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: eventId } = req.params;
      const { attendeeId } = req.body;
      const userId = req.userId!;
      
      if (!attendeeId) {
        return res.status(400).json({ error: "Attendee ID is required" });
      }
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (event.organizerId !== userId) {
        return res.status(403).json({ error: "Unauthorized: Only the event organizer can generate QR codes for attendees" });
      }
      
      const hasRsvped = await storage.hasUserRsvped(eventId, attendeeId);
      if (!hasRsvped) {
        return res.status(400).json({ error: "This user has not RSVPed to the event" });
      }
      
      const qrCode = await storage.generateQRCodeForAttendee(eventId, attendeeId);
      return res.json({ qrCode });
    } catch (error: any) {
      console.error('Generate QR code for attendee error:', error);
      return res.status(500).json({ error: "Failed to generate QR code for attendee" });
    }
  });

  app.post("/api/events/checkin", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { qrCode } = req.body;
      const userId = req.userId!;
      
      if (!qrCode) {
        return res.status(400).json({ error: "QR code required" });
      }
      
      const result = await storage.checkInAttendee(qrCode, userId);
      
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }
      
      return res.json(result);
    } catch (error: any) {
      console.error('Check in attendee error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to check in attendee" });
    }
  });

  app.get("/api/events/:id/checkins", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: eventId } = req.params;
      const userId = req.userId!;
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (event.organizerId !== userId) {
        return res.status(403).json({ error: "Unauthorized: Only the event organizer can view check-ins" });
      }
      
      const checkins = await storage.getEventCheckins(eventId);
      return res.json({ checkins });
    } catch (error: any) {
      console.error('Get event check-ins error:', error);
      return res.status(500).json({ error: "Failed to get event check-ins" });
    }
  });

  // Forum Category Routes
  app.get("/api/forum/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      return res.json({ categories });
    } catch (error: any) {
      console.error('Get categories error:', error);
      return res.status(500).json({ error: "Failed to get categories" });
    }
  });

  app.get("/api/forum/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      return res.json({ category });
    } catch (error: any) {
      console.error('Get category error:', error);
      return res.status(500).json({ error: "Failed to get category" });
    }
  });

  app.post("/api/forum/categories", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const { name, slug, description, icon } = req.body;
      
      if (!name || !slug || !description || !icon) {
        return res.status(400).json({ error: "Name, slug, description, and icon are required" });
      }
      
      const category = await storage.createCategory({ name, slug, description, icon });
      return res.status(201).json({ category });
    } catch (error: any) {
      console.error('Create category error:', error);
      return res.status(500).json({ error: "Failed to create category" });
    }
  });

  // Forum Post Routes
  app.get("/api/forum/posts", async (req, res) => {
    try {
      const { categoryId, categorySlug, sortBy, limit, offset } = req.query;
      
      const options: any = {};
      
      // If categorySlug is provided, convert it to categoryId
      if (categorySlug) {
        const category = await storage.getCategoryBySlug(categorySlug as string);
        if (category) {
          options.categoryId = category.id;
        }
      } else if (categoryId) {
        options.categoryId = categoryId as string;
      }
      
      if (sortBy) options.sortBy = sortBy as string;
      if (limit) options.limit = parseInt(limit as string, 10);
      if (offset) options.offset = parseInt(offset as string, 10);
      
      const posts = await storage.getAllPosts(options);
      return res.json({ posts });
    } catch (error: any) {
      console.error('Get posts error:', error);
      return res.status(500).json({ error: "Failed to get posts" });
    }
  });

  app.get("/api/forum/my-stats", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const myPosts = await storage.getUserForumPosts(userId);
      const myReplies = await storage.getUserForumReplies(userId);
      return res.json({ 
        myPosts: myPosts.length,
        myAnswers: myReplies.length 
      });
    } catch (error: any) {
      console.error('Get user forum stats error:', error);
      return res.status(500).json({ error: "Failed to get user forum stats" });
    }
  });

  app.get("/api/forum/posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      await storage.incrementViewCount(id);
      
      return res.json({ post });
    } catch (error: any) {
      console.error('Get post error:', error);
      return res.status(500).json({ error: "Failed to get post" });
    }
  });

  app.post("/api/forum/posts", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { categoryId, title, content, postType, expertOnly } = req.body;
      
      if (!categoryId || !title || !content) {
        return res.status(400).json({ error: "Category ID, title, and content are required" });
      }

      const validPostTypes = ['question', 'architecture_review', 'war_story', 'office_hours'];
      if (postType && !validPostTypes.includes(postType)) {
        return res.status(400).json({ error: "Invalid post type" });
      }
      
      const post = await storage.createPost({
        categoryId,
        authorId: userId,
        title,
        content,
        postType: postType || 'question',
        expertOnly: expertOnly ? 1 : 0,
      });
      
      return res.status(201).json({ post });
    } catch (error: any) {
      console.error('Create post error:', error);
      return res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.put("/api/forum/posts/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const { title, content } = req.body;
      
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      if (post.authorId !== userId) {
        return res.status(403).json({ error: "Forbidden: Only the post author can update this post" });
      }
      
      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      
      const updatedPost = await storage.updatePost(id, updates, userId);
      return res.json({ post: updatedPost });
    } catch (error: any) {
      console.error('Update post error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to update post" });
    }
  });

  app.delete("/api/forum/posts/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      const user = await storage.getUser(userId);
      
      if (post.authorId !== userId && !user?.isAdmin) {
        return res.status(403).json({ error: "Forbidden: Only the post author or admin can delete this post" });
      }
      
      await storage.deletePost(id, userId);
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Delete post error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Forum Reply Routes
  app.get("/api/forum/posts/:id/replies", async (req, res) => {
    try {
      const { id } = req.params;
      
      const replies = await storage.getPostReplies(id);
      return res.json({ replies });
    } catch (error: any) {
      console.error('Get replies error:', error);
      return res.status(500).json({ error: "Failed to get replies" });
    }
  });

  app.post("/api/forum/posts/:id/replies", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: postId } = req.params;
      const userId = req.userId!;
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      
      const reply = await storage.createReply({
        postId,
        authorId: userId,
        content,
      });
      
      return res.status(201).json({ reply });
    } catch (error: any) {
      console.error('Create reply error:', error);
      return res.status(500).json({ error: "Failed to create reply" });
    }
  });

  app.put("/api/forum/replies/:id/best-answer", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id: replyId } = req.params;
      const userId = req.userId!;
      
      const replies = await storage.getPostReplies('');
      const reply = replies.find(r => r.id === replyId);
      
      if (!reply) {
        return res.status(404).json({ error: "Reply not found" });
      }
      
      const post = await storage.getPost(reply.postId);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      if (post.authorId !== userId) {
        return res.status(403).json({ error: "Forbidden: Only the post author can mark the best answer" });
      }
      
      const updatedReply = await storage.markAsBestAnswer(replyId, reply.postId, userId);
      return res.json({ reply: updatedReply });
    } catch (error: any) {
      console.error('Mark best answer error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to mark best answer" });
    }
  });

  app.delete("/api/forum/replies/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      
      const replies = await storage.getPostReplies('');
      const reply = replies.find(r => r.id === id);
      
      if (!reply) {
        return res.status(404).json({ error: "Reply not found" });
      }
      
      const user = await storage.getUser(userId);
      
      if (reply.authorId !== userId && !user?.isAdmin) {
        return res.status(403).json({ error: "Forbidden: Only the reply author or admin can delete this reply" });
      }
      
      await storage.deleteReply(id, userId);
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Delete reply error:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to delete reply" });
    }
  });

  // Forum Vote Routes
  app.post("/api/forum/vote", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { targetType, targetId, voteType } = req.body;
      
      if (!targetType || !targetId || !voteType) {
        return res.status(400).json({ error: "Target type, target ID, and vote type are required" });
      }
      
      if (!['post', 'reply'].includes(targetType)) {
        return res.status(400).json({ error: "Invalid target type" });
      }
      
      if (!['up', 'down'].includes(voteType)) {
        return res.status(400).json({ error: "Invalid vote type" });
      }
      
      const vote = await storage.vote({
        userId,
        targetType,
        targetId,
        voteType,
      });
      
      const voteCounts = await storage.getVoteCounts(targetType, targetId);
      
      return res.status(201).json({ vote, voteCounts });
    } catch (error: any) {
      console.error('Vote error:', error);
      return res.status(500).json({ error: "Failed to vote" });
    }
  });

  app.delete("/api/forum/vote", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { targetType, targetId } = req.body;
      
      if (!targetType || !targetId) {
        return res.status(400).json({ error: "Target type and target ID are required" });
      }
      
      await storage.removeVote(userId, targetType, targetId);
      
      const voteCounts = await storage.getVoteCounts(targetType, targetId);
      
      return res.json({ success: true, voteCounts });
    } catch (error: any) {
      console.error('Remove vote error:', error);
      return res.status(500).json({ error: "Failed to remove vote" });
    }
  });

  app.get("/api/forum/vote/:targetType/:targetId", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { targetType, targetId } = req.params;
      
      const vote = await storage.getUserVote(userId, targetType, targetId);
      const voteCounts = await storage.getVoteCounts(targetType, targetId);
      
      return res.json({ vote, voteCounts });
    } catch (error: any) {
      console.error('Get vote error:', error);
      return res.status(500).json({ error: "Failed to get vote" });
    }
  });

  // Forum Report Routes
  app.post("/api/forum/reports", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { targetType, targetId, reason } = req.body;
      
      if (!targetType || !targetId || !reason) {
        return res.status(400).json({ error: "Target type, target ID, and reason are required" });
      }
      
      if (!['post', 'reply'].includes(targetType)) {
        return res.status(400).json({ error: "Invalid target type" });
      }
      
      const report = await storage.createReport({
        reporterId: userId,
        targetType,
        targetId,
        reason,
      });
      
      return res.status(201).json({ report });
    } catch (error: any) {
      console.error('Create report error:', error);
      return res.status(500).json({ error: "Failed to create report" });
    }
  });

  app.get("/api/forum/reports", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const reports = await storage.getAllReports();
      return res.json({ reports });
    } catch (error: any) {
      console.error('Get reports error:', error);
      return res.status(500).json({ error: "Failed to get reports" });
    }
  });

  app.put("/api/forum/reports/:id/resolve", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const { action } = req.body;
      
      if (!action) {
        return res.status(400).json({ error: "Action is required" });
      }
      
      const report = await storage.resolveReport(id, userId, action);
      return res.json({ report });
    } catch (error: any) {
      console.error('Resolve report error:', error);
      return res.status(500).json({ error: "Failed to resolve report" });
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

      // Update user presence to online
      await storage.updateUserPresence(ws.userId, 'online');

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
          } else if (message.type === 'typing_start') {
            wss.clients.forEach((client) => {
              const authClient = client as AuthenticatedWebSocket;
              if (
                client.readyState === WebSocket.OPEN &&
                authClient.conversationId === message.conversationId &&
                authClient.userId !== ws.userId
              ) {
                client.send(JSON.stringify({
                  type: 'typing_start',
                  conversationId: message.conversationId,
                  userId: ws.userId,
                }));
              }
            });
          } else if (message.type === 'typing_stop') {
            wss.clients.forEach((client) => {
              const authClient = client as AuthenticatedWebSocket;
              if (
                client.readyState === WebSocket.OPEN &&
                authClient.conversationId === message.conversationId &&
                authClient.userId !== ws.userId
              ) {
                client.send(JSON.stringify({
                  type: 'typing_stop',
                  conversationId: message.conversationId,
                  userId: ws.userId,
                }));
              }
            });
          } else if (message.type === 'reaction_added') {
            const reaction = await storage.addMessageReaction(
              message.messageId,
              ws.userId!,
              message.emoji
            );

            wss.clients.forEach((client) => {
              const authClient = client as AuthenticatedWebSocket;
              if (
                client.readyState === WebSocket.OPEN &&
                authClient.conversationId === message.conversationId
              ) {
                client.send(JSON.stringify({
                  type: 'reaction_added',
                  reaction,
                  messageId: message.messageId,
                }));
              }
            });
          } else if (message.type === 'reaction_removed') {
            await storage.removeMessageReaction(
              message.messageId,
              ws.userId!,
              message.emoji
            );

            wss.clients.forEach((client) => {
              const authClient = client as AuthenticatedWebSocket;
              if (
                client.readyState === WebSocket.OPEN &&
                authClient.conversationId === message.conversationId
              ) {
                client.send(JSON.stringify({
                  type: 'reaction_removed',
                  messageId: message.messageId,
                  userId: ws.userId,
                  emoji: message.emoji,
                }));
              }
            });
          } else if (message.type === 'message_read') {
            await storage.updateReadReceipt(
              message.conversationId,
              ws.userId!,
              message.lastReadMessageId
            );

            wss.clients.forEach((client) => {
              const authClient = client as AuthenticatedWebSocket;
              if (
                client.readyState === WebSocket.OPEN &&
                authClient.conversationId === message.conversationId &&
                authClient.userId !== ws.userId
              ) {
                client.send(JSON.stringify({
                  type: 'message_read',
                  conversationId: message.conversationId,
                  userId: ws.userId,
                  lastReadMessageId: message.lastReadMessageId,
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

      ws.on('close', async () => {
        console.log('Client disconnected');
        // Update user presence to offline
        if (ws.userId) {
          await storage.updateUserPresence(ws.userId, 'offline');
        }
      });

      ws.send(JSON.stringify({ type: 'connected', userId: ws.userId }));
    } catch (error) {
      console.error('WebSocket auth error:', error);
      ws.close(1008, 'Authentication failed');
    }
  });

  app.get("/api/lost-and-found", async (req, res) => {
    try {
      const items = await storage.getLostAndFoundItems();
      res.json(items);
    } catch (error: any) {
      console.error('Error fetching lost and found items:', error);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  });

  app.post("/api/lost-and-found", authenticateUser, (req: AuthRequest, res: Response, next: NextFunction) => {
    uploadLostFoundImage.array('images', 5)(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const files = req.files as Express.Multer.File[];
        const imageUrls = files ? files.map(f => `/uploads/lost-found/${f.filename}`) : [];

        const item = await storage.createLostAndFoundItem({
          userId: req.userId!,
          type: req.body.type,
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          location: req.body.location || null,
          contactInfo: req.body.contactInfo || null,
          images: imageUrls,
        });

        res.json(item);
      } catch (error: any) {
        console.error('Error creating lost and found item:', error);
        res.status(500).json({ error: 'Failed to create item' });
      }
    });
  });

  app.post("/api/lost-and-found/:id/resolve", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const item = await storage.resolveLostAndFoundItem(req.params.id, req.userId!);
      res.json(item);
    } catch (error: any) {
      console.error('Error resolving item:', error);
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ 
        error: error.message || 'Failed to resolve item' 
      });
    }
  });

  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getApprovedAnnouncements();
      res.json(announcements);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      res.status(500).json({ error: 'Failed to fetch announcements' });
    }
  });

  app.get("/api/announcements/pending", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user || user.isAdmin !== 1) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const announcements = await storage.getPendingAnnouncements();
      res.json(announcements);
    } catch (error: any) {
      console.error('Error fetching pending announcements:', error);
      res.status(500).json({ error: 'Failed to fetch pending announcements' });
    }
  });

  app.post("/api/announcements", authenticateUser, (req: AuthRequest, res: Response, next: NextFunction) => {
    uploadAnnouncementImage.array('images', 5)(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const files = req.files as Express.Multer.File[];
        const imageUrls = files ? files.map(f => `/uploads/announcements/${f.filename}`) : [];

        const announcement = await storage.createAnnouncement({
          userId: req.userId!,
          title: req.body.title,
          content: req.body.content,
          priority: req.body.priority || 'normal',
          expiresAt: req.body.expiresAt || null,
          images: imageUrls,
        });

        res.json(announcement);
      } catch (error: any) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ error: 'Failed to create announcement' });
      }
    });
  });

  app.post("/api/announcements/:id/approve", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user || user.isAdmin !== 1) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const announcement = await storage.approveAnnouncement(req.params.id, req.userId!);
      res.json(announcement);
    } catch (error: any) {
      console.error('Error approving announcement:', error);
      res.status(500).json({ error: 'Failed to approve announcement' });
    }
  });

  app.post("/api/announcements/:id/reject", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user || user.isAdmin !== 1) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const announcement = await storage.rejectAnnouncement(
        req.params.id,
        req.body.reason || 'Not specified'
      );
      res.json(announcement);
    } catch (error: any) {
      console.error('Error rejecting announcement:', error);
      res.status(500).json({ error: 'Failed to reject announcement' });
    }
  });

  // Marketplace Routes
  app.get("/api/marketplace", async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string,
        listingType: req.query.listingType as string,
        status: req.query.status as string,
        sellerId: req.query.sellerId as string,
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        searchQuery: req.query.searchQuery as string,
      };
      const items = await storage.getMarketplaceItems(filters);
      res.json(items);
    } catch (error: any) {
      console.error('Error fetching marketplace items:', error);
      res.status(500).json({ error: 'Failed to fetch marketplace items' });
    }
  });

  app.post("/api/marketplace", authenticateUser, (req: AuthRequest, res: Response, next: NextFunction) => {
    uploadMarketplaceImage.array('images', 10)(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const files = req.files as Express.Multer.File[];
        const imageUrls = files ? files.map(f => `/uploads/marketplace/${f.filename}`) : [];

        const item = await storage.createMarketplaceItem({
          sellerId: req.userId!,
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          condition: req.body.condition,
          listingType: req.body.listingType,
          price: req.body.price ? parseInt(req.body.price) : null,
          negotiable: req.body.negotiable !== undefined ? parseInt(req.body.negotiable) : 1,
          images: imageUrls,
          location: req.body.location,
          status: 'available',
        });

        res.json(item);
      } catch (error: any) {
        console.error('Error creating marketplace item:', error);
        res.status(500).json({ error: 'Failed to create marketplace item' });
      }
    });
  });

  app.get("/api/marketplace/:id", async (req, res) => {
    try {
      const item = await storage.getMarketplaceItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } catch (error: any) {
      console.error('Error fetching marketplace item:', error);
      res.status(500).json({ error: 'Failed to fetch marketplace item' });
    }
  });

  app.put("/api/marketplace/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const updates = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        condition: req.body.condition,
        price: req.body.price ? parseInt(req.body.price) : null,
        negotiable: req.body.negotiable !== undefined ? parseInt(req.body.negotiable) : undefined,
        location: req.body.location,
        status: req.body.status,
      };

      const item = await storage.updateMarketplaceItem(req.params.id, req.userId!, updates);
      res.json(item);
    } catch (error: any) {
      console.error('Error updating marketplace item:', error);
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ 
        error: error.message || 'Failed to update marketplace item' 
      });
    }
  });

  app.delete("/api/marketplace/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      await storage.deleteMarketplaceItem(req.params.id, req.userId!);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting marketplace item:', error);
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ 
        error: error.message || 'Failed to delete marketplace item' 
      });
    }
  });

  app.post("/api/marketplace/:id/favorite", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const result = await storage.toggleMarketplaceFavorite(req.params.id, req.userId!);
      res.json(result);
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({ error: 'Failed to toggle favorite' });
    }
  });

  app.post("/api/marketplace/:id/offer", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const offer = await storage.createMarketplaceOffer({
        itemId: req.params.id,
        buyerId: req.userId!,
        offerAmount: req.body.offerAmount ? parseInt(req.body.offerAmount) : null,
        exchangeOffer: req.body.exchangeOffer || null,
        message: req.body.message || null,
      });
      res.json(offer);
    } catch (error: any) {
      console.error('Error creating offer:', error);
      res.status(500).json({ error: 'Failed to create offer' });
    }
  });

  app.get("/api/marketplace/:id/offers", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const offers = await storage.getMarketplaceOffers(req.params.id, req.userId!);
      res.json(offers);
    } catch (error: any) {
      console.error('Error fetching offers:', error);
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ 
        error: error.message || 'Failed to fetch offers' 
      });
    }
  });

  app.put("/api/marketplace/offers/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const offer = await storage.updateOfferStatus(req.params.id, req.userId!, req.body.status);
      res.json(offer);
    } catch (error: any) {
      console.error('Error updating offer status:', error);
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ 
        error: error.message || 'Failed to update offer status' 
      });
    }
  });

  app.post("/api/marketplace/:id/mark-sold", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const item = await storage.markItemAsSold(req.params.id, req.userId!, req.body.buyerId);
      res.json(item);
    } catch (error: any) {
      console.error('Error marking item as sold:', error);
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ 
        error: error.message || 'Failed to mark item as sold' 
      });
    }
  });

  app.get("/api/marketplace/favorites/my", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const favorites = await storage.getUserMarketplaceFavorites(req.userId!);
      res.json(favorites);
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  });

  app.post("/api/marketplace/reviews", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const review = await storage.createMarketplaceReview({
        itemId: req.body.itemId,
        reviewerId: req.userId!,
        revieweeId: req.body.revieweeId,
        rating: parseInt(req.body.rating),
        review: req.body.review,
        transactionType: req.body.transactionType,
      });
      res.json(review);
    } catch (error: any) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  });

  // Tool & Equipment Rental Routes
  app.get("/api/rentals", async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string,
        ownerId: req.query.ownerId as string,
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        searchQuery: req.query.searchQuery as string,
      };
      const items = await storage.getRentalItems(filters);
      res.json(items);
    } catch (error: any) {
      console.error('Error fetching rental items:', error);
      res.status(500).json({ error: 'Failed to fetch rental items' });
    }
  });

  app.post("/api/rentals", authenticateUser, (req: AuthRequest, res: Response, next: NextFunction) => {
    uploadRentalImage.array('images', 10)(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const files = req.files as Express.Multer.File[];
        const imageUrls = files ? files.map(f => `/uploads/rentals/${f.filename}`) : [];

        const item = await storage.createRentalItem({
          ownerId: req.userId!,
          itemName: req.body.itemName,
          description: req.body.description,
          category: req.body.category,
          condition: req.body.condition,
          rentalPrice: parseInt(req.body.rentalPrice),
          priceUnit: req.body.priceUnit || 'day',
          deposit: req.body.deposit ? parseInt(req.body.deposit) : 0,
          minRentalDuration: req.body.minRentalDuration ? parseInt(req.body.minRentalDuration) : null,
          maxRentalDuration: req.body.maxRentalDuration ? parseInt(req.body.maxRentalDuration) : null,
          images: imageUrls,
          location: req.body.location,
          availability: 'available',
        });

        res.json(item);
      } catch (error: any) {
        console.error('Error creating rental item:', error);
        res.status(500).json({ error: 'Failed to create rental item' });
      }
    });
  });

  app.get("/api/rentals/:id", async (req, res) => {
    try {
      const item = await storage.getRentalItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Rental item not found' });
      }
      res.json(item);
    } catch (error: any) {
      console.error('Error fetching rental item:', error);
      res.status(500).json({ error: 'Failed to fetch rental item' });
    }
  });

  app.put("/api/rentals/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const updates = {
        itemName: req.body.itemName,
        description: req.body.description,
        category: req.body.category,
        condition: req.body.condition,
        rentalPrice: req.body.rentalPrice ? parseInt(req.body.rentalPrice) : undefined,
        priceUnit: req.body.priceUnit,
        deposit: req.body.deposit ? parseInt(req.body.deposit) : undefined,
        minRentalDuration: req.body.minRentalDuration ? parseInt(req.body.minRentalDuration) : undefined,
        maxRentalDuration: req.body.maxRentalDuration ? parseInt(req.body.maxRentalDuration) : undefined,
        location: req.body.location,
        availability: req.body.availability,
      };

      const item = await storage.updateRentalItem(req.params.id, req.userId!, updates);
      res.json(item);
    } catch (error: any) {
      console.error('Error updating rental item:', error);
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ 
        error: error.message || 'Failed to update rental item' 
      });
    }
  });

  app.delete("/api/rentals/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      await storage.deleteRentalItem(req.params.id, req.userId!);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting rental item:', error);
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ 
        error: error.message || 'Failed to delete rental item' 
      });
    }
  });

  app.post("/api/rentals/:id/check-availability", async (req, res) => {
    try {
      const isAvailable = await storage.checkRentalAvailability(
        req.params.id,
        new Date(req.body.startDate),
        new Date(req.body.endDate)
      );
      res.json({ available: isAvailable });
    } catch (error: any) {
      console.error('Error checking availability:', error);
      res.status(500).json({ error: 'Failed to check availability' });
    }
  });

  app.post("/api/rentals/:id/book", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const booking = await storage.createRentalBooking({
        itemId: req.params.id,
        renterId: req.userId!,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        totalAmount: parseInt(req.body.totalAmount),
        depositPaid: req.body.depositPaid !== undefined ? parseInt(req.body.depositPaid) : 0,
        notes: req.body.notes || null,
      });
      res.json(booking);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      res.status(error.message === 'Item not available for selected dates' ? 409 : 500).json({ 
        error: error.message || 'Failed to create booking' 
      });
    }
  });

  app.get("/api/rentals/:id/bookings", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const bookings = await storage.getRentalBookings(req.params.id, req.userId!);
      res.json(bookings);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ 
        error: error.message || 'Failed to fetch bookings' 
      });
    }
  });

  app.get("/api/rentals/bookings/my", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const bookings = await storage.getUserRentalBookings(req.userId!);
      res.json(bookings);
    } catch (error: any) {
      console.error('Error fetching user bookings:', error);
      res.status(500).json({ error: 'Failed to fetch user bookings' });
    }
  });

  app.put("/api/rentals/bookings/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const booking = await storage.updateBookingStatus(req.params.id, req.userId!, req.body.status);
      res.json(booking);
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ 
        error: error.message || 'Failed to update booking status' 
      });
    }
  });

  app.post("/api/rentals/:id/favorite", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const result = await storage.toggleRentalFavorite(req.params.id, req.userId!);
      res.json(result);
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({ error: 'Failed to toggle favorite' });
    }
  });

  app.get("/api/rentals/favorites/my", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const favorites = await storage.getUserRentalFavorites(req.userId!);
      res.json(favorites);
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  });

  app.post("/api/rentals/reviews", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const review = await storage.createRentalReview({
        itemId: req.body.itemId,
        reviewerId: req.userId!,
        ownerId: req.body.ownerId,
        bookingId: req.body.bookingId,
        rating: parseInt(req.body.rating),
        review: req.body.review,
        rentalExperience: req.body.rentalExperience,
      });
      res.json(review);
    } catch (error: any) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  });

  // Advertisement Routes
  app.get("/api/advertisements", async (req, res) => {
    try {
      // Public endpoint only shows active ads unless authenticated user is owner/admin
      const filters: any = {
        serviceCategory: req.query.serviceCategory as string,
      };

      // Only allow status/advertiserId filters for authenticated users
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const idToken = authHeader.split('Bearer ')[1];
          const decodedToken = await verifyIdToken(idToken);
          const userId = decodedToken.uid;
          const user = await storage.getUser(userId);

          // Authenticated users can filter by their own ads or admins can see all
          if (req.query.advertiserId === userId || user?.isAdmin === 1) {
            filters.advertiserId = req.query.advertiserId as string;
            filters.status = req.query.status as string;
          } else {
            // Non-owner, non-admin: only show active ads
            filters.status = 'active';
          }
        } catch (error) {
          // Invalid token: show only active ads
          filters.status = 'active';
        }
      } else {
        // Unauthenticated: only show active ads
        filters.status = 'active';
      }

      const ads = await storage.getAdvertisements(filters);
      res.json(ads);
    } catch (error: any) {
      console.error('Error fetching advertisements:', error);
      res.status(500).json({ error: 'Failed to fetch advertisements' });
    }
  });

  app.post("/api/advertisements", authenticateUser, (req: AuthRequest, res: Response, next: NextFunction) => {
    uploadAdvertisementImage.single('image')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const file = req.file as Express.Multer.File | undefined;
        const imageUrl = file ? `/uploads/advertisements/${file.filename}` : null;

        const advertisement = await storage.createAdvertisement({
          advertiserId: req.userId!,
          title: req.body.title,
          description: req.body.description,
          serviceCategory: req.body.serviceCategory,
          imageUrl,
          servicePageContent: req.body.servicePageContent,
          pricing: req.body.pricing,
          contactInfo: req.body.contactInfo,
          duration: parseInt(req.body.duration),
        });

        res.json(advertisement);
      } catch (error: any) {
        console.error('Error creating advertisement:', error);
        res.status(500).json({ error: 'Failed to create advertisement' });
      }
    });
  });

  app.get("/api/advertisements/:id", async (req, res) => {
    try {
      const ad = await storage.getAdvertisement(req.params.id);
      if (!ad) {
        return res.status(404).json({ error: 'Advertisement not found' });
      }
      res.json(ad);
    } catch (error: any) {
      console.error('Error fetching advertisement:', error);
      res.status(500).json({ error: 'Failed to fetch advertisement' });
    }
  });

  app.put("/api/advertisements/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const updates = {
        title: req.body.title,
        description: req.body.description,
        serviceCategory: req.body.serviceCategory,
        servicePageContent: req.body.servicePageContent,
        pricing: req.body.pricing,
        contactInfo: req.body.contactInfo,
      };

      const ad = await storage.updateAdvertisement(req.params.id, req.userId!, updates);
      res.json(ad);
    } catch (error: any) {
      console.error('Error updating advertisement:', error);
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ 
        error: error.message || 'Failed to update advertisement' 
      });
    }
  });

  app.delete("/api/advertisements/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      await storage.deleteAdvertisement(req.params.id, req.userId!);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting advertisement:', error);
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ 
        error: error.message || 'Failed to delete advertisement' 
      });
    }
  });

  app.post("/api/advertisements/:id/approve", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const ad = await storage.approveAdvertisement(req.params.id, parseInt(req.body.duration));
      res.json(ad);
    } catch (error: any) {
      console.error('Error approving advertisement:', error);
      res.status(500).json({ error: 'Failed to approve advertisement' });
    }
  });

  app.post("/api/advertisements/:id/reject", authenticateUser, authorizeAdmin, async (req: AuthRequest, res) => {
    try {
      const ad = await storage.rejectAdvertisement(req.params.id, req.body.reason || 'Not specified');
      res.json(ad);
    } catch (error: any) {
      console.error('Error rejecting advertisement:', error);
      res.status(500).json({ error: 'Failed to reject advertisement' });
    }
  });

  app.post("/api/advertisements/:id/view", async (req, res) => {
    try {
      const userId = req.body.userId || null;
      await storage.trackAdView(req.params.id, userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error tracking ad view:', error);
      res.status(500).json({ error: 'Failed to track view' });
    }
  });

  app.post("/api/advertisements/:id/click", async (req, res) => {
    try {
      const userId = req.body.userId || null;
      await storage.trackAdClick(req.params.id, userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error tracking ad click:', error);
      res.status(500).json({ error: 'Failed to track click' });
    }
  });

  app.get("/api/advertisements/:id/analytics", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const ad = await storage.getAdvertisement(req.params.id);
      if (!ad || ad.advertiser.id !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const analytics = await storage.getAdAnalytics(req.params.id);
      res.json(analytics);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Razorpay Payment Routes
  app.get("/api/razorpay/key", (req, res) => {
    res.json({ key: getRazorpayKeyId() });
  });

  app.post("/api/advertisements/payment/create-order", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { advertisementId, amount, duration } = req.body;

      const order = await createRazorpayOrder({
        amount: parseInt(amount),
        receipt: `ad_${advertisementId}_${Date.now()}`,
        notes: {
          advertisementId,
          userId: req.userId!,
          duration: duration.toString(),
        },
      });

      const payment = await storage.createAdPayment({
        advertisementId,
        userId: req.userId!,
        amount: parseInt(amount),
        currency: 'INR',
        razorpayOrderId: order.id,
      });

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment.id,
      });
    } catch (error: any) {
      console.error('Error creating payment order:', error);
      res.status(500).json({ error: 'Failed to create payment order' });
    }
  });

  app.post("/api/advertisements/payment/verify", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      const isValid = verifyRazorpaySignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      if (!isValid) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }

      const payment = await storage.updateAdPaymentStatus(paymentId, {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'completed',
      });

      const adPayment = await storage.getAdPayment(paymentId);
      if (adPayment && adPayment.advertisementId) {
        const ad = await storage.getAdvertisement(adPayment.advertisementId);
        if (ad) {
          const durationDays = parseInt(ad.duration);
          await storage.approveAdvertisement(adPayment.advertisementId, durationDays);
        }
      }

      res.json({ success: true, payment });
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ error: 'Failed to verify payment' });
    }
  });

  // Activity Feed Routes
  app.get("/api/activity-feed", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const activities = await storage.getActivityFeed({ limit, offset });
      res.json({ activities });
    } catch (error: any) {
      console.error('Error fetching activity feed:', error);
      res.status(500).json({ error: 'Failed to fetch activity feed' });
    }
  });

  app.post("/api/activity-feed/:id/like", authenticateUser, async (req: AuthRequest, res) => {
    try {
      await storage.likeActivity(req.params.id, req.userId!);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error liking activity:', error);
      res.status(500).json({ error: 'Failed to like activity' });
    }
  });

  app.delete("/api/activity-feed/:id/like", authenticateUser, async (req: AuthRequest, res) => {
    try {
      await storage.unlikeActivity(req.params.id, req.userId!);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error unliking activity:', error);
      res.status(500).json({ error: 'Failed to unlike activity' });
    }
  });

  // Photo Galleries Routes
  app.get("/api/galleries", async (req, res) => {
    try {
      const galleries = await storage.getGalleries();
      res.json({ galleries });
    } catch (error: any) {
      console.error('Error fetching galleries:', error);
      res.status(500).json({ error: 'Failed to fetch galleries' });
    }
  });

  app.get("/api/galleries/:id", async (req, res) => {
    try {
      const gallery = await storage.getGallery(req.params.id);
      if (!gallery) {
        return res.status(404).json({ error: 'Gallery not found' });
      }
      res.json(gallery);
    } catch (error: any) {
      console.error('Error fetching gallery:', error);
      res.status(500).json({ error: 'Failed to fetch gallery' });
    }
  });

  app.post("/api/galleries", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const gallery = await storage.createGallery({
        creatorId: req.userId!,
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags || [],
      });
      res.json(gallery);
    } catch (error: any) {
      console.error('Error creating gallery:', error);
      res.status(500).json({ error: 'Failed to create gallery' });
    }
  });

  app.post("/api/galleries/:id/images", authenticateUser, (req: AuthRequest, res: Response, next: NextFunction) => {
    uploadGalleryImage.array('images', 10)(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
          return res.status(400).json({ error: 'No images uploaded' });
        }

        const imageUrls = files.map((f, index) => ({
          imageUrl: `/uploads/galleries/${f.filename}`,
          caption: req.body.captions?.[index] || null,
          sortOrder: index,
        }));

        const uploadedImages = [];
        for (const img of imageUrls) {
          const uploadedImage = await storage.uploadGalleryImage(req.params.id, img);
          uploadedImages.push(uploadedImage);
        }

        res.json({ images: uploadedImages });
      } catch (error: any) {
        console.error('Error uploading gallery images:', error);
        res.status(500).json({ error: 'Failed to upload images' });
      }
    });
  });

  app.post("/api/galleries/:id/like", authenticateUser, async (req: AuthRequest, res) => {
    try {
      await storage.likeGallery(req.params.id, req.userId!);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error liking gallery:', error);
      res.status(500).json({ error: 'Failed to like gallery' });
    }
  });

  app.delete("/api/galleries/:id/like", authenticateUser, async (req: AuthRequest, res) => {
    try {
      await storage.unlikeGallery(req.params.id, req.userId!);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error unliking gallery:', error);
      res.status(500).json({ error: 'Failed to unlike gallery' });
    }
  });

  // User Presence Routes
  app.get("/api/presence/online", async (req, res) => {
    try {
      const onlineUsers = await storage.getOnlineUsers();
      res.json({ users: onlineUsers });
    } catch (error: any) {
      console.error('Error fetching online users:', error);
      res.status(500).json({ error: 'Failed to fetch online users' });
    }
  });

  app.get("/api/presence/:userId", async (req, res) => {
    try {
      const presence = await storage.getUserPresence(req.params.userId);
      res.json(presence);
    } catch (error: any) {
      console.error('Error fetching user presence:', error);
      res.status(500).json({ error: 'Failed to fetch presence' });
    }
  });

  app.post("/api/presence/update", authenticateUser, async (req: AuthRequest, res) => {
    try {
      await storage.updateUserPresence(req.userId!, req.body.status);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating presence:', error);
      res.status(500).json({ error: 'Failed to update presence' });
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
