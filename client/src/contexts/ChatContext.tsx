import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { NotificationPermissionDialog } from '@/components/NotificationPermissionDialog';

interface User {
  id: string;
  fullName: string;
  profilePhotoUrl?: string | null;
  company: string;
  flatNumber: string;
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: number;
  createdAt: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  reactions?: MessageReaction[];
  readBy?: string[];
}

export interface OpenChat {
  conversationId: string;
  otherUser: User;
  isMinimized: boolean;
  unreadCount: number;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
}

interface ChatContextType {
  openChats: OpenChat[];
  openChat: (conversationId: string, otherUser: User) => void;
  closeChat: (conversationId: string) => void;
  minimizeChat: (conversationId: string) => void;
  maximizeChat: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  sendFile: (conversationId: string, file: File, onProgress?: (progress: number) => void) => Promise<void>;
  markAsRead: (conversationId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  addReaction: (conversationId: string, messageId: string, emoji: string) => void;
  removeReaction: (conversationId: string, messageId: string, emoji: string) => void;
  totalUnreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [openChats, setOpenChats] = useState<OpenChat[]>([]);
  const [websockets, setWebsockets] = useState<Map<string, WebSocket>>(new Map());
  const [idToken, setIdToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const typingTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const userId = getAuth().currentUser?.uid;

  // Get Firebase ID token
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
      } else {
        setIdToken(null);
        // Close all chats on logout
        setOpenChats([]);
        websockets.forEach(ws => ws.close());
        setWebsockets(new Map());
      }
    });
    return unsubscribe;
  }, []);

  // Setup WebSocket for a conversation
  const setupWebSocket = useCallback((conversationId: string) => {
    if (!idToken || websockets.has(conversationId)) return;

    // Determine the WebSocket URL - in development, Vite proxy handles /ws
    // In production, it's the same origin
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws?token=${idToken}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`WebSocket connected for conversation ${conversationId}`);
      ws.send(JSON.stringify({
        type: 'subscribe',
        conversationId,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_message') {
        // Update messages and unread count for this conversation
        setOpenChats(prev => {
          const updatedChats = prev.map(chat => {
            if (chat.conversationId === conversationId) {
              return {
                ...chat,
                messages: [...chat.messages, data.message],
                unreadCount: chat.isMinimized ? chat.unreadCount + 1 : chat.unreadCount,
              };
            }
            return chat;
          });

          // Mark as read immediately if chat is open (not minimized) - use current state
          const currentChat = updatedChats.find(c => c.conversationId === conversationId);
          if (currentChat && !currentChat.isMinimized && idToken) {
            // Call API to mark messages as read
            fetch(`/api/messages/${conversationId}/read`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${idToken}`,
              },
            }).catch(err => console.error('Failed to mark as read:', err));
          }

          // Play notification sound and show browser notification if chat is minimized or tab not focused
          if (currentChat?.isMinimized || document.hidden) {
            playNotificationSound();
            showBrowserNotification(currentChat?.otherUser, data.message);
          }

          return updatedChats;
        });
      } else if (data.type === 'typing_start') {
        setOpenChats(prev => prev.map(chat =>
          chat.conversationId === conversationId
            ? { ...chat, isTyping: true }
            : chat
        ));
      } else if (data.type === 'typing_stop') {
        setOpenChats(prev => prev.map(chat =>
          chat.conversationId === conversationId
            ? { ...chat, isTyping: false }
            : chat
        ));
      } else if (data.type === 'message_read_receipt') {
        setOpenChats(prev => prev.map(chat => {
          if (chat.conversationId === conversationId) {
            return {
              ...chat,
              messages: chat.messages.map(msg => {
                if (data.messageIds?.includes(msg.id)) {
                  return {
                    ...msg,
                    readBy: [...(msg.readBy || []), data.userId],
                  };
                }
                return msg;
              }),
            };
          }
          return chat;
        }));
      } else if (data.type === 'reaction_added') {
        setOpenChats(prev => prev.map(chat => {
          if (chat.conversationId === conversationId) {
            return {
              ...chat,
              messages: chat.messages.map(msg => {
                if (msg.id === data.messageId) {
                  const reactions = msg.reactions || [];
                  const existingReaction = reactions.find(r => r.emoji === data.emoji);
                  if (existingReaction) {
                    return {
                      ...msg,
                      reactions: reactions.map(r =>
                        r.emoji === data.emoji
                          ? { ...r, userIds: [...r.userIds, data.userId] }
                          : r
                      ),
                    };
                  } else {
                    return {
                      ...msg,
                      reactions: [...reactions, { emoji: data.emoji, userIds: [data.userId] }],
                    };
                  }
                }
                return msg;
              }),
            };
          }
          return chat;
        }));
      } else if (data.type === 'reaction_removed') {
        setOpenChats(prev => prev.map(chat => {
          if (chat.conversationId === conversationId) {
            return {
              ...chat,
              messages: chat.messages.map(msg => {
                if (msg.id === data.messageId) {
                  const reactions = (msg.reactions || [])
                    .map(r =>
                      r.emoji === data.emoji
                        ? { ...r, userIds: r.userIds.filter(id => id !== data.userId) }
                        : r
                    )
                    .filter(r => r.userIds.length > 0);
                  return { ...msg, reactions };
                }
                return msg;
              }),
            };
          }
          return chat;
        }));
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for conversation ${conversationId}:`, error);
    };

    ws.onclose = () => {
      console.log(`WebSocket closed for conversation ${conversationId}`);
      setWebsockets(prev => {
        const newMap = new Map(prev);
        newMap.delete(conversationId);
        return newMap;
      });
    };

    setWebsockets(prev => new Map(prev).set(conversationId, ws));
  }, [idToken, openChats]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!idToken) return [];
    
    try {
      const response = await fetch(`/api/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }, [idToken]);

  // Open a chat popup
  const openChat = useCallback(async (conversationId: string, otherUser: User) => {
    // Check if already open
    const existingChat = openChats.find(c => c.conversationId === conversationId);
    if (existingChat) {
      // If minimized, maximize it
      if (existingChat.isMinimized) {
        maximizeChat(conversationId);
      }
      return;
    }

    // Limit to 3 chats on desktop
    if (openChats.length >= 3 && window.innerWidth >= 640) {
      // Close the oldest chat
      const oldestChat = openChats[0];
      closeChat(oldestChat.conversationId);
    }

    // On mobile, close all other chats (only one at a time)
    if (window.innerWidth < 640) {
      openChats.forEach(chat => closeChat(chat.conversationId));
    }

    // Add new chat with loading state
    const newChat: OpenChat = {
      conversationId,
      otherUser,
      isMinimized: false,
      unreadCount: 0,
      messages: [],
      isLoading: true,
      isTyping: false,
    };
    
    // Request notification permission on first chat open
    requestNotificationPermission();

    setOpenChats(prev => [...prev, newChat]);

    // Fetch messages
    const messages = await fetchMessages(conversationId);
    
    setOpenChats(prev => prev.map(chat =>
      chat.conversationId === conversationId
        ? { ...chat, messages, isLoading: false }
        : chat
    ));

    // Setup WebSocket
    setupWebSocket(conversationId);

    // Mark as read
    if (idToken) {
      fetch(`/api/messages/${conversationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
    }
  }, [openChats, idToken, fetchMessages, setupWebSocket]);

  // Close a chat popup
  const closeChat = useCallback((conversationId: string) => {
    setOpenChats(prev => prev.filter(chat => chat.conversationId !== conversationId));
    
    // Close WebSocket
    const ws = websockets.get(conversationId);
    if (ws) {
      ws.close();
      setWebsockets(prev => {
        const newMap = new Map(prev);
        newMap.delete(conversationId);
        return newMap;
      });
    }
  }, [websockets]);

  // Minimize a chat
  const minimizeChat = useCallback((conversationId: string) => {
    setOpenChats(prev => prev.map(chat =>
      chat.conversationId === conversationId
        ? { ...chat, isMinimized: true }
        : chat
    ));
  }, []);

  // Maximize a chat
  const maximizeChat = useCallback((conversationId: string) => {
    setOpenChats(prev => prev.map(chat =>
      chat.conversationId === conversationId
        ? { ...chat, isMinimized: false, unreadCount: 0 }
        : chat
    ));

    // Mark as read
    if (idToken) {
      fetch(`/api/messages/${conversationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
    }
  }, [idToken]);

  // Send a message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!idToken || !content.trim()) return;

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          content: content.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();

      // Add message to state immediately (optimistic update)
      setOpenChats(prev => prev.map(chat =>
        chat.conversationId === conversationId
          ? { ...chat, messages: [...chat.messages, data.message] }
          : chat
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [idToken]);

  // Mark conversation as read
  const markAsRead = useCallback((conversationId: string) => {
    setOpenChats(prev => prev.map(chat =>
      chat.conversationId === conversationId
        ? { ...chat, unreadCount: 0 }
        : chat
    ));

    if (idToken) {
      fetch(`/api/messages/${conversationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
    }
  }, [idToken]);

  // Start typing indicator
  const startTyping = useCallback((conversationId: string) => {
    const ws = websockets.get(conversationId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'typing_start', conversationId }));
    }
  }, [websockets]);

  // Stop typing indicator
  const stopTyping = useCallback((conversationId: string) => {
    const ws = websockets.get(conversationId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'typing_stop', conversationId }));
    }
  }, [websockets]);

  // Add reaction to message
  const addReaction = useCallback((conversationId: string, messageId: string, emoji: string) => {
    const ws = websockets.get(conversationId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'reaction_added',
        conversationId,
        messageId,
        emoji,
      }));
    }
  }, [websockets]);

  // Remove reaction from message
  const removeReaction = useCallback((conversationId: string, messageId: string, emoji: string) => {
    const ws = websockets.get(conversationId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'reaction_removed',
        conversationId,
        messageId,
        emoji,
      }));
    }
  }, [websockets]);

  // Send file message
  const sendFile = useCallback(async (
    conversationId: string,
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    if (!idToken) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      // Handle completion
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      });

      xhr.open('POST', '/api/messages/send-file');
      xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
      xhr.send(formData);

      const data = await uploadPromise;

      // Add file message to state
      setOpenChats(prev => prev.map(chat =>
        chat.conversationId === conversationId
          ? { ...chat, messages: [...chat.messages, data.message] }
          : chat
      ));
    } catch (error) {
      console.error('Error sending file:', error);
      throw error;
    }
  }, [idToken]);

  // Request notification permission
  const requestNotificationPermission = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      console.log('Showing custom notification dialog');
      setShowNotificationDialog(true);
    } else if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Handle notification permission allow
  const handleAllowNotifications = useCallback(async () => {
    console.log('User clicked Enable Notifications');
    setShowNotificationDialog(false);
    if ('Notification' in window) {
      console.log('Requesting browser permission');
      const permission = await Notification.requestPermission();
      console.log('Browser permission result:', permission);
      setNotificationPermission(permission);
    }
  }, []);

  // Handle notification permission deny/close
  const handleCloseNotificationDialog = useCallback(() => {
    console.log('User clicked Not Now');
    setShowNotificationDialog(false);
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((otherUser: User | undefined, message: Message) => {
    if (!otherUser || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(otherUser.fullName, {
      body: message.content || 'Sent a file',
      icon: otherUser.profilePhotoUrl || undefined,
      tag: message.conversationId,
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      const chat = openChats.find(c => c.conversationId === message.conversationId);
      if (chat && chat.isMinimized) {
        maximizeChat(message.conversationId);
      }
      notification.close();
    };
  }, [openChats]);

  // Calculate total unread count
  const totalUnreadCount = openChats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  // Notification sound using Web Audio API
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (err) {
      console.log('Could not play notification sound:', err);
    }
  };

  const value: ChatContextType = {
    openChats,
    openChat,
    closeChat,
    minimizeChat,
    maximizeChat,
    sendMessage,
    sendFile,
    markAsRead,
    startTyping,
    stopTyping,
    addReaction,
    removeReaction,
    totalUnreadCount,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
      <NotificationPermissionDialog
        isOpen={showNotificationDialog}
        onClose={handleCloseNotificationDialog}
        onAllow={handleAllowNotifications}
      />
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
