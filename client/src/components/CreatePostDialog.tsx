import { useState } from "react";
import { useCreatePost } from "@/hooks/use-posts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MapPin, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  latitude: number;
  longitude: number;
}

export function CreatePostDialog({ open, onOpenChange, latitude, longitude }: CreatePostDialogProps) {
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const { mutate: createPost, isPending } = useCreatePost();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!content.trim() || !authorName.trim()) return;

    createPost(
      {
        content,
        authorName,
        latitude,
        longitude,
      },
      {
        onSuccess: () => {
          toast({
            title: "Post created!",
            description: "Your message has been dropped at this location.",
          });
          setContent("");
          onOpenChange(false);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-6 gap-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-display">Drop a Message</DialogTitle>
          </div>
          <DialogDescription>
            Share something with people near this location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Your Name</label>
            <Input
              placeholder="Display Name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Message</label>
            <Textarea
              placeholder="What's happening here?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none h-32 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <MapPin className="h-3 w-3" />
            <span>Posting at {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!content.trim() || !authorName.trim() || isPending}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Drop Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
