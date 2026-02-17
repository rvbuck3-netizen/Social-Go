
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, Settings, LogOut, Shield } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const { data: user, isLoading } = useQuery<any>({
    queryKey: [api.users.me.path],
  });

  const goModeMutation = useMutation({
    mutationFn: async (isGoMode: boolean) => {
      const res = await fetch(api.users.updateStatus.path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isGoMode }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
      toast({
        title: "Go Mode Updated",
        description: "Your visibility status has been changed.",
      });
    },
  });

  if (isLoading) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="p-4 pb-20 space-y-6 h-full overflow-y-auto">
      <div className="flex flex-col items-center py-6 space-y-4">
        <Avatar className="h-24 w-24 border-4 border-primary/10">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{user?.username}</h2>
          <p className="text-muted-foreground text-sm">{user?.bio}</p>
        </div>
      </div>

      <Card className="border-none bg-accent/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Go Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Make your location visible to others nearby
              </p>
            </div>
            <Switch 
              checked={user?.isGoMode} 
              onCheckedChange={(checked) => goModeMutation.mutate(checked)}
              disabled={goModeMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">Account Settings</h3>
        <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-foreground">
          <Settings className="h-5 w-5 text-muted-foreground" />
          General Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
