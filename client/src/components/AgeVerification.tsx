import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Compass } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { api } from "@shared/routes";

export default function AgeVerification() {
  const [declined, setDeclined] = useState(false);

  const verifyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/verify-age', { confirmed: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
    },
  });

  if (declined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <Card className="max-w-sm w-full p-6 text-center">
          <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-bold font-display mb-2">Access Restricted</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Social Go is only available to users who are 18 years of age or older. You must confirm your age to continue.
          </p>
          <Button variant="outline" onClick={() => setDeclined(false)} data-testid="button-try-again">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <Card className="max-w-sm w-full p-6 text-center">
        <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center mx-auto mb-4">
          <Compass className="h-5 w-5 text-primary-foreground" />
        </div>
        <h2 className="text-lg font-bold font-display mb-2">Welcome to Social Go</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Social Go is a location-based social platform for adults. You must be at least 18 years old to use this service.
        </p>
        <div className="space-y-2.5">
          <Button
            className="w-full"
            onClick={() => verifyMutation.mutate()}
            disabled={verifyMutation.isPending}
            data-testid="button-confirm-age"
          >
            {verifyMutation.isPending ? "Confirming..." : "I am 18 or older"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setDeclined(true)}
            data-testid="button-decline-age"
          >
            I am under 18
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-4">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-primary">Terms of Service</a>
          {" "}and{" "}
          <a href="/privacy" className="text-primary">Privacy Policy</a>.
        </p>
      </Card>
    </div>
  );
}
