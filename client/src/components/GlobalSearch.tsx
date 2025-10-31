import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Users, Briefcase, MessageSquare, Lightbulb, Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  idToken: string;
}

export default function GlobalSearch({ idToken }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: results, isLoading } = useQuery({
    queryKey: ['/api/search', query],
    queryFn: async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: query.length >= 2,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (type: string, id: string) => {
    setIsOpen(false);
    setQuery("");
    
    const routes: Record<string, string> = {
      users: `/find-teammates`,
      jobs: `/jobs`,
      posts: `/forum/post/${id}`,
      ideas: `/ideas/${id}`,
      events: `/events/${id}`,
    };
    
    navigate(routes[type] || '/');
  };

  const totalResults = results 
    ? (results.users?.length || 0) + (results.jobs?.length || 0) + 
      (results.posts?.length || 0) + (results.ideas?.length || 0) + 
      (results.events?.length || 0)
    : 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search people, jobs, discussions..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <Card className="absolute top-full mt-2 w-full max-h-[500px] overflow-y-auto z-50 shadow-lg">
          <CardContent className="p-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Searching...</p>
            ) : totalResults === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No results found for "{query}"
              </p>
            ) : (
              <div className="space-y-4">
                {results.users?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
                      <Users className="w-3 h-3" />
                      PEOPLE ({results.users.length})
                    </div>
                    <div className="space-y-1">
                      {results.users.map((user: any) => (
                        <div
                          key={user.id}
                          onClick={() => handleResultClick('users', user.id)}
                          className="p-2 hover:bg-accent rounded cursor-pointer transition-colors"
                        >
                          <p className="font-medium text-sm">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">{user.company}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.jobs?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
                      <Briefcase className="w-3 h-3" />
                      JOBS ({results.jobs.length})
                    </div>
                    <div className="space-y-1">
                      {results.jobs.map((job: any) => (
                        <div
                          key={job.id}
                          onClick={() => handleResultClick('jobs', job.id)}
                          className="p-2 hover:bg-accent rounded cursor-pointer transition-colors"
                        >
                          <p className="font-medium text-sm">{job.jobTitle}</p>
                          <p className="text-xs text-muted-foreground">{job.companyName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.posts?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
                      <MessageSquare className="w-3 h-3" />
                      FORUM ({results.posts.length})
                    </div>
                    <div className="space-y-1">
                      {results.posts.map((post: any) => (
                        <div
                          key={post.id}
                          onClick={() => handleResultClick('posts', post.id)}
                          className="p-2 hover:bg-accent rounded cursor-pointer transition-colors"
                        >
                          <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.ideas?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
                      <Lightbulb className="w-3 h-3" />
                      IDEAS ({results.ideas.length})
                    </div>
                    <div className="space-y-1">
                      {results.ideas.map((idea: any) => (
                        <div
                          key={idea.id}
                          onClick={() => handleResultClick('ideas', idea.id)}
                          className="p-2 hover:bg-accent rounded cursor-pointer transition-colors"
                        >
                          <p className="font-medium text-sm line-clamp-1">{idea.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.events?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" />
                      EVENTS ({results.events.length})
                    </div>
                    <div className="space-y-1">
                      {results.events.map((event: any) => (
                        <div
                          key={event.id}
                          onClick={() => handleResultClick('events', event.id)}
                          className="p-2 hover:bg-accent rounded cursor-pointer transition-colors"
                        >
                          <p className="font-medium text-sm line-clamp-1">{event.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
