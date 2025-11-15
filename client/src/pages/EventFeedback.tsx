import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star, Heart, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import { type Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import techEventBg from "@assets/stock_images/modern_technology_co_afb0d6e1.jpg";

export default function EventFeedback() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: {
      attendeeName: string;
      attendeeEmail?: string;
      rating: number;
      comments?: string;
    }) => {
      return await apiRequest("POST", `/api/feedback/${eventId}`, feedbackData);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your valuable feedback.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!attendeeName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    submitFeedbackMutation.mutate({
      attendeeName: attendeeName.trim(),
      attendeeEmail: attendeeEmail.trim() || undefined,
      rating,
      comments: comments.trim() || undefined,
    });
  };

  if (eventLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-900"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(88, 28, 135, 0.92) 0%, rgba(30, 27, 75, 0.90) 50%, rgba(17, 24, 39, 0.95) 100%), url(${techEventBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-900 p-4"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(88, 28, 135, 0.92) 0%, rgba(30, 27, 75, 0.90) 50%, rgba(17, 24, 39, 0.95) 100%), url(${techEventBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Card className="max-w-md w-full bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="pt-6 text-center text-white">
            <p>Event not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-900"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(88, 28, 135, 0.92) 0%, rgba(30, 27, 75, 0.90) 50%, rgba(17, 24, 39, 0.95) 100%), url(${techEventBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md sm:max-w-lg">
        {submitted ? (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl" data-testid="card-success">
            <CardContent className="pt-10 pb-10 sm:pt-12 sm:pb-12 px-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 rounded-full bg-green-500/20 border-2 border-green-400">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                Thank You!
              </h2>
              <p className="text-white/90 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
                Your feedback has been successfully submitted.
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-white/80 text-sm sm:text-base">
                  <strong className="text-white">{event.title}</strong>
                </p>
                <p className="text-white/70 text-xs sm:text-sm">
                  Your rating: {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="inline w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400 ml-1" />
                  ))}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl" data-testid="card-feedback-form">
            <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 mx-auto rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                Event Feedback
              </CardTitle>
              <CardDescription className="text-white/80 text-sm sm:text-base mt-2">
                We'd love to hear your thoughts about the event
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6">
              {/* Event Info */}
              <div className="bg-white/5 backdrop-blur-sm rounded-md p-3 sm:p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-2 text-base sm:text-lg">{event.title}</h3>
                <div className="space-y-1 text-xs sm:text-sm text-white/70">
                  {event.eventDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{new Date(event.eventDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30 text-sm sm:text-base"
                    data-testid="input-name"
                    required
                  />
                </div>

                {/* Email Field (Optional) */}
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
                    Email Address <span className="text-white/50 text-xs">(Optional)</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30 text-sm sm:text-base"
                    data-testid="input-email"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white mb-2 sm:mb-3">
                    How would you rate this event? <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-1.5 sm:gap-2 justify-center" data-testid="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110 active:scale-95 p-1"
                        data-testid={`star-${star}`}
                      >
                        <Star
                          className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-colors ${
                            star <= (hoveredRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-white/20 text-white/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-white/80 text-xs sm:text-sm mt-2">
                      {rating === 5 && "Excellent!"}
                      {rating === 4 && "Very Good!"}
                      {rating === 3 && "Good"}
                      {rating === 2 && "Could be better"}
                      {rating === 1 && "Needs improvement"}
                    </p>
                  )}
                </div>

                {/* Comments */}
                <div>
                  <label htmlFor="comments" className="block text-xs sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
                    Additional Comments <span className="text-white/50 text-xs">(Optional)</span>
                  </label>
                  <Textarea
                    id="comments"
                    placeholder="Share your thoughts about the event..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                    className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30 text-sm sm:text-base min-h-[80px]"
                    data-testid="textarea-comments"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitFeedbackMutation.isPending}
                  className="w-full text-sm sm:text-base font-semibold shadow-lg mt-2"
                  data-testid="button-submit"
                >
                  {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
