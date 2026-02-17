import { Button } from "@/components/ui/button";
import { Compass, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
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
          <h1 className="text-2xl font-bold font-display mb-2" data-testid="text-terms-title">Terms of Service</h1>
          <p className="text-xs text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
              <p>By accessing or using Social Go ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">2. Eligibility</h2>
              <p>You must be at least 18 years old to use Social Go. By creating an account, you represent and warrant that you are at least 18 years of age. We reserve the right to terminate accounts of users found to be under 18.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">3. Account Responsibilities</h2>
              <p className="mb-2">When you create an account, you agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activity under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">4. Acceptable Use</h2>
              <p className="mb-2">You agree not to use Social Go to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Harass, threaten, bully, or intimidate other users</li>
                <li>Post illegal, harmful, defamatory, or offensive content</li>
                <li>Impersonate any person or entity</li>
                <li>Stalk or track the location of other users outside the app</li>
                <li>Share other users' location information with third parties</li>
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to circumvent safety features or security measures</li>
                <li>Create multiple accounts or use automated tools to access the service</li>
                <li>Solicit personal information from minors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">5. Location Services</h2>
              <p>Social Go uses location data to provide its core features. By using Go Mode, you consent to sharing your approximate location with other users. Your exact location is never shared — we apply a ~300-meter offset for your safety. Go Mode expires automatically after 2 hours and can be disabled at any time.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">6. User Content</h2>
              <p>You retain ownership of content you post on Social Go. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to display, distribute, and store your content as part of the Service. You are solely responsible for the content you post and must ensure it complies with these Terms and applicable laws.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">7. Paid Features</h2>
              <p className="mb-2">Social Go offers optional paid features including subscriptions (Go+, Go Premium), boosts, shoutouts, and tokens. By purchasing these features:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>All payments are processed securely through Stripe</li>
                <li>Subscription fees are billed on a recurring basis as selected</li>
                <li>You may cancel subscriptions at any time through your billing portal</li>
                <li>Refunds are handled according to our refund policy</li>
                <li>One-time purchases (boosts, shoutouts, tokens) are non-refundable once used</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">8. Safety & Moderation</h2>
              <p>We take user safety seriously. We reserve the right to remove content, suspend, or terminate accounts that violate these Terms. Users can block and report other users at any time. We review reports and take appropriate action, which may include warnings, temporary suspensions, or permanent bans.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">9. Disclaimer of Warranties</h2>
              <p>Social Go is provided "as is" without warranties of any kind. We do not guarantee the accuracy of location data, the behavior of other users, or uninterrupted access to the Service. You use Social Go at your own risk and are responsible for your own safety when meeting people in person.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">10. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, Social Go and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to personal harm resulting from interactions with other users.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">11. Termination</h2>
              <p>We may suspend or terminate your account at any time for violations of these Terms. You may delete your account at any time. Upon termination, your right to use the Service will immediately cease.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">12. Changes to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. We will notify users of material changes. Your continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">13. Contact</h2>
              <p>For questions about these Terms, contact us at <a href="mailto:support@socialgoapp.com" className="text-primary">support@socialgoapp.com</a>.</p>
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
