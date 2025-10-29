import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuth } from "firebase/auth";
import { format } from "date-fns";

interface User {
  id: string;
  fullName: string;
  profilePhotoUrl?: string | null;
  company: string;
  flatNumber: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: number;
  createdAt: string;
}

interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessageAt: string;
  otherUser: User;
  unreadCount: number;
  lastMessage?: Message;
}

interface ChatProps {
  userId: string;
  idToken: string;
}

export default function Chat({ userId, idToken }: ChatProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversationsData, refetch: refetchConversations } = useQuery<{ conversations: Conversation[] }>({
    queryKey: ['/api/conversations'],
    queryFn: async () => {
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
  });

  const { data: messagesData, refetch: refetchMessages } = useQuery<{ messages: Message[] }>({
    queryKey: ['/api/messages', selectedConversation?.id],
    enabled: !!selectedConversation,
    queryFn: async () => {
      const response = await fetch(`/api/messages/${selectedConversation!.id}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation!.id,
          content,
        }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      refetchMessages();
      refetchConversations();
      setMessageInput("");
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch(`/api/messages/${conversationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      refetchConversations();
    },
  });

  useEffect(() => {
    if (!idToken) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${idToken}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      if (selectedConversation) {
        websocket.send(JSON.stringify({
          type: 'subscribe',
          conversationId: selectedConversation.id,
        }));
      }
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        refetchMessages();
        refetchConversations();
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [idToken, selectedConversation?.id]);

  useEffect(() => {
    if (selectedConversation && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'subscribe',
        conversationId: selectedConversation.id,
      }));
      markAsReadMutation.mutate(selectedConversation.id);
    }
  }, [selectedConversation?.id, ws?.readyState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    sendMessageMutation.mutate(messageInput);
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

  if (selectedConversation && messagesData) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="border-b p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedConversation(null)}
            data-testid="button-back-to-conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={selectedConversation.otherUser.profilePhotoUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(selectedConversation.otherUser.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold" data-testid="text-conversation-user">
              {selectedConversation.otherUser.fullName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {selectedConversation.otherUser.company} • {selectedConversation.otherUser.flatNumber}
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messagesData.messages.map((message) => {
              const isCurrentUser = message.senderId === userId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${message.id}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              data-testid="input-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || sendMessageMutation.isPending}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Messages</h1>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" data-testid="button-dashboard">
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground">
            Your conversations with community members
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {conversationsData?.conversations && conversationsData.conversations.length > 0 ? (
          <div className="space-y-2">
            {conversationsData.conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="hover-elevate cursor-pointer"
                onClick={() => setSelectedConversation(conversation)}
                data-testid={`card-conversation-${conversation.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.otherUser.profilePhotoUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(conversation.otherUser.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate" data-testid={`text-name-${conversation.id}`}>
                          {conversation.otherUser.fullName}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2" data-testid={`badge-unread-${conversation.id}`}>
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {conversation.otherUser.company} • {conversation.otherUser.flatNumber}
                      </p>
                      {conversation.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatMessageTime(conversation.lastMessageAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
            <p className="text-muted-foreground mb-4">
              Start a conversation by connecting with members in Find Teammates
            </p>
            <Link href="/find-teammates">
              <Button data-testid="button-find-teammates">
                Find Teammates
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
