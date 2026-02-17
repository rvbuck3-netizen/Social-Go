import { Button } from "@/components/ui/button";
import { Compass, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="flex items-center justify-between gap-2 px-5 py-3.5 max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Compass className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold tracking-tight font-display">Social Go</span>
          </div>
          <Link href="/">
            <Button size="sm" variant="outline" className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-5 py-10">
        <div className="max-w-2xl mx-auto prose-sm">
          <h1 className="text-2xl font-bold font-display mb-2" data-testid="text-privacy-title">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">1. Information We Collect</h2>
              <p className="mb-2">When you use Social Go, we collect the following types of information:</p>
              <p className="mb-1"><span className="font-medium text-foreground">Account Information:</span> When you sign up, we collect your name, email address, and profile photo from your authentication provider (Google, GitHub, Apple, or email).</p>
              <p className="mb-1"><span className="font-medium text-foreground">Location Data:</span> When you activate Go Mode, we collect your approximate location. We never store or share your exact coordinates — we apply a ~300-meter random offset before displaying your location to other users.</p>
              <p className="mb-1"><span className="font-medium text-foreground">Profile Information:</span> Any information you voluntarily add to your profile, including bio, social media links, and avatar.</p>
              <p><span className="font-medium text-foreground">Usage Data:</span> We collect information about how you use the app, including posts you create, interactions, and session data.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
              <p className="mb-2">We use your information to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide and maintain the Social Go service</li>
                <li>Display your approximate location to nearby users when Go Mode is active</li>
                <li>Show your posts and profile to other users</li>
                <li>Process payments for premium features and subscriptions</li>
                <li>Send important service updates and notifications</li>
                <li>Improve our service and develop new features</li>
                <li>Enforce our Terms of Service and ensure user safety</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">3. Location Privacy</h2>
              <p>Your privacy is our top priority. Social Go implements several safety measures for location data:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Your exact GPS coordinates are never shown to other users</li>
                <li>We apply a ~300-meter random offset to your location before sharing</li>
                <li>Go Mode automatically expires after 2 hours</li>
                <li>You can disable Go Mode at any time to stop sharing your location</li>
                <li>Location data is only collected when you explicitly activate Go Mode</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">4. Data Sharing</h2>
              <p>We do not sell your personal information. We may share your data with:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><span className="font-medium text-foreground">Other users:</span> Your profile, posts, and approximate location (when Go Mode is active) are visible to other users</li>
                <li><span className="font-medium text-foreground">Payment processors:</span> We use Stripe to process payments securely. We do not store your payment card details</li>
                <li><span className="font-medium text-foreground">Service providers:</span> We may share data with providers who help us operate our service (hosting, analytics)</li>
                <li><span className="font-medium text-foreground">Legal requirements:</span> We may disclose information if required by law or to protect safety</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">5. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your data, including encrypted connections (HTTPS/TLS), secure authentication, and regular security reviews. However, no method of transmission over the internet is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">6. Your Rights</h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access, update, or delete your account information</li>
                <li>Disable location sharing at any time</li>
                <li>Block other users from viewing your profile</li>
                <li>Request a copy of your data</li>
                <li>Delete your account and all associated data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">7. Age Requirement</h2>
              <p>Social Go is intended for users who are 18 years of age or older. We do not knowingly collect information from anyone under the age of 18. If we learn that we have collected data from someone under 18, we will promptly delete that information.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">8. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">9. Contact Us</h2>
              <p>If you have questions about this Privacy Policy or your data, contact us at <a href="mailto:support@socialgoapp.com" className="text-primary">support@socialgoapp.com</a>.</p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t bg-muted/30 py-4 text-center">
        <p className="text-[11px] text-muted-foreground">{new Date().getFullYear()} Social Go. All rights reserved.</p>
      </footer>
    </div>
  );
}
