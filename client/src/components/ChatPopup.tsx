import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { X, Minus, Send, Maximize2, Paperclip, Smile, Check, CheckCheck, Download, Image as ImageIcon, FileText } from 'lucide-react';
import { useChat, OpenChat, Message } from '@/contexts/ChatContext';
import { format } from 'date-fns';
import { getAuth } from 'firebase/auth';
import { cn } from '@/lib/utils';

interface ChatPopupProps {
  chat: OpenChat;
  position: number; // 0, 1, or 2 for stacking
  isMobile: boolean;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '👏'];

export default function ChatPopup({ chat, position, isMobile }: ChatPopupProps) {
  const { closeChat, minimizeChat, maximizeChat, sendMessage, sendFile, markAsRead, startTyping, stopTyping, addReaction, removeReaction } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchY, setTouchY] = useState(0);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userId = getAuth().currentUser?.uid;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!chat.isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages, chat.isMinimized]);

  // Mark as read when maximized or when new messages arrive in an open chat
  useEffect(() => {
    if (!chat.isMinimized) {
      markAsRead(chat.conversationId);
    }
  }, [chat.isMinimized, chat.conversationId, chat.messages.length, markAsRead]);

  // Typing indicator handler
  const handleTyping = () => {
    startTyping(chat.conversationId);
    
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    
    typingTimerRef.current = setTimeout(() => {
      stopTyping(chat.conversationId);
    }, 3000);
  };

  // File upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileSend = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      await sendFile(chat.conversationId, selectedFile, setUploadProgress);
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Failed to send file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Swipe gesture handlers (mobile only)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setTouchStart(e.touches[0].clientY);
    setTouchY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || touchStart === null) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStart;
    
    if (distance > 0) {
      setTouchY(currentY);
      setSwipeDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile || touchStart === null) return;
    
    if (swipeDistance > 100) {
      closeChat(chat.conversationId);
    }
    
    setTouchStart(null);
    setTouchY(0);
    setSwipeDistance(0);
  };

  // Reaction handlers
  const handleAddReaction = (messageId: string, emoji: string) => {
    const message = chat.messages.find(m => m.id === messageId);
    const existingReaction = message?.reactions?.find(r => r.emoji === emoji);
    
    if (existingReaction?.userIds.includes(userId || '')) {
      removeReaction(chat.conversationId, messageId, emoji);
    } else {
      addReaction(chat.conversationId, messageId, emoji);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(chat.conversationId, messageInput);
      setMessageInput('');
      stopTyping(chat.conversationId);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    handleTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  // Calculate position for desktop stacking
  const getPosition = () => {
    if (isMobile) {
      return { right: 0, bottom: 0, left: 0, top: 0 };
    }
    const baseRight = 20;
    const chatWidth = 320;
    const gap = 20;
    return {
      right: baseRight + (position * (chatWidth + gap)),
      bottom: 20,
    };
  };

  const positionStyle = getPosition();

  // Minimized view
  if (chat.isMinimized) {
    return (
      <div
        className="fixed z-50 animate-in slide-in-from-bottom-5 duration-300"
        style={isMobile ? { right: 20, bottom: 20 } : positionStyle}
      >
        <Card
          className="w-[280px] cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => maximizeChat(chat.conversationId)}
        >
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="w-8 h-8">
                <AvatarImage src={chat.otherUser.profilePhotoUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(chat.otherUser.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {chat.otherUser.fullName}
                </p>
                {chat.unreadCount > 0 && (
                  <Badge variant="default" className="h-5 text-xs">
                    {chat.unreadCount} new
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  maximizeChat(chat.conversationId);
                }}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  closeChat(chat.conversationId);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Full chat view
  return (
    <div
      className={`fixed z-50 animate-in slide-in-from-bottom-5 duration-300 ${
        isMobile ? 'inset-x-0 top-0 bottom-16' : ''
      }`}
      style={isMobile ? undefined : positionStyle}
    >
      <Card
        className={`flex flex-col shadow-2xl ${
          isMobile ? 'h-full w-full rounded-none' : 'w-[320px] h-[500px]'
        }`}
        style={isMobile && swipeDistance > 0 ? { 
          transform: `translateY(${swipeDistance}px)`,
          transition: touchStart ? 'none' : 'transform 0.3s ease-out'
        } : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag and drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-primary">
            <div className="text-center">
              <Paperclip className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-primary">Drop file to send</p>
            </div>
          </div>
        )}
        
        {/* Swipe indicator */}
        {isMobile && swipeDistance > 20 && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
        )}
        {/* Header */}
        <div className="border-b p-3 flex items-center justify-between bg-card flex-shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="w-9 h-9">
              <AvatarImage src={chat.otherUser.profilePhotoUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {getInitials(chat.otherUser.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {chat.otherUser.fullName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {chat.isTyping ? (
                  <span className="italic text-primary">typing...</span>
                ) : (
                  chat.otherUser.company
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => minimizeChat(chat.conversationId)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => closeChat(chat.conversationId)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-3">
          {chat.isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          ) : chat.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">No messages yet</p>
                <p className="text-xs text-muted-foreground">
                  Start the conversation!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {chat.messages.map((message) => {
                const isCurrentUser = message.senderId === userId;
                const isRead = message.readBy?.includes(chat.otherUser.id);
                const hasReactions = message.reactions && message.reactions.length > 0;
                
                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="group relative">
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                          isCurrentUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {/* File message */}
                        {message.fileUrl && (
                          <div className="mb-2">
                            {message.fileType?.startsWith('image/') ? (
                              <img 
                                src={message.fileUrl} 
                                alt={message.fileName || 'Image'}
                                className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                                onClick={() => window.open(message.fileUrl, '_blank')}
                              />
                            ) : (
                              <a 
                                href={message.fileUrl} 
                                download={message.fileName}
                                className="flex items-center gap-2 p-2 bg-black/10 rounded-lg hover:bg-black/20 transition-colors"
                              >
                                {message.fileType?.includes('pdf') ? (
                                  <FileText className="w-5 h-5" />
                                ) : (
                                  <Download className="w-5 h-5" />
                                )}
                                <span className="text-sm truncate max-w-[200px]">
                                  {message.fileName || 'File'}
                                </span>
                              </a>
                            )}
                          </div>
                        )}
                        
                        {/* Text content */}
                        {message.content && (
                          <p className="text-sm break-words">{message.content}</p>
                        )}
                        
                        {/* Timestamp and read receipt */}
                        <div className="flex items-center gap-1 mt-1">
                          <p
                            className={`text-xs ${
                              isCurrentUser
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </p>
                          {isCurrentUser && (
                            <span className={`text-xs ${
                              isRead ? 'text-blue-400' : 'text-primary-foreground/70'
                            }`}>
                              {isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Reaction button (visible on hover for desktop) */}
                      <div className={`absolute ${isCurrentUser ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full bg-card shadow-md"
                            >
                              <Smile className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2" side="top">
                            <div className="flex gap-1">
                              {QUICK_REACTIONS.map((emoji) => (
                                <Button
                                  key={emoji}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
                                  onClick={() => handleAddReaction(message.id, emoji)}
                                >
                                  {emoji}
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    {/* Reactions display */}
                    {hasReactions && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {message.reactions!.map((reaction) => {
                          const isUserReaction = reaction.userIds.includes(userId || '');
                          return (
                            <button
                              key={reaction.emoji}
                              onClick={() => handleAddReaction(message.id, reaction.emoji)}
                              className={cn(
                                "px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-colors",
                                isUserReaction 
                                  ? "bg-primary/20 border border-primary" 
                                  : "bg-muted hover:bg-muted/80"
                              )}
                              title={`${reaction.userIds.length} reaction${reaction.userIds.length > 1 ? 's' : ''}`}
                            >
                              <span>{reaction.emoji}</span>
                              {reaction.userIds.length > 1 && (
                                <span className="text-xs text-muted-foreground">
                                  {reaction.userIds.length}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className={`border-t p-3 bg-card flex-shrink-0 ${isMobile ? '' : ''}`}>
          {/* File preview */}
          {selectedFile && (
            <div className="mb-2 p-2 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {selectedFile.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm truncate">{selectedFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCancelFile}
                  disabled={isUploading}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              {isUploading && (
                <Progress value={uploadProgress} className="h-1" />
              )}
              
              {!isUploading && (
                <Button
                  onClick={handleFileSend}
                  size="sm"
                  className="w-full"
                >
                  Send File
                </Button>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || chat.isLoading || !!selectedFile}
              className="flex-shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={handleMessageInputChange}
              onKeyPress={handleKeyPress}
              disabled={isSending || chat.isLoading || isUploading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending || chat.isLoading || isUploading}
              size="icon"
              className="flex-shrink-0"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
