import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  Flag,
  Trash2,
  Edit,
  Check,
  Reply as ReplyIcon,
  Crown,
  History,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import ReportModal from "@/components/ReportModal";
import ExperienceBadge from "@/components/ExperienceBadge";

interface User {
  id: string;
  fullName: string;
  profilePhotoUrl?: string | null;
  totalPoints?: number;
  yearsOfExperience: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  categoryId: string;
  tags: string[] | null;
  viewCount: number;
  hasAcceptedAnswer: boolean;
  createdAt: string;
  author: User;
  category: Category;
  postType?: string;
  expertOnly?: number;
}

interface Reply {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentReplyId: string | null;
  isBestAnswer: boolean;
  createdAt: string;
  author: User;
}

interface VoteData {
  voteType: "upvote" | "downvote" | null;
}

interface VoteCount {
  upvotes: number;
  downvotes: number;
}

export default function QuestionDetail() {
  const [match, params] = useRoute("/forum/post/:id");
  const postId = match ? (params as any).id : "";
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, idToken } = useAuth();

  const [replyContent, setReplyContent] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [nestedReplyContent, setNestedReplyContent] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: "post" | "reply"; id: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "post" | "reply"; id: string } | null>(null);

  const { data: postData, isLoading: postLoading } = useQuery<{ post: Post }>({
    queryKey: [`/api/forum/posts/${postId}`],
    queryFn: async () => {
      const response = await fetch(`/api/forum/posts/${postId}`);
      if (!response.ok) throw new Error("Failed to fetch post");
      return response.json();
    },
    enabled: !!postId,
  });

  const { data: repliesData, isLoading: repliesLoading } = useQuery<{ replies: Reply[] }>({
    queryKey: [`/api/forum/posts/${postId}/replies`],
    queryFn: async () => {
      const response = await fetch(`/api/forum/posts/${postId}/replies`);
      if (!response.ok) throw new Error("Failed to fetch replies");
      return response.json();
    },
    enabled: !!postId,
  });

  const { data: postVoteData } = useQuery<VoteData>({
    queryKey: [`/api/forum/vote/post/${postId}`],
    queryFn: async () => {
      const response = await fetch(`/api/forum/vote/post/${postId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!response.ok) return { voteType: null };
      return response.json();
    },
    enabled: !!postId && !!idToken,
  });

  const { data: postVoteCount } = useQuery<VoteCount>({
    queryKey: [`/api/forum/vote/post/${postId}/count`],
    queryFn: async () => {
      const response = await fetch(`/api/forum/posts/${postId}/votes`);
      if (!response.ok) return { upvotes: 0, downvotes: 0 };
      return response.json();
    },
    enabled: !!postId,
  });

  const voteMutation = useMutation({
    mutationFn: async ({
      targetType,
      targetId,
      voteType,
    }: {
      targetType: "post" | "reply";
      targetId: string;
      voteType: "upvote" | "downvote";
    }) => {
      const response = await fetch("/api/forum/vote", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetType, targetId, voteType }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to vote");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/forum/vote/${variables.targetType}/${variables.targetId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/forum/vote/${variables.targetType}/${variables.targetId}/count`] });
      if (variables.targetType === "post") {
        queryClient.invalidateQueries({ queryKey: [`/api/forum/posts/${postId}`] });
      }
      toast({
        title: "Vote recorded",
        description: `You ${variables.voteType}d this ${variables.targetType}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to vote",
        variant: "destructive",
      });
    },
  });

  const removeVoteMutation = useMutation({
    mutationFn: async ({
      targetType,
      targetId,
    }: {
      targetType: "post" | "reply";
      targetId: string;
    }) => {
      const response = await fetch("/api/forum/vote", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetType, targetId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove vote");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/forum/vote/${variables.targetType}/${variables.targetId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/forum/vote/${variables.targetType}/${variables.targetId}/count`] });
      if (variables.targetType === "post") {
        queryClient.invalidateQueries({ queryKey: [`/api/forum/posts/${postId}`] });
      }
      toast({
        title: "Vote removed",
      });
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async ({
      content,
      parentReplyId,
    }: {
      content: string;
      parentReplyId?: string | null;
    }) => {
      const response = await fetch(`/api/forum/posts/${postId}/replies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, parentReplyId: parentReplyId || null }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create reply");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forum/posts/${postId}/replies`] });
      queryClient.invalidateQueries({ queryKey: [`/api/forum/posts/${postId}`] });
      setReplyContent("");
      setNestedReplyContent("");
      setReplyingToId(null);
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply",
        variant: "destructive",
      });
    },
  });

  const markBestAnswerMutation = useMutation({
    mutationFn: async (replyId: string) => {
      const response = await fetch(`/api/forum/replies/${replyId}/best-answer`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mark best answer");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forum/posts/${postId}/replies`] });
      queryClient.invalidateQueries({ queryKey: [`/api/forum/posts/${postId}`] });
      toast({
        title: "Best answer marked",
        description: "This reply has been marked as the best answer",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark best answer",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: "post" | "reply"; id: string }) => {
      const endpoint = type === "post" ? `/api/forum/posts/${id}` : `/api/forum/replies/${id}`;
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      if (variables.type === "post") {
        toast({
          title: "Post deleted",
          description: "The post has been deleted successfully",
        });
        navigate("/forum");
      } else {
        queryClient.invalidateQueries({ queryKey: [`/api/forum/posts/${postId}/replies`] });
        queryClient.invalidateQueries({ queryKey: [`/api/forum/posts/${postId}`] });
        toast({
          title: "Reply deleted",
          description: "The reply has been deleted successfully",
        });
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete",
        variant: "destructive",
      });
    },
  });

  const handleVote = (targetType: "post" | "reply", targetId: string, voteType: "upvote" | "downvote") => {
    const currentVote = targetType === "post" ? postVoteData?.voteType : null;
    
    if (currentVote === voteType) {
      removeVoteMutation.mutate({ targetType, targetId });
    } else {
      voteMutation.mutate({ targetType, targetId, voteType });
    }
  };

  const handleReport = (type: "post" | "reply", id: string) => {
    setReportTarget({ type, id });
    setReportModalOpen(true);
  };

  const handleDelete = (type: "post" | "reply", id: string) => {
    setDeleteTarget({ type, id });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getReplyVoteData = (replyId: string) => {
    const voteDataQuery = queryClient.getQueryData<VoteData>([`/api/forum/vote/reply/${replyId}`]);
    return voteDataQuery?.voteType || null;
  };

  const VoteButtons = ({
    targetType,
    targetId,
    upvotes,
    downvotes,
    userVote,
  }: {
    targetType: "post" | "reply";
    targetId: string;
    upvotes: number;
    downvotes: number;
    userVote: "upvote" | "downvote" | null;
  }) => (
    <div className="flex md:flex-col items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className={`${userVote === "upvote" ? "text-primary" : "text-muted-foreground"}`}
        onClick={() => handleVote(targetType, targetId, "upvote")}
      >
        <ThumbsUp className="w-4 h-4" />
      </Button>
      <span className="font-semibold text-sm min-w-[2rem] text-center">
        {upvotes - downvotes}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className={`${userVote === "downvote" ? "text-primary" : "text-muted-foreground"}`}
        onClick={() => handleVote(targetType, targetId, "downvote")}
      >
        <ThumbsDown className="w-4 h-4" />
      </Button>
    </div>
  );

  if (postLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!postData?.post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Question Not Found</h3>
          <Link href="/forum">
            <Button>Back to Forum</Button>
          </Link>
        </div>
      </div>
    );
  }

  const post = postData.post;
  const replies = repliesData?.replies || [];
  const topLevelReplies = replies.filter((r) => !r.parentReplyId);
  const isAuthor = user?.id === post.authorId;
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/forum">Forum</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/forum/category/${post.category.slug}`}>
                  {post.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">{post.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="hidden md:block">
                <VoteButtons
                  targetType="post"
                  targetId={post.id}
                  upvotes={postVoteCount?.upvotes || 0}
                  downvotes={postVoteCount?.downvotes || 0}
                  userVote={postVoteData?.voteType || null}
                />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{post.title}</h1>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {post.postType && post.postType !== 'question' && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {post.postType === 'architecture_review' && <Crown className="w-3 h-3" />}
                      {post.postType === 'war_story' && <History className="w-3 h-3" />}
                      {post.postType === 'office_hours' && <Users className="w-3 h-3" />}
                      {post.postType === 'architecture_review' && 'Architecture Review'}
                      {post.postType === 'war_story' && 'War Story'}
                      {post.postType === 'office_hours' && 'Office Hours'}
                    </Badge>
                  )}
                  {post.expertOnly === 1 && (
                    <Badge className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Expert Request
                    </Badge>
                  )}
                  {post.hasAcceptedAnswer && (
                    <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Solved by Expert
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    {post.author.profilePhotoUrl ? (
                      <img
                        src={post.author.profilePhotoUrl}
                        alt={post.author.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {getInitials(post.author.fullName)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{post.author.fullName}</span>
                        <ExperienceBadge yearsOfExperience={post.author.yearsOfExperience} size="sm" />
                      </div>
                      {post.author.totalPoints !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {post.author.totalPoints} points
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">{post.category.name}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="prose prose-sm max-w-none mb-4">
                  <p className="whitespace-pre-wrap break-words">{post.content}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.viewCount} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{replies.length} {replies.length === 1 ? "reply" : "replies"}</span>
                  </div>
                </div>

                <div className="md:hidden mb-4">
                  <VoteButtons
                    targetType="post"
                    targetId={post.id}
                    upvotes={postVoteCount?.upvotes || 0}
                    downvotes={postVoteCount?.downvotes || 0}
                    userVote={postVoteData?.voteType || null}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReport("post", post.id)}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </Button>

                  {(isAuthor || isAdmin) && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete("post", post.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
          </h2>

          {user && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  className="mb-3"
                />
                <Button
                  onClick={() => createReplyMutation.mutate({ content: replyContent })}
                  disabled={!replyContent.trim() || createReplyMutation.isPending}
                >
                  {createReplyMutation.isPending ? "Posting..." : "Submit Reply"}
                </Button>
              </CardContent>
            </Card>
          )}

          {repliesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-3 w-1/4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : topLevelReplies.length > 0 ? (
            <div className="space-y-4">
              {topLevelReplies.map((reply) => {
                const nestedReplies = replies.filter((r) => r.parentReplyId === reply.id);
                const canMarkBest = isAuthor && !post.hasAcceptedAnswer;
                const isReplyAuthor = user?.id === reply.authorId;

                return (
                  <div key={reply.id}>
                    <Card className={reply.isBestAnswer ? "border-green-500 border-2" : ""}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="hidden md:block">
                            <VoteButtons
                              targetType="reply"
                              targetId={reply.id}
                              upvotes={0}
                              downvotes={0}
                              userVote={getReplyVoteData(reply.id)}
                            />
                          </div>

                          <div className="flex-1">
                            {reply.isBestAnswer && (
                              <Badge className="mb-3 bg-green-600 hover:bg-green-700">
                                <Check className="w-3 h-3 mr-1" />
                                Best Answer
                              </Badge>
                            )}

                            <div className="flex items-center gap-2 mb-3">
                              {reply.author.profilePhotoUrl ? (
                                <img
                                  src={reply.author.profilePhotoUrl}
                                  alt={reply.author.fullName}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                  {getInitials(reply.author.fullName)}
                                </div>
                              )}
                              <span className="font-semibold text-sm">{reply.author.fullName}</span>
                              <ExperienceBadge yearsOfExperience={reply.author.yearsOfExperience} size="sm" />
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                              </span>
                            </div>

                            <p className="whitespace-pre-wrap break-words mb-4">{reply.content}</p>

                            <div className="md:hidden mb-4">
                              <VoteButtons
                                targetType="reply"
                                targetId={reply.id}
                                upvotes={0}
                                downvotes={0}
                                userVote={getReplyVoteData(reply.id)}
                              />
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {user && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setReplyingToId(replyingToId === reply.id ? null : reply.id)
                                  }
                                >
                                  <ReplyIcon className="w-4 h-4 mr-2" />
                                  Reply
                                </Button>
                              )}

                              {canMarkBest && !reply.isBestAnswer && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => markBestAnswerMutation.mutate(reply.id)}
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Mark as Best Answer
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReport("reply", reply.id)}
                              >
                                <Flag className="w-4 h-4 mr-2" />
                                Report
                              </Button>

                              {(isReplyAuthor || isAdmin) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete("reply", reply.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              )}
                            </div>

                            {replyingToId === reply.id && (
                              <div className="mt-4 pl-4 border-l-2">
                                <Textarea
                                  placeholder="Write your reply..."
                                  value={nestedReplyContent}
                                  onChange={(e) => setNestedReplyContent(e.target.value)}
                                  rows={3}
                                  className="mb-3"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      createReplyMutation.mutate({
                                        content: nestedReplyContent,
                                        parentReplyId: reply.id,
                                      })
                                    }
                                    disabled={
                                      !nestedReplyContent.trim() || createReplyMutation.isPending
                                    }
                                  >
                                    Submit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setReplyingToId(null);
                                      setNestedReplyContent("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {nestedReplies.length > 0 && (
                      <div className="ml-8 mt-4 space-y-4">
                        {nestedReplies.map((nestedReply) => {
                          const isNestedAuthor = user?.id === nestedReply.authorId;

                          return (
                            <Card key={nestedReply.id}>
                              <CardContent className="p-4">
                                <div className="flex gap-4">
                                  <div className="hidden md:block">
                                    <VoteButtons
                                      targetType="reply"
                                      targetId={nestedReply.id}
                                      upvotes={0}
                                      downvotes={0}
                                      userVote={getReplyVoteData(nestedReply.id)}
                                    />
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                      {nestedReply.author.profilePhotoUrl ? (
                                        <img
                                          src={nestedReply.author.profilePhotoUrl}
                                          alt={nestedReply.author.fullName}
                                          className="w-6 h-6 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                          {getInitials(nestedReply.author.fullName)}
                                        </div>
                                      )}
                                      <span className="font-semibold text-sm">
                                        {nestedReply.author.fullName}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(nestedReply.createdAt), {
                                          addSuffix: true,
                                        })}
                                      </span>
                                    </div>

                                    <p className="whitespace-pre-wrap break-words mb-4">
                                      {nestedReply.content}
                                    </p>

                                    <div className="md:hidden mb-4">
                                      <VoteButtons
                                        targetType="reply"
                                        targetId={nestedReply.id}
                                        upvotes={0}
                                        downvotes={0}
                                        userVote={getReplyVoteData(nestedReply.id)}
                                      />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleReport("reply", nestedReply.id)}
                                      >
                                        <Flag className="w-4 h-4 mr-2" />
                                        Report
                                      </Button>

                                      {(isNestedAuthor || isAdmin) && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDelete("reply", nestedReply.id)}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No Replies Yet</h3>
              <p className="text-muted-foreground">Be the first to reply!</p>
            </Card>
          )}
        </div>
      </div>

      {reportTarget && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setReportTarget(null);
          }}
          targetType={reportTarget.type}
          targetId={reportTarget.id}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this{" "}
              {deleteTarget?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
