import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Briefcase, ShoppingCart, Megaphone, Lightbulb, MessageSquare, TrendingUp, Clock, Camera, Search, ThumbsUp, MessageCircle, Repeat2, Send, Smile, Image } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";
import { useState, type MouseEvent } from "react";
import { useToast } from "@/hooks/use-toast";

interface ActivityFeedItemProps {
  activity: {
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: Date;
    userId: string;
    userName: string | null;
    userPhoto: string | null;
    metadata?: any;
  };
}

export default function ActivityFeedItem({ activity }: ActivityFeedItemProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(activity.metadata?.likeCount || activity.metadata?.upvoteCount || 0);
  const [commentCount, setCommentCount] = useState(activity.metadata?.commentCount || 0);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleLike = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    toast({
      title: liked ? "Like removed" : "Liked!",
      description: liked ? "" : "You liked this post",
      duration: 2000,
    });
  };

  const handleComment = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowCommentBox(!showCommentBox);
  };

  const handlePostComment = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!commentText.trim()) return;
    
    setCommentCount(commentCount + 1);
    toast({
      title: "Comment posted!",
      description: "Your comment has been added",
      duration: 2000,
    });
    setCommentText("");
    setShowCommentBox(false);
  };

  const handleRepost = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toast({
      title: "Repost feature coming soon!",
      description: "You'll be able to share this with your thoughts",
      duration: 3000,
    });
  };

  const handleSend = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toast({
      title: "Send via message coming soon!",
      description: "You'll be able to share this privately",
      duration: 3000,
    });
  };

  const getIcon = () => {
    switch (activity.type) {
      case 'event':
        return <CalendarDays className="w-5 h-5 text-blue-600" />;
      case 'job':
        return <Briefcase className="w-5 h-5 text-green-600" />;
      case 'marketplace':
        return <ShoppingCart className="w-5 h-5 text-purple-600" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5 text-orange-600" />;
      case 'idea':
        return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      case 'discussion':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      case 'gallery':
        return <Camera className="w-5 h-5 text-pink-600" />;
      case 'lost-and-found':
        return <Search className="w-5 h-5 text-amber-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeLabel = () => {
    switch (activity.type) {
      case 'event':
        return 'created an event';
      case 'job':
        return 'posted a job';
      case 'marketplace':
        return 'listed an item';
      case 'announcement':
        return 'posted an announcement';
      case 'idea':
        return 'shared an idea';
      case 'discussion':
        return 'started a discussion';
      case 'gallery':
        return 'created a photo gallery';
      case 'lost-and-found':
        return activity.metadata?.itemType === 'lost' 
          ? 'reported a lost item' 
          : activity.metadata?.itemType === 'found'
          ? 'reported a found item'
          : 'posted to Lost & Found';
      default:
        return 'posted';
    }
  };

  const getLink = () => {
    switch (activity.type) {
      case 'event':
        return `/events/${activity.id}`;
      case 'job':
        return `/jobs`;
      case 'marketplace':
        return `/marketplace`;
      case 'announcement':
        return `/announcements`;
      case 'idea':
        return `/ideas/${activity.id}`;
      case 'discussion':
        return `/forum`;
      case 'gallery':
        return `/photo-gallery`;
      case 'lost-and-found':
        return `/lost-and-found`;
      default:
        return '#';
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

  const getProfilePhotoUrl = () => {
    if (!activity.userPhoto) return undefined;
    if (activity.userPhoto.startsWith('http')) return activity.userPhoto;
    if (activity.userPhoto.startsWith('/uploads/')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      return `${apiUrl}${activity.userPhoto}`;
    }
    return activity.userPhoto;
  };

  return (
    <Card className="hover:shadow-sm transition-all border-border">
      <CardContent className="p-0">
        <div className="p-4 cursor-pointer" onClick={() => setLocation(getLink())}>
          <div className="flex gap-3 mb-3">
            <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-gray-100">
              <AvatarImage src={getProfilePhotoUrl()} alt={activity.userName || 'User'} />
              <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {activity.userName ? getInitials(activity.userName) : 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                    {activity.userName || 'Anonymous'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getTypeLabel()}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(activity.createdAt || Date.now()), { addSuffix: true })}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getIcon()}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <h3 className="font-semibold text-sm line-clamp-2">{activity.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">{activity.description}</p>

            {(activity.type === 'event' || activity.type === 'gallery') && activity.metadata?.imageUrl && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img 
                  src={activity.metadata.imageUrl} 
                  alt={activity.title}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}

            {activity.type === 'lost-and-found' && activity.metadata?.images && activity.metadata.images.length > 0 && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img 
                  src={activity.metadata.images[0]} 
                  alt={activity.title}
                  className="w-full h-auto max-h-64 object-cover"
                />
              </div>
            )}

            {activity.metadata && (
              <div className="flex flex-wrap gap-2 mt-2">
                {activity.type === 'event' && activity.metadata.location && (
                  <Badge variant="outline" className="text-xs">
                    📍 {activity.metadata.location}
                  </Badge>
                )}
                {activity.type === 'job' && activity.metadata.companyName && (
                  <Badge variant="outline" className="text-xs">
                    {activity.metadata.companyName}
                  </Badge>
                )}
                {activity.type === 'marketplace' && activity.metadata.price && (
                  <Badge variant="outline" className="text-xs font-semibold text-green-700">
                    ₹{activity.metadata.price}
                  </Badge>
                )}
                {activity.type === 'gallery' && activity.metadata.tags && activity.metadata.tags.length > 0 && (
                  <>
                    {activity.metadata.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs capitalize">
                        #{tag}
                      </Badge>
                    ))}
                  </>
                )}
                {activity.type === 'lost-and-found' && (
                  <>
                    {activity.metadata.itemType && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-semibold ${
                          activity.metadata.itemType === 'lost' 
                            ? 'text-red-700 border-red-300 bg-red-50' 
                            : 'text-green-700 border-green-300 bg-green-50'
                        }`}
                      >
                        {activity.metadata.itemType === 'lost' ? '🔍 Lost' : '✓ Found'}
                      </Badge>
                    )}
                    {activity.metadata.category && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {activity.metadata.category}
                      </Badge>
                    )}
                    {activity.metadata.location && (
                      <Badge variant="outline" className="text-xs">
                        📍 {activity.metadata.location}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {(likeCount > 0 || commentCount > 0) && (
          <div className="px-4 py-2 text-xs text-muted-foreground flex items-center justify-between border-t">
            <div className="flex items-center gap-3">
              {likeCount > 0 && (
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 fill-blue-600 text-blue-600" />
                  {likeCount}
                </span>
              )}
            </div>
            {commentCount > 0 && (
              <span>{commentCount} comment{commentCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        )}

        <div className="border-t border-border flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 rounded-none h-11 gap-2 hover:bg-gray-50 ${liked ? 'text-blue-600' : 'text-gray-600'}`}
            onClick={handleLike}
          >
            <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{liked ? 'Liked' : 'Like'}</span>
          </Button>

          <div className="h-6 w-px bg-border"></div>

          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-none h-11 gap-2 hover:bg-gray-50 text-gray-600"
            onClick={handleComment}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Comment</span>
          </Button>

          <div className="h-6 w-px bg-border"></div>

          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-none h-11 gap-2 hover:bg-gray-50 text-gray-600"
            onClick={handleRepost}
          >
            <Repeat2 className="w-4 h-4" />
            <span className="text-sm font-medium">Repost</span>
          </Button>

          <div className="h-6 w-px bg-border"></div>

          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-none h-11 gap-2 hover:bg-gray-50 text-gray-600"
            onClick={handleSend}
          >
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Send</span>
          </Button>
        </div>

        {showCommentBox && (
          <div className="border-t border-border p-4 bg-gray-50" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={getProfilePhotoUrl()} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {activity.userName ? getInitials(activity.userName) : 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <Textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[80px] resize-none bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-gray-600 hover:text-gray-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast({
                          title: "Emoji picker coming soon!",
                          duration: 2000,
                        });
                      }}
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-gray-600 hover:text-gray-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast({
                          title: "Image upload coming soon!",
                          duration: 2000,
                        });
                      }}
                    >
                      <Image className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    disabled={!commentText.trim()}
                    onClick={handlePostComment}
                    className="h-8 px-4"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
