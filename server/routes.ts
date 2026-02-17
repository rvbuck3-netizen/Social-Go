
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

import { seedDatabase } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedDatabase();

  app.get(api.users.me.path, async (req, res) => {
    const user = await storage.getUser(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ 
      ...user,
      avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
    });
  });

  app.patch(api.users.updateStatus.path, async (req, res) => {
    try {
      const data = api.users.updateStatus.input.parse(req.body);
      await storage.updateUserStatus(1, data);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.users.nearby.path, async (req, res) => {
    const nearby = await storage.getNearbyUsers(1);
    res.json(nearby);
  });

  app.post(api.users.block.path, async (req, res) => {
    try {
      const { blockedId, reason } = api.users.block.input.parse(req.body);
      await storage.blockUser(1, blockedId, reason);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.users.unblock.path, async (req, res) => {
    try {
      const { blockedId } = api.users.unblock.input.parse(req.body);
      await storage.unblockUser(1, blockedId);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.users.report.path, async (req, res) => {
    try {
      const { reportedUserId, reason, details } = api.users.report.input.parse(req.body);
      await storage.reportUser(1, reportedUserId, reason, details);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.shop.purchaseBoost.path, async (req, res) => {
    try {
      const { boostType } = api.shop.purchaseBoost.input.parse(req.body);
      const durationMap: Record<string, number> = {
        "boost-1hr": 1,
        "boost-6hr": 6,
        "boost-24hr": 24,
      };
      const hours = durationMap[boostType];
      const expiresAt = await storage.activateBoost(1, hours);
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

  app.post(api.posts.create.path, async (req, res) => {
    try {
      const input = api.posts.create.input.parse(req.body);
      const post = await storage.createPost(input);
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
    const user = await storage.getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
      instagram: user.instagram,
      twitter: user.twitter,
      tiktok: user.tiktok,
      snapchat: user.snapchat,
      linkedin: user.linkedin,
      facebook: user.facebook,
      website: user.website,
      isGoMode: user.isGoMode,
      isBoosted: user.isBoosted,
    });
  });

  return httpServer;
}
