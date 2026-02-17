
import React, { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, Settings, LogOut, Shield, Instagram, Twitter, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

export default function Profile() {
  const { toast } = useToast();
  const { data: user, isLoading } = useQuery<any>({
    queryKey: [api.users.me.path],
  });

  const form = useForm({
    defaultValues: {
      bio: user?.bio || "",
      instagram: user?.instagram || "",
      twitter: user?.twitter || "",
      website: user?.website || "",
    },
  });

  // Update form when user data loads
  React.useEffect(() => {
    if (user) {
      form.reset({
        bio: user.bio || "",
        instagram: user.instagram || "",
        twitter: user.twitter || "",
        website: user.website || "",
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.users.updateStatus.path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
      toast({ title: "Profile updated" });
    },
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
        <div className="text-center w-full max-w-sm">
          <h2 className="text-2xl font-bold">{user?.username}</h2>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider">Social Links & Bio</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us about yourself" className="resize-none" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-500" /> Instagram Username
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-sky-500" /> Twitter Username
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" /> Website URL
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={updateProfileMutation.isPending}>
                Save Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">Account Settings</h3>
        <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
