import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { api } from "@shared/routes";
import {
  Compass, Music, Coffee, Gamepad2, BookOpen, Dumbbell, Plane,
  UtensilsCrossed, Camera, Palette, ArrowRight, MapPin, Zap, Users, Sparkles, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

const interestOptions = [
  { id: "food", label: "Food", icon: UtensilsCrossed },
  { id: "music", label: "Music", icon: Music },
  { id: "coffee", label: "Coffee", icon: Coffee },
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "art", label: "Art", icon: Palette },
  { id: "nightlife", label: "Nightlife", icon: Sparkles },
  { id: "social", label: "Social", icon: Heart },
  { id: "outdoors", label: "Outdoors", icon: Compass },
];

const radiusOptions = [
  { value: 5, label: "5 mi", desc: "Walking distance" },
  { value: 15, label: "15 mi", desc: "Nearby areas" },
  { value: 25, label: "25 mi", desc: "City-wide" },
  { value: 50, label: "50 mi", desc: "Region" },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedRadius, setSelectedRadius] = useState(25);
  const [referralCode, setReferralCode] = useState("");

  const completeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/onboarding/complete', {
        interests: selectedInterests,
        locationRadius: selectedRadius,
        referralCode: referralCode || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
    },
    onError: () => {
      alert("Something went wrong completing setup. Please try again.");
    },
  });

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const steps = [
    {
      title: "What are you into?",
      subtitle: "Pick your interests to see relevant content nearby",
      content: (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {interestOptions.map((interest) => {
            const isSelected = selectedInterests.includes(interest.id);
            return (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-md border transition-colors",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover-elevate"
                )}
                data-testid={`button-interest-${interest.id}`}
              >
                <interest.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{interest.label}</span>
              </button>
            );
          })}
        </div>
      ),
      canProceed: selectedInterests.length >= 1,
    },
    {
      title: "How far do you want to see?",
      subtitle: "Set your discovery radius for nearby content",
      content: (
        <div className="space-y-2.5 mt-4">
          {radiusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedRadius(option.value)}
              className={cn(
                "w-full flex items-center gap-3 p-3.5 rounded-md border transition-colors text-left",
                selectedRadius === option.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover-elevate"
              )}
              data-testid={`button-radius-${option.value}`}
            >
              <MapPin className={cn("h-4 w-4", selectedRadius === option.value ? "text-primary" : "text-muted-foreground")} />
              <div className="flex-1">
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.desc}</p>
              </div>
            </button>
          ))}
        </div>
      ),
      canProceed: true,
    },
    {
      title: "Got a referral code?",
      subtitle: "Enter a friend's code to both earn bonus XP",
      content: (
        <div className="mt-4 space-y-4">
          <Input
            placeholder="e.g. SG-A1B2-C3D4"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            className="text-center text-sm font-mono"
            data-testid="input-referral-code"
          />
          <Card className="p-3.5 bg-muted/50">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium">Invite friends later</p>
                <p className="text-[11px] text-muted-foreground">Get your own referral code after setup and earn 100 XP per friend</p>
              </div>
            </div>
          </Card>
        </div>
      ),
      canProceed: true,
    },
    {
      title: "You're all set!",
      subtitle: "Start exploring and earn your first XP",
      content: (
        <div className="mt-4 space-y-3">
          <Card className="p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-medium">+25 XP for completing setup</p>
                <p className="text-[11px] text-muted-foreground">Your first experience points!</p>
              </div>
            </div>
          </Card>
          <Card className="p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                <Compass className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-medium">First task: Drop a post</p>
                <p className="text-[11px] text-muted-foreground">Earn 15 XP by posting something nearby</p>
              </div>
            </div>
          </Card>
          <Card className="p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-medium">Daily streaks = more XP</p>
                <p className="text-[11px] text-muted-foreground">Log in daily to build your streak</p>
              </div>
            </div>
          </Card>
        </div>
      ),
      canProceed: true,
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="max-w-sm w-full">
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-muted"
              )}
            />
          ))}
        </div>

        <div className="text-center mb-2">
          <h2 className="text-lg font-bold font-display">{current.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{current.subtitle}</p>
        </div>

        {current.content}

        <div className="flex gap-2 mt-6">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1" data-testid="button-onboarding-back">
              Back
            </Button>
          )}
          <Button
            onClick={() => {
              if (isLast) {
                completeMutation.mutate();
              } else {
                setStep(step + 1);
              }
            }}
            disabled={!current.canProceed || completeMutation.isPending}
            className="flex-1"
            data-testid="button-onboarding-next"
          >
            {completeMutation.isPending ? "Setting up..." : isLast ? "Let's Go" : "Continue"}
            {!isLast && <ArrowRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>

        {step === 0 && (
          <button
            onClick={() => {
              setStep(steps.length - 1);
            }}
            className="w-full text-center text-xs text-muted-foreground mt-3"
            data-testid="button-skip-onboarding"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
