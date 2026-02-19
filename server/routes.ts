
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { seedDatabase } from "./seed";
import { db } from "./db";
import { profiles } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  await seedDatabase();

  app.get(api.users.me.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    let profile = await storage.getProfile(userId);
    if (!profile) {
      const claims = req.user.claims;
      const username = claims.first_name || claims.email?.split('@')[0] || `user_${userId.slice(0, 8)}`;
      profile = await storage.createProfile(userId, username, claims.profile_image_url);
      await db.update(profiles)
        .set({ isFoundingMember: true })
        .where(eq(profiles.userId, userId));
      profile = await storage.getProfile(userId);
    }
    await storage.checkAndAwardLoginStreak(userId);
    const updatedProfile = await storage.getProfile(userId);

    res.json({
      ...updatedProfile,
      avatar: updatedProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${updatedProfile?.username}`
    });
  });

  app.post('/api/verify-age', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { confirmed } = req.body;
      if (!confirmed) {
        return res.status(400).json({ error: 'Age verification required' });
      }
      await db.update(profiles)
        .set({ ageVerified: true })
        .where(eq(profiles.userId, userId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify age' });
    }
  });

  // === Gamification Routes ===

  app.get('/api/gamification/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      const userBadges = await storage.getUserBadges(userId);
      const challengeProgress = await storage.getUserChallengeProgress(userId);
      const recentXp = await storage.getXpEvents(userId, 10);

      const xpForNextLevel = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 9000, Infinity];
      const currentLevelXp = xpForNextLevel[profile.level - 1] || 0;
      const nextLevelXp = xpForNextLevel[profile.level] || profile.xp;
      const progressPercent = nextLevelXp === Infinity ? 100 :
        Math.round(((profile.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100);

      res.json({
        xp: profile.xp,
        level: profile.level,
        streakCount: profile.streakCount,
        nextLevelXp,
        currentLevelXp,
        progressPercent,
        badges: userBadges.map(ub => ub.badge),
        challenges: challengeProgress,
        recentXp,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to load gamification data' });
    }
  });

  app.get('/api/badges', async (_req, res) => {
    const allBadges = await storage.getBadges();
    res.json(allBadges);
  });

  app.get('/api/challenges', async (_req, res) => {
    const active = await storage.getActiveChallenges();
    res.json(active);
  });

  app.post('/api/challenges/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { challengeId } = req.body;
      if (!challengeId) return res.status(400).json({ error: 'challengeId required' });
      const progress = await storage.joinChallenge(userId, challengeId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: 'Failed to join challenge' });
    }
  });

  app.get('/api/leaderboard', async (_req, res) => {
    const leaders = await storage.getLeaderboard(20);
    res.json(leaders);
  });

  app.post('/api/onboarding/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { interests, locationRadius, referralCode: usedReferralCode } = req.body;

      await db.update(profiles).set({
        onboardingCompleted: true,
        interests: interests || [],
        locationRadius: locationRadius || 25,
      }).where(eq(profiles.userId, userId));

      const code = `SG-${userId.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      await db.update(profiles).set({ referralCode: code }).where(eq(profiles.userId, userId));

      await storage.awardXp(userId, 'onboarding', 25, 'Completed onboarding');

      if (usedReferralCode) {
        try {
          await storage.redeemReferral(usedReferralCode, userId);
        } catch (e) {}
      }

      res.json({ success: true, referralCode: code });
    } catch (error) {
      res.status(500).json({ error: 'Failed to complete onboarding' });
    }
  });

  app.get('/api/referral/code', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getProfile(userId);
    if (!profile?.referralCode) {
      const code = `SG-${userId.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      await db.update(profiles).set({ referralCode: code }).where(eq(profiles.userId, userId));
      return res.json({ code });
    }
    res.json({ code: profile.referralCode });
  });

  app.patch(api.users.updateStatus.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = api.users.updateStatus.input.parse(req.body);
      let profile = await storage.getProfile(userId);
      if (!profile) {
        const claims = req.user.claims;
        const username = claims.first_name || claims.email?.split('@')[0] || `user_${userId.slice(0, 8)}`;
        await storage.createProfile(userId, username, claims.profile_image_url);
      }
      await storage.updateProfile(userId, data);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.users.nearby.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const nearby = await storage.getNearbyUsers(userId);
    res.json(nearby);
  });

  app.post(api.users.block.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { blockedUserId, reason } = api.users.block.input.parse(req.body);
      await storage.blockUser(userId, blockedUserId, reason);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.users.unblock.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { blockedUserId } = api.users.unblock.input.parse(req.body);
      await storage.unblockUser(userId, blockedUserId);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.users.report.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { reportedUserId, reason, details } = api.users.report.input.parse(req.body);
      await storage.reportUser(userId, reportedUserId, reason, details);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.posts.list.path, async (req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  app.post(api.posts.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.posts.create.input.parse(req.body);
      const profile = await storage.getProfile(userId);
      if (profile && !profile.isGoMode) {
        input.latitude = undefined;
        input.longitude = undefined;
      }
      const post = await storage.createPost(input, userId);
      await storage.awardXp(userId, 'post', 15, 'Created a post');
      await storage.incrementChallengeProgress(userId, 'post');
      res.status(201).json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get('/api/users/:username', async (req, res) => {
    const profile = await storage.getProfileByUsername(req.params.username);
    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: profile.id,
      userId: profile.userId,
      username: profile.username,
      bio: profile.bio,
      avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
      instagram: profile.instagram,
      twitter: profile.twitter,
      tiktok: profile.tiktok,
      snapchat: profile.snapchat,
      linkedin: profile.linkedin,
      facebook: profile.facebook,
      website: profile.website,
      isGoMode: profile.isGoMode,
      isBoosted: profile.isBoosted,
      isFoundingMember: profile.isFoundingMember,
      xp: profile.xp,
      level: profile.level,
    });
  });

  app.get('/api/stripe/publishable-key', async (_req, res) => {
    try {
      const { getStripeCredentials } = await import("./stripeClient");
      const creds = await getStripeCredentials();
      if (!creds) {
        return res.status(503).json({ error: 'Stripe is not configured' });
      }
      res.json({ publishableKey: creds.publishableKey });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get Stripe key' });
    }
  });

  app.get('/api/stripe/products', async (_req, res) => {
    try {
      const schemaCheck = await db.execute(sql`SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'stripe') as exists`);
      if (!(schemaCheck.rows as any[])[0]?.exists) {
        return res.json({ products: [] });
      }

      const result = await db.execute(
        sql`
          SELECT 
            p.id as product_id,
            p.name as product_name,
            p.description as product_description,
            p.metadata as product_metadata,
            pr.id as price_id,
            pr.unit_amount,
            pr.currency,
            pr.recurring,
            pr.metadata as price_metadata
          FROM stripe.products p
          LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
          WHERE p.active = true
          ORDER BY p.name, pr.unit_amount
        `
      );

      const productsMap = new Map();
      for (const row of result.rows as any[]) {
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            metadata: row.product_metadata,
            prices: [],
          });
        }
        if (row.price_id) {
          productsMap.get(row.product_id).prices.push({
            id: row.price_id,
            unitAmount: row.unit_amount,
            currency: row.currency,
            recurring: row.recurring,
            metadata: row.price_metadata,
          });
        }
      }
      res.json({ products: Array.from(productsMap.values()) });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.post('/api/stripe/checkout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { priceId, mode } = req.body;

      if (!priceId) {
        return res.status(400).json({ error: 'priceId is required' });
      }

      const { getStripeCredentials, getUncachableStripeClient } = await import("./stripeClient");
      const creds = await getStripeCredentials();
      if (!creds) {
        return res.status(503).json({ error: 'Stripe is not configured' });
      }
      const stripe = await getUncachableStripeClient();
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      let customerId = profile.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: req.user.claims.email,
          metadata: { userId, username: profile.username },
        });
        customerId = customer.id;
        await db.update(profiles)
          .set({ stripeCustomerId: customer.id })
          .where(eq(profiles.userId, userId));
      }

      const checkoutMode = mode === 'subscription' ? 'subscription' : 'payment';
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: checkoutMode as any,
        success_url: `${baseUrl}/shop?success=true`,
        cancel_url: `${baseUrl}/shop?cancelled=true`,
        metadata: { userId },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Checkout error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  app.post('/api/stripe/portal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);

      if (!profile?.stripeCustomerId) {
        return res.status(400).json({ error: 'No billing account found' });
      }

      const { getStripeCredentials, getUncachableStripeClient } = await import("./stripeClient");
      const creds = await getStripeCredentials();
      if (!creds) {
        return res.status(503).json({ error: 'Stripe is not configured' });
      }
      const stripe = await getUncachableStripeClient();
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripeCustomerId,
        return_url: `${baseUrl}/shop`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Portal error:', error);
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  });

  app.get('/api/stripe/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);

      if (!profile?.stripeCustomerId) {
        return res.json({ subscription: null });
      }

      const schemaCheck = await db.execute(sql`SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'stripe') as exists`);
      if (!(schemaCheck.rows as any[])[0]?.exists) {
        return res.json({ subscription: null });
      }

      const result = await db.execute(
        sql`SELECT * FROM stripe.subscriptions WHERE customer = ${profile.stripeCustomerId} AND status IN ('active', 'trialing') LIMIT 1`
      );

      const sub = (result.rows as any[])[0] || null;
      if (sub) {
        const productResult = await db.execute(
          sql`SELECT metadata FROM stripe.products WHERE id = (
            SELECT product FROM stripe.prices WHERE id = (
              SELECT jsonb_array_elements(${sub.items}::jsonb)->>'price' LIMIT 1
            )
          )`
        );
        const productMeta = (productResult.rows as any[])[0]?.metadata;
        res.json({
          subscription: {
            id: sub.id,
            status: sub.status,
            currentPeriodEnd: sub.current_period_end,
            tier: productMeta?.tier || null,
          },
        });
      } else {
        res.json({ subscription: null });
      }
    } catch (error: any) {
      console.error('Subscription check error:', error);
      res.json({ subscription: null });
    }
  });

  return httpServer;
}
