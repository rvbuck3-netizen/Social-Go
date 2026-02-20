import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map as MapIcon, Radio, X } from "lucide-react";

type Vibe = "Gym" | "Chill" | "Work" | "Social";
type Intent = "Meet" | "Talk" | "Just around";

const vibes: Record<Vibe, { emoji: string; color: string }> = {
  Gym: { emoji: "💪", color: "bg-red-100 text-red-700" },
  Chill: { emoji: "😌", color: "bg-green-100 text-green-700" },
  Work: { emoji: "💼", color: "bg-blue-100 text-blue-700" },
  Social: { emoji: "🎉", color: "bg-pink-100 text-pink-700" },
};

const intents: Record<Intent, { emoji: string; color: string }> = {
  Meet: { emoji: "👋", color: "bg-purple-100 text-purple-700" },
  Talk: { emoji: "💬", color: "bg-cyan-100 text-cyan-700" },
  "Just around": { emoji: "🚶", color: "bg-amber-100 text-amber-700" },
};

interface GoModeState {
  isActive: boolean;
  vibe: Vibe | null;
  intent: Intent | null;
  distance: number;
}

export function UpgradedGoMode({
  isActive,
  onToggle,
}: {
  isActive: boolean;
  onToggle: (state: GoModeState) => void;
}) {
  const [goPanelOpen, setGoPanelOpen] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);

  const handleActivateGoMode = () => {
    if (selectedVibe && selectedIntent) {
      onToggle({
        isActive: true,
        vibe: selectedVibe,
        intent: selectedIntent,
        distance: 25,
      });
      setGoPanelOpen(false);
    }
  };

  const handleDeactivateGoMode = () => {
    onToggle({
      isActive: false,
      vibe: null,
      intent: null,
      distance: 25,
    });
    setSelectedVibe(null);
    setSelectedIntent(null);
  };

  if (isActive && selectedVibe && selectedIntent) {
    return (
      <div className="space-y-4">
        <Card className="p-4 space-y-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-primary rounded-full animate-pulse" />
              <h3 className="font-bold">Go Mode Active</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeactivateGoMode}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Your Vibe</p>
              <Badge className={vibes[selectedVibe].color}>
                <span className="mr-2">{vibes[selectedVibe].emoji}</span>
                {selectedVibe}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Your Intent</p>
              <Badge className={intents[selectedIntent].color}>
                <span className="mr-2">{intents[selectedIntent].emoji}</span>
                {selectedIntent}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Visible Nearby</p>
              <p className="text-sm font-semibold">Within 25 miles</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setGoPanelOpen(true)}
          >
            Edit Go Mode
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        {!goPanelOpen ? (
          <>
            <div className="flex items-center gap-3">
              <Radio className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-bold">Go Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Let people nearby know what's up
                </p>
              </div>
            </div>
            <Button
              onClick={() => setGoPanelOpen(true)}
              className="w-full"
            >
              Activate Go Mode
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <h4 className="font-bold">Set Your Vibe</h4>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(vibes) as Vibe[]).map((vibe) => (
                <button
                  key={vibe}
                  onClick={() => setSelectedVibe(vibe)}
                  className={`p-3 rounded-lg border-2 transition ${
                    selectedVibe === vibe
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{vibes[vibe].emoji}</div>
                  <div className="text-xs font-semibold">{vibe}</div>
                </button>
              ))}
            </div>

            <h4 className="font-bold mt-4">Set Your Intent</h4>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(intents) as Intent[]).map((intent) => (
                <button
                  key={intent}
                  onClick={() => setSelectedIntent(intent)}
                  className={`p-3 rounded-lg border-2 transition ${
                    selectedIntent === intent
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{intents[intent].emoji}</div>
                  <div className="text-[11px] font-semibold">{intent}</div>
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <Button
                onClick={handleActivateGoMode}
                disabled={!selectedVibe || !selectedIntent}
                className="w-full"
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Go Live
              </Button>
              <Button
                variant="outline"
                onClick={() => setGoPanelOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
