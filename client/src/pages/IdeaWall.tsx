import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Plus, Search, Users, MapPin, Briefcase, ArrowUp, MessageSquare, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import PostIdeaModal from "@/components/PostIdeaModal";
import { UpvoteButton } from "@/components/UpvoteButton";

interface User {
  id: string;
  fullName: string;
  company: string;
  profilePhotoUrl?: string | null;
  flatNumber: string;
}

interface Idea {
  id: string;
  posterId: string;
  title: string;
  description: string;
  rolesNeeded: string[];
  payStructure: string;
  status: string;
  interestCount: number;
  upvoteCount: number;
  commentCount: number;
  createdAt: string;
  poster: User;
}

type SortOption = "recent" | "upvotes" | "trending";

interface IdeaWallProps {
  userId?: string;
  idToken?: string;
}

export default function IdeaWall({ userId, idToken }: IdeaWallProps = {}) {
  const [, navigate] = useLocation();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const { data, isLoading } = useQuery<{ ideas: Idea[] }>({
    queryKey: ['/api/ideas'],
    queryFn: async () => {
      const response = await fetch('/api/ideas', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch ideas');
      return response.json();
    },
    enabled: !!idToken,
  });

  const filteredAndSortedIdeas = (data?.ideas || [])
    .filter(idea => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        idea.title.toLowerCase().includes(query) ||
        idea.description.toLowerCase().includes(query) ||
        idea.rolesNeeded.some(role => role.toLowerCase().includes(query)) ||
        idea.poster.fullName.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === "upvotes") {
        return b.upvoteCount - a.upvoteCount;
      } else if (sortBy === "trending") {
        const aScore = a.upvoteCount * 2 + a.commentCount + a.interestCount;
        const bScore = b.upvoteCount * 2 + b.commentCount + b.interestCount;
        return bScore - aScore;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      'Frontend Dev': 'bg-blue-100 text-blue-700',
      'Backend Dev': 'bg-green-100 text-green-700',
      'Full Stack Dev': 'bg-purple-100 text-purple-700',
      'ML Engineer': 'bg-pink-100 text-pink-700',
      'Designer': 'bg-orange-100 text-orange-700',
      'Product Manager': 'bg-yellow-100 text-yellow-700',
      'Business Dev': 'bg-teal-100 text-teal-700',
    };
    return colorMap[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Idea Wall</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsPostModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Post Idea
              </Button>
              <Link href="/my-ideas" className="hidden md:block">
                <Button variant="outline">My Ideas</Button>
              </Link>
              <Link href="/dashboard" className="hidden md:block">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">
            Share your startup ideas and find co-founders in your community
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search ideas, roles, or founders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <TabsList>
                <TabsTrigger value="recent" className="gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  Recent
                </TabsTrigger>
                <TabsTrigger value="upvotes" className="gap-1.5">
                  <ArrowUp className="w-4 h-4" />
                  Most Upvoted
                </TabsTrigger>
                <TabsTrigger value="trending" className="gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading ideas...</div>
          </div>
        ) : filteredAndSortedIdeas.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No matching ideas found' : 'No ideas yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Be the first to share your startup idea!'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsPostModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Idea
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredAndSortedIdeas.length} {filteredAndSortedIdeas.length === 1 ? 'idea' : 'ideas'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedIdeas.map((idea) => (
                <Card 
                  key={idea.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/ideas/${idea.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg leading-tight mb-2">
                          {idea.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {idea.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <Briefcase className="w-3 h-3" />
                        <span>Roles Needed</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {idea.rolesNeeded.slice(0, 3).map((role) => (
                          <Badge 
                            key={role} 
                            variant="secondary" 
                            className={`text-xs ${getRoleBadgeColor(role)}`}
                          >
                            {role}
                          </Badge>
                        ))}
                        {idea.rolesNeeded.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                            +{idea.rolesNeeded.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                            <ArrowUp className="w-4 h-4" />
                            <span className="font-medium">{idea.upvoteCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-medium">{idea.commentCount}</span>
                          </div>
                          {idea.interestCount > 0 && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span className="font-medium">{idea.interestCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {idea.poster.profilePhotoUrl ? (
                          <img
                            src={idea.poster.profilePhotoUrl}
                            alt={idea.poster.fullName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {getInitials(idea.poster.fullName)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {idea.poster.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {idea.poster.company}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <PostIdeaModal
        idToken={idToken}
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />
    </div>
  );
}
