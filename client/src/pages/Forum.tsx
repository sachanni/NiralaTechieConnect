import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, ThumbsUp, TrendingUp, Crown, History, Users, Check } from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import ExperienceBadge from "@/components/ExperienceBadge";

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
  yearsOfExperience: number;
}

interface Post {
  id: string;
  title: string;
  authorId: string;
  categoryId: string;
  replyCount: number;
  upvoteCount: number;
  createdAt: string;
  author: User;
  category: Category;
  postType?: string;
  expertOnly?: number;
  hasAcceptedAnswer?: boolean;
}

interface ForumProps {
  idToken?: string;
}

export default function Forum({ idToken }: ForumProps = {}) {
  const [, navigate] = useLocation();

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<{ categories: Category[] }>({
    queryKey: ['/api/forum/categories'],
    queryFn: async () => {
      const response = await fetch('/api/forum/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const { data: postsData, isLoading: postsLoading } = useQuery<{ posts: Post[] }>({
    queryKey: ['/api/forum/posts', { sortBy: 'recent', limit: 5 }],
    queryFn: async () => {
      const response = await fetch('/api/forum/posts?sortBy=recent&limit=5');
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPostTypeIcon = (postType?: string) => {
    switch (postType) {
      case 'architecture_review':
        return <Crown className="w-3 h-3" />;
      case 'war_story':
        return <History className="w-3 h-3" />;
      case 'office_hours':
        return <Users className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getPostTypeLabel = (postType?: string) => {
    switch (postType) {
      case 'architecture_review':
        return 'Architecture Review';
      case 'war_story':
        return 'War Story';
      case 'office_hours':
        return 'Office Hours';
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <h1 className="text-xl md:text-2xl font-bold">Tech Forum</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/forum/ask">
                <Button className="flex-1 md:flex-none">
                  <Plus className="w-4 h-4 mr-2" />
                  Ask Question
                </Button>
              </Link>
              <Link href="/dashboard" className="hidden md:block">
                <Button variant="outline" className="flex-1 md:flex-none">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Get help and share knowledge with your tech community
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-8 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categoriesData?.categories && categoriesData.categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoriesData.categories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/forum/category/${category.slug}`)}
                >
                  <CardContent className="p-6">
                    <div className="text-3xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="w-3 h-3" />
                      <span>{category.postCount} {category.postCount === 1 ? 'post' : 'posts'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No Categories Yet</h3>
              <p className="text-muted-foreground">Check back later</p>
            </Card>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Trending Questions</h2>
          </div>
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
            <div className="space-y-4">
              {postsData.posts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/forum/post/${post.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors flex-1">
                            {post.title}
                          </h3>
                          {post.hasAcceptedAnswer && (
                            <Badge className="bg-green-600 hover:bg-green-700 flex-shrink-0">
                              <Check className="w-3 h-3 mr-1" />
                              Solved
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {getPostTypeLabel(post.postType) && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              {getPostTypeIcon(post.postType)}
                              {getPostTypeLabel(post.postType)}
                            </Badge>
                          )}
                          {post.expertOnly === 1 && (
                            <Badge className="text-xs bg-yellow-600 hover:bg-yellow-700 flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Expert Request
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            {post.author.profilePhotoUrl ? (
                              <img
                                src={post.author.profilePhotoUrl}
                                alt={post.author.fullName}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                {getInitials(post.author.fullName)}
                              </div>
                            )}
                            <span>{post.author.fullName}</span>
                            <ExperienceBadge yearsOfExperience={post.author.yearsOfExperience} size="sm" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {post.category.name}
                          </Badge>
                          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.replyCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{post.upvoteCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No Questions Yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to ask a question!</p>
              <Link href="/forum/ask">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ask Question
                </Button>
              </Link>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
