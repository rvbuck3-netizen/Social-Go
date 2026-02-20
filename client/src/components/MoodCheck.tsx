import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, Eye } from "lucide-react";

type Mood = "motivated" | "chill" | "stressed" | "want_to_talk";

interface MoodOption {
  emoji: string;
  label: string;
  color: string;
  description: string;
}

const moods: Record<Mood, MoodOption> = {
  motivated: {
    emoji: "🔥",
    label: "Motivated",
    color: "bg-orange-100 text-orange-700",
    description: "Ready to crush goals",
  },
  chill: {
    emoji: "😌",
    label: "Chill",
    color: "bg-green-100 text-green-700",
    description: "Just vibing",
  },
  stressed: {
    emoji: "😰",
    label: "Stressed",
    color: "bg-red-100 text-red-700",
    description: "Could use support",
  },
  want_to_talk: {
    emoji: "💬",
    label: "Want to Talk",
    color: "bg-blue-100 text-blue-700",
    description: "Open for conversation",
  },
};

interface MoodCheckIn {
  userId: string;
  userName: string;
  mood: Mood;
  distance: number;
  timestamp: Date;
}

const mockNearbyMoods: MoodCheckIn[] = [
  {
    userId: "1",
    userName: "Jordan",
    mood: "motivated",
    distance: 0.5,
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    userId: "2",
    userName: "Casey",
    mood: "want_to_talk",
    distance: 1.2,
    timestamp: new Date(Date.now() - 15 * 60000),
  },
  {
    userId: "3",
    userName: "Morgan",
    mood: "chill",
    distance: 2.1,
    timestamp: new Date(Date.now() - 25 * 60000),
  },
  {
    userId: "4",
    userName: "Taylor",
    mood: "stressed",
    distance: 1.8,
    timestamp: new Date(Date.now() - 35 * 60000),
  },
];

export function MoodCheck() {
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckIn = async (mood: Mood) => {
    setSelectedMood(mood);
    setShowCheckInDialog(true);
  };

  const handleConfirmCheckIn = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCurrentMood(selectedMood);
    setShowCheckInDialog(false);
    setIsSubmitting(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Current Mood Check-In */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Mood Check</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Share how you're feeling and connect with others nearby
        </p>

        {!currentMood ? (
          <Card className="p-6 space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="text-center">
              <h3 className="font-bold text-lg mb-2">How are you feeling?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Your mood will be visible to people nearby for 2 hours
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(moods) as Mood[]).map((mood) => (
                <button
                  key={mood}
                  onClick={() => handleCheckIn(mood)}
                  className={`p-4 rounded-xl border-2 transition transform hover:scale-105 ${moods[mood].color} border-transparent`}
                >
                  <div className="text-3xl mb-2">{moods[mood].emoji}</div>
                  <div className="font-semibold text-sm">{moods[mood].label}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {moods[mood].description}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-4 space-y-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Current Mood</p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">
                    {moods[currentMood].emoji}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{moods[currentMood].label}</p>
                    <p className="text-sm text-muted-foreground">
                      {moods[currentMood].description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end mb-2 text-xs text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  Visible 2h
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentMood(null);
                    setSelectedMood(null);
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Nearby Moods */}
      <div>
        <h2 className="text-xl font-bold mb-4">People Nearby Feeling</h2>
        <div className="space-y-3">
          {mockNearbyMoods.map((moodCheck) => (
            <Card
              key={moodCheck.userId}
              className="p-4 hover:shadow-md transition hover:bg-muted/50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    {moods[moodCheck.mood].emoji}
                  </div>
                  <div>
                    <p className="font-bold">{moodCheck.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {moods[moodCheck.mood].label} •{" "}
                      {formatTime(moodCheck.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="secondary">{moodCheck.distance}mi</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Support
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Check-in Confirmation Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Check in to Mood</DialogTitle>
            <DialogDescription>
              Your mood will be visible to people within 25 miles for the next
              2 hours
            </DialogDescription>
          </DialogHeader>

          {selectedMood && (
            <div className="space-y-4 py-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-5xl mb-2">{moods[selectedMood].emoji}</div>
                <p className="text-lg font-bold">{moods[selectedMood].label}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {moods[selectedMood].description}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visibility</span>
                  <span className="font-semibold">25 miles radius</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-semibold">2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notifications</span>
                  <span className="font-semibold">On</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckInDialog(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmCheckIn}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Checking in..." : "Confirm"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
