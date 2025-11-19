import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { MessageSquare, ThumbsUp, Eye, Check, Plus, ChevronLeft, ChevronRight, Bell, BellOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useForumSubscriptions } from "@/hooks/useForumSubscriptions";
import { useAuth } from "@/hooks/useAuth";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  postCount: number;
}

interface User {
  id: string;
  fullName: string;
  profilePhotoUrl?: string | null;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  categoryId: string;
  tags: string[] | null;
  replyCount: number;
  upvoteCount: number;
  viewCount: number;
  hasAcceptedAnswer: boolean;
  createdAt: string;
  author: User;
}

type FilterOption = "recent" | "trending" | "unanswered" | "answered";
type SortOption = "newest" | "most_voted" | "most_replied";

export default function ForumCategory() {
  const [match, params] = useRoute("/forum/category/:slug");
  const slug = params?.slug || "";
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { isSubscribed, toggleSubscription, isLoading: subscriptionLoading } = useForumSubscriptions();

  const [filter, setFilter] = useState<FilterOption>("recent");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useQuery<{ category: Category }>({
    queryKey: ['/api/forum/categories', slug],
    queryFn: async () => {
      console.log('[ForumCategory] Fetching category with slug:', slug);
      const response = await fetch(`/api/forum/categories/${slug}`);
      console.log('[ForumCategory] Category response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ForumCategory] Category fetch failed:', errorData);
        throw new Error('Failed to fetch category');
      }
      const data = await response.json();
      console.log('[ForumCategory] Category data received:', data);
      return data;
    },
    enabled: !!slug,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery<{ posts: Post[]; total: number }>({
    queryKey: ['/api/forum/posts', { categorySlug: slug, filter, sortBy, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        categorySlug: slug,
        sortBy: filter,
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filter === "answered") {
        params.append("hasAnswer", "true");
      } else if (filter === "unanswered") {
        params.append("hasAnswer", "false");
      }

      if (sortBy === "most_voted") {
        params.set("sortBy", "upvotes");
      } else if (sortBy === "most_replied") {
        params.set("sortBy", "replies");
      }

      const response = await fetch(`/api/forum/posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
    enabled: !!slug,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const totalPages = postsData ? Math.ceil(postsData.total / limit) : 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!categoryData?.category) {
    console.log('[ForumCategory] Category not found. categoryData:', categoryData, 'error:', categoryError);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Category Not Found</h3>
          {categoryError && (
            <p className="text-sm text-destructive mb-2">Error: {(categoryError as Error).message}</p>
          )}
          <Link href="/forum">
            <Button>Back to Forum</Button>
          </Link>
        </div>
      </div>
    );
  }

  const category = categoryData.category;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/forum">Forum</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{category.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{category.icon}</span>
                <h1 className="text-2xl md:text-3xl font-bold">{category.name}</h1>
              </div>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              {user && (
                <Button
                  variant={isSubscribed(category.id) ? "outline" : "secondary"}
                  onClick={() => toggleSubscription(category.id)}
                  disabled={subscriptionLoading}
                  className="w-full md:w-auto"
                >
                  {subscriptionLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {isSubscribed(category.id) ? "Unsubscribing..." : "Subscribing..."}
                    </>
                  ) : isSubscribed(category.id) ? (
                    <>
                      <BellOff className="w-4 h-4 mr-2" />
                      Unsubscribe
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>
              )}
              <Link href={`/forum/ask?category=${category.slug}`}>
                <Button className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Ask Question
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Tabs value={filter} onValueChange={(value) => {
              setFilter(value as FilterOption);
              setPage(1);
            }}>
              <TabsList className="grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                <TabsTrigger value="answered">Answered</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={sortBy} onValueChange={(value) => {
              setSortBy(value as SortOption);
              setPage(1);
            }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="most_voted">Most Voted</SelectItem>
                <SelectItem value="most_replied">Most Replied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-3"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : postsData?.posts && postsData.posts.length > 0 ? (
          <>
            <div className="space-y-4 mb-6">
              {postsData.posts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/forum/post/${post.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors flex-1">
                            {post.title}
                            {post.hasAcceptedAnswer && (
                              <Check className="inline-block w-5 h-5 ml-2 text-green-600" />
                            )}
                          </h3>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {post.content.substring(0, 200)}
                          {post.content.length > 200 && '...'}
                        </p>

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {post.author.profilePhotoUrl ? (
                              <img
                                src={post.author.profilePhotoUrl}
                                alt={post.author.fullName}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                {getInitials(post.author.fullName)}
                              </div>
                            )}
                            <span>{post.author.fullName}</span>
                          </div>
                          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.replyCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{post.upvoteCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.viewCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Questions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to ask a question in this category!
            </p>
            <Link href={`/forum/ask?category=${category.slug}`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ask Question
              </Button>
            </Link>
          </Card>
        )}
      </div>

      <Link href={`/forum/ask?category=${category.slug}`}>
        <Button
          className="fixed bottom-6 right-6 md:hidden rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}
