import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MessageSquare, Bell, BellOff, Loader2, ChevronRight } from "lucide-react";
import { useForumSubscriptions } from "@/hooks/useForumSubscriptions";
import { Link } from "wouter";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  postCount: number;
}

interface ForumDiscoveryPanelProps {
  categories: Category[];
  isLoading?: boolean;
  mode?: 'empty-state' | 'compact';
  error?: Error | null;
  onRetry?: () => void;
}

export default function ForumDiscoveryPanel({ 
  categories = [], 
  isLoading = false,
  mode = 'empty-state',
  error = null,
  onRetry
}: ForumDiscoveryPanelProps) {
  const { subscriptions, isSubscribed, toggleSubscription, isLoading: subscriptionLoading } = useForumSubscriptions();
  const [showAll, setShowAll] = useState(false);

  // Filter to show only unsubscribed categories - NEVER show subscribed categories in discovery panel
  // When showAll is true, show ALL unsubscribed categories (not just first 6)
  const unsubscribedCategories = categories.filter(cat => !isSubscribed(cat.id));
  const displayCategories = unsubscribedCategories; // Always use unsubscribed only

  // Sort by post count (engagement)
  const sortedCategories = [...displayCategories].sort((a, b) => b.postCount - a.postCount);

  // Empty State Mode - Prominent panel when user has no subscriptions
  if (mode === 'empty-state') {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            ) : error ? (
              <MessageSquare className="w-6 h-6 text-destructive" />
            ) : (
              <MessageSquare className="w-6 h-6 text-primary" />
            )}
          </div>
          <CardTitle className="text-xl md:text-2xl">
            {error ? 'Failed to Load Forums' : 'Choose Forums to Follow'}
          </CardTitle>
          <CardDescription className="text-base">
            {error 
              ? 'Unable to fetch forum categories. Please try again.' 
              : 'Subscribe to forum categories to see discussions in your feed. Select topics that interest you!'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Loading State */}
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Loading forum categories...</p>
            </div>
          ) : error ? (
            /* Error State with Retry */
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {error.message || 'Unable to fetch forum categories. Please try again.'}
              </p>
              {onRetry && (
                <Button onClick={onRetry} variant="outline">
                  Try Again
                </Button>
              )}
            </div>
          ) : sortedCategories.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="font-medium mb-2">All Forums Subscribed! 🎉</p>
              <p className="text-sm text-muted-foreground">
                You're subscribed to all available forums. Discussions will appear in your feed.
              </p>
            </div>
          ) : (
            <>
              {(showAll ? sortedCategories : sortedCategories.slice(0, 6)).map((category) => (
                <Card 
                  key={category.id} 
                  className="hover-elevate transition-all border-border/50 hover:border-primary/30"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-2xl flex-shrink-0">{category.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Link href={`/forum/category/${category.slug}`}>
                              <h3 className="font-semibold text-sm md:text-base hover:text-primary transition-colors cursor-pointer">
                                {category.name}
                              </h3>
                            </Link>
                            <Badge variant="secondary" className="text-xs">
                              {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                            </Badge>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isSubscribed(category.id) ? "outline" : "default"}
                        onClick={() => toggleSubscription(category.id)}
                        disabled={subscriptionLoading}
                        className="flex-shrink-0 gap-2"
                      >
                        {subscriptionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isSubscribed(category.id) ? (
                          <>
                            <BellOff className="w-4 h-4" />
                            <span className="hidden sm:inline">Unsubscribe</span>
                          </>
                        ) : (
                          <>
                            <Bell className="w-4 h-4" />
                            <span className="hidden sm:inline">Subscribe</span>
                          </>
                        )}
                      </Button>
                    </div>
                    {!isSubscribed(category.id) && (
                      <p className="text-xs text-primary/70 mt-2 ml-11">
                        💡 Posts from this forum will appear in your Discussions feed
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {!showAll && unsubscribedCategories.length > 6 && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setShowAll(true)}
                >
                  Show All Forums ({unsubscribedCategories.length - 6} more)
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
              
              <div className="pt-2 text-center">
                <Link href="/forum">
                  <Button variant="link" className="gap-2">
                    Browse All Forums <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Compact Mode - Horizontal chips when user has subscriptions
  if (mode === 'compact') {
    // Sort unsubscribed categories only (never show subscribed in compact mode)
    const compactCategories = [...unsubscribedCategories].sort((a, b) => b.postCount - a.postCount);
    
    // Show "all subscribed" message instead of disappearing
    const showAllSubscribedMessage = !isLoading && !error && compactCategories.length === 0;

    return (
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
            ) : error ? (
              <MessageSquare className="w-5 h-5 text-destructive flex-shrink-0" />
            ) : (
              <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">
                {error ? 'Failed to Load Forums' : 'Discover More Forums'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {error 
                  ? 'Unable to fetch categories. Click to retry.' 
                  : 'Subscribe to see discussions in your feed'}
              </p>
            </div>
            {error && onRetry && (
              <Button onClick={onRetry} size="sm" variant="outline">
                Retry
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="py-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : error ? (
            <div className="py-6 text-center">
              <p className="text-xs text-muted-foreground">Failed to load forum categories</p>
            </div>
          ) : showAllSubscribedMessage ? (
            <div className="py-6 text-center">
              <p className="text-sm font-medium text-green-600">✓ All Forums Subscribed</p>
              <p className="text-xs text-muted-foreground mt-1">
                You're following all available forums!
              </p>
            </div>
          ) : (
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-2">
                {compactCategories.slice(0, 10).map((category) => (
                <Card 
                  key={category.id}
                  className="inline-flex items-center gap-2 p-3 hover-elevate transition-all border-border/50 hover:border-primary/30 flex-shrink-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/forum/category/${category.slug}`}>
                          <span className="font-medium text-sm hover:text-primary transition-colors cursor-pointer">
                            {category.name}
                          </span>
                        </Link>
                        <Badge variant="secondary" className="text-xs">
                          {category.postCount}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleSubscription(category.id)}
                    disabled={subscriptionLoading}
                    className="gap-1.5 h-7 px-2"
                  >
                    {subscriptionLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Bell className="w-3 h-3" />
                        <span className="text-xs">Subscribe</span>
                      </>
                    )}
                  </Button>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          )}
          
          {!isLoading && !error && unsubscribedCategories.length > 10 && (
            <div className="mt-2 text-center">
              <Link href="/forum">
                <Button variant="link" size="sm" className="gap-1 text-xs">
                  See All Forums <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
