import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, TrendingUp, Target } from "lucide-react";

type GoalCategory = "Fitness" | "Business" | "Learning" | "Mental health" | "Creative";

interface Goal {
  id: number;
  category: GoalCategory;
  description: string;
  currentStreak: number;
  bestStreak: number;
  circleMembers: number;
}

interface Circle {
  id: number;
  name: string;
  category: GoalCategory;
  members: number;
  maxMembers: number;
  yourRole: "member" | "creator";
}

const goalIcons: Record<GoalCategory, string> = {
  Fitness: "💪",
  Business: "💼",
  Learning: "🎓",
  "Mental health": "🧠",
  Creative: "🎨",
};

const MOCK_GOALS: Goal[] = [
  {
    id: 1,
    category: "Fitness",
    description: "Gym 5x/week",
    currentStreak: 7,
    bestStreak: 21,
    circleMembers: 3,
  },
  {
    id: 2,
    category: "Learning",
    description: "Learn Spanish daily",
    currentStreak: 14,
    bestStreak: 14,
    circleMembers: 2,
  },
];

const MOCK_CIRCLES: Circle[] = [
  {
    id: 1,
    name: "Morning Gym Crew",
    category: "Fitness",
    members: 4,
    maxMembers: 5,
    yourRole: "member",
  },
  {
    id: 2,
    name: "Language Learning Buddies",
    category: "Learning",
    members: 3,
    maxMembers: 5,
    yourRole: "creator",
  },
];

export function AccountabilityMode() {
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Accountability Mode
        </h3>
        <p className="text-sm text-muted-foreground">
          Set goals and get matched with accountability partners
        </p>
      </div>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="goals">My Goals</TabsTrigger>
          <TabsTrigger value="circles">Circles</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4 mt-4">
          <Button onClick={() => setShowCreateGoal(true)} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add New Goal
          </Button>

          {MOCK_GOALS.map((goal) => (
            <Card key={goal.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{goalIcons[goal.category]}</span>
                  <div>
                    <Badge className="mb-2">{goal.category}</Badge>
                    <p className="font-semibold">{goal.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-primary">{goal.currentStreak}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Best Streak</p>
                  <p className="text-2xl font-bold">{goal.bestStreak}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Circle Size</p>
                  <p className="text-2xl font-bold">{goal.circleMembers}</p>
                </div>
              </div>

              <Button variant="outline" className="w-full" size="sm">
                Check In Today
              </Button>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="circles" className="space-y-4 mt-4">
          <Button className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Create Circle
          </Button>

          {MOCK_CIRCLES.map((circle) => (
            <Card key={circle.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="mb-2" variant="secondary">
                    {circle.category}
                  </Badge>
                  <h4 className="font-bold">{circle.name}</h4>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {circle.members}/{circle.maxMembers} members
                    </span>
                  </div>
                </div>
                <Badge variant={circle.yourRole === "creator" ? "default" : "secondary"}>
                  {circle.yourRole === "creator" ? "Creator" : "Member"}
                </Badge>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full" size="sm">
                  View Circle
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Check-ins
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
