
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { seedDatabase } from "./seed";

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
    }
    res.json({
      ...profile,
      avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`
    });
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

  app.post(api.shop.purchaseBoost.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { boostType } = api.shop.purchaseBoost.input.parse(req.body);
      const durationMap: Record<string, number> = {
        "boost-1hr": 1,
        "boost-6hr": 6,
        "boost-24hr": 24,
      };
      const hours = durationMap[boostType];
      const expiresAt = await storage.activateBoost(userId, hours);
      res.json({ success: true, boostExpiresAt: expiresAt.toISOString() });
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
    });
  });

  return httpServer;
}
