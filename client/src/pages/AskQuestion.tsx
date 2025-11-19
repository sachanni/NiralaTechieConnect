import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useSearch, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, X, Crown, BookOpen, History, Users } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface AskQuestionProps {
  idToken?: string;
}

export default function AskQuestion({ idToken }: AskQuestionProps = {}) {
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [postType, setPostType] = useState<"question" | "architecture_review" | "war_story" | "office_hours">("question");
  const [expertOnly, setExpertOnly] = useState(false);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<{ categories: Category[] }>({
    queryKey: ['/api/forum/categories'],
    queryFn: async () => {
      const response = await fetch('/api/forum/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Pre-select category from query parameter
  useEffect(() => {
    if (categoriesData?.categories && searchParams) {
      const params = new URLSearchParams(searchParams);
      const categorySlug = params.get('category');
      
      if (categorySlug && !categoryId) {
        const matchingCategory = categoriesData.categories.find(
          cat => cat.slug === categorySlug
        );
        
        if (matchingCategory) {
          setCategoryId(matchingCategory.id);
        }
      }
    }
  }, [categoriesData, searchParams, categoryId]);

  const createPostMutation = useMutation({
    mutationFn: async (data: { 
      title: string; 
      categoryId: string; 
      content: string; 
      tags: string[] | null;
      postType: string;
      expertOnly: boolean;
    }) => {
      if (!idToken) {
        throw new Error('Please log in to ask a question');
      }

      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create post');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/forum/categories'] });

      toast({
        title: "Question Posted!",
        description: "Your question has been posted successfully.",
      });

      navigate(`/forum/post/${data.post.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post question",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (title.length > 200) {
      toast({
        title: "Validation Error",
        description: "Title must be less than 200 characters",
        variant: "destructive",
      });
      return;
    }

    if (!categoryId) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Validation Error",
        description: "Content is required",
        variant: "destructive",
      });
      return;
    }

    if (content.length < 50) {
      toast({
        title: "Validation Error",
        description: "Content must be at least 50 characters",
        variant: "destructive",
      });
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 5);

    if (tags.length > 5) {
      toast({
        title: "Validation Error",
        description: "Maximum 5 tags allowed",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      title: title.trim(),
      categoryId,
      content: content.trim(),
      tags: tags.length > 0 ? tags : null,
      postType,
      expertOnly,
    });
  };

  const parsedTags = tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .slice(0, 5);

  const selectedCategory = categoriesData?.categories.find(cat => cat.id === categoryId);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Ask a Question</h1>
          </div>
          <p className="text-muted-foreground">
            Get help from your tech community
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Question Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="What's your question?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={200}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {title.length}/200 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    {categoriesLoading ? (
                      <div className="h-10 bg-muted rounded animate-pulse"></div>
                    ) : (
                      <Select value={categoryId} onValueChange={setCategoryId} required>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesData?.categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <span className="flex items-center gap-2">
                                <span>{category.icon}</span>
                                <span>{category.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postType">
                      Post Type <span className="text-destructive">*</span>
                    </Label>
                    <Select value={postType} onValueChange={(value: any) => setPostType(value)} required>
                      <SelectTrigger id="postType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="question">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Question</div>
                              <div className="text-xs text-muted-foreground">Ask for help or advice</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="architecture_review">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Architecture Review</div>
                              <div className="text-xs text-muted-foreground">Get feedback on system design</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="war_story">
                          <div className="flex items-center gap-2">
                            <History className="w-4 h-4" />
                            <div>
                              <div className="font-medium">War Story</div>
                              <div className="text-xs text-muted-foreground">Share lessons learned</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="office_hours">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Office Hours</div>
                              <div className="text-xs text-muted-foreground">Schedule a Q&A session</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                    <Checkbox
                      id="expertOnly"
                      checked={expertOnly}
                      onCheckedChange={(checked) => setExpertOnly(checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="expertOnly" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-600" />
                        Request Expert Response
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prioritize responses from veterans (15+ years experience)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">
                      Content <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Describe your question in detail..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={10}
                      required
                      className="resize-y"
                    />
                    <p className="text-xs text-muted-foreground">
                      {content.length} characters (minimum 50)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (optional)</Label>
                    <Input
                      id="tags"
                      placeholder="javascript, react, nodejs (comma-separated, max 5)"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                    />
                    {parsedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {parsedTags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                            <button
                              type="button"
                              onClick={() => {
                                const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== tag);
                                setTagsInput(tags.join(', '));
                              }}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {parsedTags.length}/5 tags
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createPostMutation.isPending}
                  className="flex-1"
                >
                  {createPostMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-t-transparent border-current rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Question'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
                <Link href="/forum">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-1">
              {showPreview && (
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {title && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{title}</h3>
                      </div>
                    )}

                    {selectedCategory && (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{selectedCategory.icon}</span>
                        <Badge variant="secondary">{selectedCategory.name}</Badge>
                      </div>
                    )}

                    {content && (
                      <div>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {content}
                        </p>
                      </div>
                    )}

                    {parsedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {parsedTags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {!title && !content && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Start typing to see preview
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
