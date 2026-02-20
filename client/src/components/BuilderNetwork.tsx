import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  ExternalLink,
  Zap,
  Users,
  Filter,
  Star,
} from "lucide-react";

type BuilderCategory =
  | "SaaS"
  | "Creator"
  | "Freelancer"
  | "Investor"
  | "Mentor"
  | "Partner";

const categoryEmoji: Record<BuilderCategory, string> = {
  SaaS: "🚀",
  Creator: "🎬",
  Freelancer: "💻",
  Investor: "💰",
  Mentor: "🧠",
  Partner: "🤝",
};

interface Builder {
  id: string;
  name: string;
  category: BuilderCategory;
  headline: string;
  distance: number;
  seeking: string[];
  offering: string[];
  rating: number;
  reviews: number;
  isNearby: boolean;
}

const mockBuilders: Builder[] = [
  {
    id: "1",
    name: "Alex Chen",
    category: "SaaS",
    headline: "Building an AI writing assistant",
    distance: 3.2,
    seeking: ["Product Designer", "DevOps Help", "Early Customers"],
    offering: ["Growth Strategy", "Technical Advice"],
    rating: 4.8,
    reviews: 12,
    isNearby: true,
  },
  {
    id: "2",
    name: "Maya Patel",
    category: "Creator",
    headline: "YouTube channel with 50k subscribers",
    distance: 5.1,
    seeking: ["Video Editor", "Sponsorship Deals"],
    offering: ["Creator Tips", "Audience Access"],
    rating: 4.9,
    reviews: 8,
    isNearby: true,
  },
  {
    id: "3",
    name: "James Wilson",
    category: "Investor",
    headline: "Angel investor in fintech & biotech",
    distance: 12.5,
    seeking: ["Interesting pitches"],
    offering: ["Funding", "Network Introductions"],
    rating: 4.7,
    reviews: 15,
    isNearby: true,
  },
  {
    id: "4",
    name: "Sofia Rodriguez",
    category: "Freelancer",
    headline: "Full-stack developer, 10+ years experience",
    distance: 2.8,
    seeking: ["Long-term contracts", "Equity deals"],
    offering: ["Development", "Technical mentoring"],
    rating: 5.0,
    reviews: 22,
    isNearby: true,
  },
];

export function BuilderNetwork() {
  const [selectedCategory, setSelectedCategory] = useState<BuilderCategory | "All">("All");
  const [selectedBuilder, setSelectedBuilder] = useState<Builder | null>(null);

  const filteredBuilders =
    selectedCategory === "All"
      ? mockBuilders
      : mockBuilders.filter((b) => b.category === selectedCategory);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-2">Builder Network</h1>
        <p className="text-sm text-muted-foreground">
          Connect with founders, creators, and investors nearby
        </p>
      </div>

      {!selectedBuilder ? (
        <>
          {/* Filter Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2">
            <Button
              variant={selectedCategory === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("All")}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              All
            </Button>
            {(Object.keys(categoryEmoji) as BuilderCategory[]).map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap"
              >
                {categoryEmoji[cat]} {cat}
              </Button>
            ))}
          </div>

          {/* Builders Grid */}
          <div className="space-y-3">
            {filteredBuilders.map((builder) => (
              <Card
                key={builder.id}
                className="p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => setSelectedBuilder(builder)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl font-bold"
                    >
                      {categoryEmoji[builder.category]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{builder.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {builder.distance}mi
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {builder.headline}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold">
                          {builder.rating}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({builder.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-2">
                      Seeking
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {builder.seeking.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-2">
                      Offering
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {builder.offering.map((o) => (
                        <Badge
                          key={o}
                          className="text-xs bg-green-100 text-green-700 border-green-200"
                        >
                          {o}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        /* Builder Profile */
        <Card className="p-6 space-y-6">
          <Button
            variant="ghost"
            className="w-fit mb-2"
            onClick={() => setSelectedBuilder(null)}
          >
            ← Back
          </Button>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-4xl">
                {categoryEmoji[selectedBuilder.category]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{selectedBuilder.name}</h2>
                  <Badge>{categoryEmoji[selectedBuilder.category]} {selectedBuilder.category}</Badge>
                </div>
                <p className="text-muted-foreground mb-3">
                  {selectedBuilder.headline}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{selectedBuilder.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({selectedBuilder.reviews} reviews)
                  </span>
                  <Badge variant="outline">{selectedBuilder.distance}mi away</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold mb-2">Seeking</p>
                <ul className="space-y-1">
                  {selectedBuilder.seeking.map((s) => (
                    <li key={s} className="text-sm">
                      <Badge variant="outline">{s}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-bold mb-2">Offering</p>
                <ul className="space-y-1">
                  {selectedBuilder.offering.map((o) => (
                    <li key={o} className="text-sm">
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {o}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700">
                <Zap className="h-4 w-4 inline mr-2" />
                Great match! They're 2.8 miles away and looking for similar things.
              </p>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="flex-1">
                <Users className="h-4 w-4 mr-2" />
                Introduce via Platform
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
