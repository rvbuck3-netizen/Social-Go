
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

  // Mock "me" for MVP
  app.get(api.users.me.path, async (req, res) => {
    res.json({ id: 1, username: "Alice", isGoMode: false });
  });

  app.patch(api.users.updateStatus.path, async (req, res) => {
    try {
      const { isGoMode, latitude, longitude } = api.users.updateStatus.input.parse(req.body);
      // Using hardcoded ID 1 for MVP
      await storage.updateUserStatus(1, { isGoMode, latitude, longitude });
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
