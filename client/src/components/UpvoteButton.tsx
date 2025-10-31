import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface UpvoteButtonProps {
  ideaId: string;
  initialUpvoteCount: number;
  idToken?: string;
  variant?: "default" | "compact";
}

export function UpvoteButton({ ideaId, initialUpvoteCount, idToken, variant = "default" }: UpvoteButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [optimisticUpvoted, setOptimisticUpvoted] = useState<boolean | null>(null);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);

  const { data: upvoteStatus } = useQuery<{ hasUpvoted: boolean }>({
    queryKey: [`/api/ideas/${ideaId}/has-upvoted`],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/has-upvoted`, {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (!response.ok) return { hasUpvoted: false };
      return response.json();
    },
    enabled: !!idToken,
  });

  const hasUpvoted = optimisticUpvoted !== null ? optimisticUpvoted : (upvoteStatus?.hasUpvoted ?? false);
  const upvoteCount = optimisticCount !== null ? optimisticCount : initialUpvoteCount;

  const toggleUpvoteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/upvote`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${idToken}` },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to toggle upvote");
      return response.json();
    },
    onMutate: async () => {
      const newUpvoted = !hasUpvoted;
      const newCount = hasUpvoted ? upvoteCount - 1 : upvoteCount + 1;
      
      setOptimisticUpvoted(newUpvoted);
      setOptimisticCount(newCount);
      
      return { previousUpvoted: hasUpvoted, previousCount: upvoteCount };
    },
    onSuccess: (data) => {
      setOptimisticUpvoted(null);
      setOptimisticCount(null);
      
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}/has-upvoted`] });
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    },
    onError: (error, variables, context: any) => {
      setOptimisticUpvoted(null);
      setOptimisticCount(null);
      
      toast({
        title: "Error",
        description: "Failed to update upvote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleUpvoteMutation.mutate();
  };

  if (variant === "compact") {
    return (
      <Button
        variant={hasUpvoted ? "default" : "outline"}
        size="sm"
        onClick={handleUpvote}
        disabled={toggleUpvoteMutation.isPending}
        className={cn(
          "gap-1.5 transition-all duration-200",
          hasUpvoted && "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <ArrowUp className={cn("w-4 h-4 transition-transform", hasUpvoted && "scale-110")} />
        <span className="font-medium">{upvoteCount}</span>
      </Button>
    );
  }

  return (
    <Button
      variant={hasUpvoted ? "default" : "outline"}
      size="lg"
      onClick={handleUpvote}
      disabled={toggleUpvoteMutation.isPending}
      className={cn(
        "gap-2 transition-all duration-200",
        hasUpvoted && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
      )}
    >
      <ArrowUp className={cn("w-5 h-5 transition-transform", hasUpvoted && "scale-125 animate-bounce")} />
      <div className="flex flex-col items-start">
        <span className="text-sm font-semibold">{hasUpvoted ? "Upvoted" : "Upvote"}</span>
        <span className="text-xs opacity-90">{upvoteCount} {upvoteCount === 1 ? "vote" : "votes"}</span>
      </div>
    </Button>
  );
}
