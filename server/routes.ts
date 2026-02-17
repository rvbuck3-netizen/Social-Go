
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
  // Seed the database on startup
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
    const nearby = await storage.getNearbyUsers();
    res.json(nearby);
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

  return httpServer;
}
