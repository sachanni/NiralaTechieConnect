import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Video } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface BookSessionModalProps {
  mentorId: string;
  mentorName: string;
  skillsOffered: string[];
  idToken: string;
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
];

export default function BookSessionModal({
  mentorId,
  mentorName,
  skillsOffered,
  idToken,
  isOpen,
  onClose,
}: BookSessionModalProps) {
  const { toast } = useToast();
  const [skillTopic, setSkillTopic] = useState("");
  const [sessionDate, setSessionDate] = useState<Date>();
  const [sessionTime, setSessionTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [sessionType, setSessionType] = useState("Virtual");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{
    skill?: string;
    date?: string;
    time?: string;
  }>({});

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!skillTopic) throw new Error("Please select a skill topic");
      if (!sessionDate) throw new Error("Please select a date");
      if (!sessionTime) throw new Error("Please select a time");

      const response = await fetch('/api/skill-swap/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          mentorId,
          skillTopic,
          sessionDate: format(sessionDate, 'yyyy-MM-dd'),
          sessionTime,
          duration: parseInt(duration),
          sessionType,
          message: message.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to book session');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Session Booked!",
        description: `Your session with ${mentorName} has been scheduled. ${
          sessionType === 'Virtual' && data.meetingLink
            ? 'Meeting link sent to your dashboard.'
            : ''
        }`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/skill-swap/my-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/skill-swap/matches'] });
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Book Session",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSkillTopic("");
    setSessionDate(undefined);
    setSessionTime("");
    setDuration("60");
    setSessionType("Virtual");
    setMessage("");
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!skillTopic) newErrors.skill = "Skill topic is required";
    if (!sessionDate) newErrors.date = "Date is required";
    if (!sessionTime) newErrors.time = "Time is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    bookMutation.mutate();
  };

  const handleClose = () => {
    if (bookMutation.isPending) return;
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Video className="w-5 h-5 text-primary" />
            <DialogTitle>Book Session with {mentorName}</DialogTitle>
          </div>
          <DialogDescription>
            Schedule a learning session
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="skillTopic">
              Skill Topic <span className="text-destructive">*</span>
            </Label>
            <Select value={skillTopic} onValueChange={(value) => {
              setSkillTopic(value);
              setErrors({ ...errors, skill: undefined });
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill to learn" />
              </SelectTrigger>
              <SelectContent>
                {skillsOffered.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.skill && (
              <p className="text-sm text-destructive">{errors.skill}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Session Date <span className="text-destructive">*</span>
            </Label>
            <Calendar
              mode="single"
              selected={sessionDate}
              onSelect={(date) => {
                setSessionDate(date);
                setErrors({ ...errors, date: undefined });
              }}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionTime">
              Session Time <span className="text-destructive">*</span>
            </Label>
            <Select value={sessionTime} onValueChange={(value) => {
              setSessionTime(value);
              setErrors({ ...errors, time: undefined });
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.time && (
              <p className="text-sm text-destructive">{errors.time}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <RadioGroup value={duration} onValueChange={setDuration}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30" id="30min" />
                <Label htmlFor="30min" className="font-normal cursor-pointer">30 minutes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="60" id="60min" />
                <Label htmlFor="60min" className="font-normal cursor-pointer">60 minutes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="90" id="90min" />
                <Label htmlFor="90min" className="font-normal cursor-pointer">90 minutes</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Session Type</Label>
            <RadioGroup value={sessionType} onValueChange={setSessionType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Virtual" id="virtual" />
                <Label htmlFor="virtual" className="font-normal cursor-pointer">Virtual</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="In-Person" id="in-person" />
                <Label htmlFor="in-person" className="font-normal cursor-pointer">In-Person</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Any specific topics or questions you'd like to cover?"
              className="min-h-[100px]"
              disabled={bookMutation.isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={bookMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={bookMutation.isPending}>
              {bookMutation.isPending ? "Booking..." : "Book Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
