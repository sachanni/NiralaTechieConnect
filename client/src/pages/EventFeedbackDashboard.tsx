import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Star, Download, ArrowLeft, TrendingUp, MessageSquare, Users } from 'lucide-react';
import type { SelectEventFeedback, SelectEvent } from '@shared/schema';

interface FeedbackResponse {
  feedback: SelectEventFeedback[];
  event: SelectEvent;
  stats: {
    totalSubmissions: number;
    averageRating: number;
  };
}

interface EventFeedbackDashboardProps {
  userId: number;
  idToken: string;
}

export default function EventFeedbackDashboard({ userId, idToken }: EventFeedbackDashboardProps) {
  const { eventId } = useParams<{ eventId: string }>();
  const [, navigate] = useLocation();
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('newest');

  const { data, isLoading, error } = useQuery<FeedbackResponse>({
    queryKey: ['/api/feedback', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/feedback/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch feedback');
      }
      
      return response.json();
    },
    enabled: !!eventId && !!idToken,
  });

  const handleExportCSV = () => {
    if (!data?.feedback.length) return;

    const headers = ['Submitted At', 'Name', 'Email', 'Rating', 'Comments'];
    const rows = data.feedback.map(f => [
      new Date(f.submittedAt).toLocaleString(),
      f.attendeeName,
      f.attendeeEmail || 'N/A',
      f.rating.toString(),
      f.comments?.replace(/"/g, '""') || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${data.event.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getFilteredAndSortedFeedback = () => {
    if (!data?.feedback) return [];

    let filtered = [...data.feedback];

    // Apply rating filter
    if (ratingFilter !== 'all') {
      const targetRating = parseInt(ratingFilter);
      filtered = filtered.filter(f => f.rating === targetRating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      } else if (sortOrder === 'highest') {
        return b.rating - a.rating;
      } else if (sortOrder === 'lowest') {
        return a.rating - b.rating;
      }
      return 0;
    });

    return filtered;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-muted text-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading feedback...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Feedback</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Unable to load feedback data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => navigate('/events')}
              data-testid="button-back-events"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredFeedback = getFilteredAndSortedFeedback();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/events/${eventId}`)}
              className="mb-2"
              data-testid="button-back-event"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event
            </Button>
            <h1 className="text-3xl font-bold">{data.event.title}</h1>
            <p className="text-muted-foreground">Feedback Dashboard</p>
          </div>
          <Button
            onClick={handleExportCSV}
            disabled={!data.feedback.length}
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-submissions">
                {data.stats.totalSubmissions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Feedback responses received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold" data-testid="text-average-rating">
                  {data.stats.averageRating.toFixed(1)}
                </div>
                <div className="flex">
                  {renderStars(Math.round(data.stats.averageRating))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Out of 5.0 stars
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Comments</CardTitle>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-comments-count">
                {data.feedback.filter(f => f.comments).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Detailed feedback responses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter & Sort</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Rating Filter</label>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger data-testid="select-rating-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger data-testid="select-sort-order">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest">Highest Rating</SelectItem>
                    <SelectItem value="lowest">Lowest Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              All Feedback ({filteredFeedback.length})
            </h2>
          </div>

          {filteredFeedback.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {data.feedback.length === 0
                    ? 'No feedback submissions yet'
                    : 'No feedback matches your filters'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((feedback) => (
                <Card key={feedback.id} data-testid={`card-feedback-${feedback.id}`}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <CardTitle className="text-base">
                            {feedback.attendeeName}
                          </CardTitle>
                          {feedback.attendeeEmail && (
                            <CardDescription className="text-sm">
                              {feedback.attendeeEmail}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(feedback.rating)}
                        <Badge variant="secondary">
                          {feedback.rating}.0
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  {feedback.comments && (
                    <>
                      <Separator />
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground italic">
                          "{feedback.comments}"
                        </p>
                      </CardContent>
                    </>
                  )}
                  <CardContent className={feedback.comments ? 'pt-0' : ''}>
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(feedback.submittedAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
