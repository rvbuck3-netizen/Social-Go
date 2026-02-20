import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MapPin, Clock, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type QuestCategory = "Fitness" | "Dining" | "Sports" | "Study" | "Social" | "Other";

interface Quest {
  id: number;
  title: string;
  description: string;
  category: QuestCategory;
  authorName: string;
  distance: number;
  scheduledFor: string;
  responses: number;
  interestedCount: number;
}

const MOCK_QUESTS: Quest[] = [
  {
    id: 1,
    title: "Gym partner at 6PM",
    description: "Looking for someone to hit the gym with today. Let's do chest and triceps!",
    category: "Fitness",
    authorName: "Alex",
    distance: 0.3,
    scheduledFor: "Today 6:00 PM",
    responses: 3,
    interestedCount: 2,
  },
  {
    id: 2,
    title: "Trying new sushi spot",
    description: "Found this amazing sushi place downtown. Who wants to join for dinner?",
    category: "Dining",
    authorName: "Jordan",
    distance: 0.5,
    scheduledFor: "Today 7:00 PM",
    responses: 2,
    interestedCount: 4,
  },
  {
    id: 3,
    title: "Pickup basketball",
    description: "Playing at the court near the park. Need 2 more players!",
    category: "Sports",
    authorName: "Sam",
    distance: 1.2,
    scheduledFor: "Today 5:00 PM",
    responses: 4,
    interestedCount: 1,
  },
  {
    id: 4,
    title: "Study sprint 2 hours",
    description: "Let's study together at the cafe. Good vibes, focus mode!",
    category: "Study",
    authorName: "Taylor",
    distance: 0.8,
    scheduledFor: "Today 4:00 PM",
    responses: 1,
    interestedCount: 3,
  },
];

const categoryIcons: Record<QuestCategory, string> = {
  Fitness: "💪",
  Dining: "🍜",
  Sports: "⚽",
  Study: "📚",
  Social: "🎉",
  Other: "✨",
};

const categoryColors: Record<QuestCategory, string> = {
  Fitness: "bg-red-100 text-red-700",
  Dining: "bg-orange-100 text-orange-700",
  Sports: "bg-blue-100 text-blue-700",
  Study: "bg-purple-100 text-purple-700",
  Social: "bg-pink-100 text-pink-700",
  Other: "bg-gray-100 text-gray-700",
};

export default function Quests() {
  const { user } = useAuth();
  const [showCreateQuest, setShowCreateQuest] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 border-b border-border/40 glass">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quests</h1>
            <p className="text-sm text-muted-foreground">Find activities around you</p>
          </div>
          <Button onClick={() => setShowCreateQuest(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Quest
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <Tabs defaultValue="nearby" className="w-full">
          <TabsList className="sticky top-16 z-10 w-full justify-start rounded-none border-b bg-background/50 backdrop-blur">
            <TabsTrigger value="nearby">Nearby</TabsTrigger>
            <TabsTrigger value="interested">Interested</TabsTrigger>
            <TabsTrigger value="my-quests">My Quests</TabsTrigger>
          </TabsList>

          <TabsContent value="nearby" className="space-y-3 p-4">
            {MOCK_QUESTS.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </TabsContent>

          <TabsContent value="interested" className="space-y-3 p-4">
            {MOCK_QUESTS.slice(1, 3).map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </TabsContent>

          <TabsContent value="my-quests" className="space-y-3 p-4">
            {MOCK_QUESTS.slice(0, 2).map((quest) => (
              <QuestCard key={quest.id} quest={quest} isOwner />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function QuestCard({ quest, isOwner }: { quest: Quest; isOwner?: boolean }) {
  return (
    <Card className="p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{categoryIcons[quest.category]}</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${categoryColors[quest.category]}`}>
              {quest.category}
            </span>
          </div>
          <h3 className="font-bold text-lg">{quest.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{quest.description}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{quest.distance} miles away</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{quest.scheduledFor}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{quest.responses} joined</span>
        </div>
      </div>

      <div className="pt-2 flex gap-2">
        <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
          Join
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          Interested
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          Chat
        </Button>
      </div>

      {isOwner && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">You posted this quest</p>
        </div>
      )}
    </Card>
  );
}
