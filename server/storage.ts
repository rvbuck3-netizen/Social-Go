
import { db } from "./db";
import {
  posts,
  users,
  type InsertPost,
  type Post,
} from "@shared/schema";
import { eq, desc, and, isNotNull, gt, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<typeof users.$inferSelect | undefined>;
  getPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updateUserStatus(id: number, status: { 
    isGoMode?: boolean, 
    latitude?: number, 
    longitude?: number,
    bio?: string,
    instagram?: string,
    twitter?: string,
    website?: string
  }): Promise<void>;
  getNearbyUsers(): Promise<(typeof users.$inferSelect)[]>;
  activateBoost(userId: number, durationHours: number): Promise<Date>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<typeof users.$inferSelect | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    let { latitude, longitude } = insertPost;
    
    if (insertPost.hideExactLocation) {
      // Add a small random offset (approx 500m-1km) to fuzzy the location
      latitude = latitude + (Math.random() - 0.5) * 0.01;
      longitude = longitude + (Math.random() - 0.5) * 0.01;
    }

    const [post] = await db.insert(posts).values({
      ...insertPost,
      latitude,
      longitude
    }).returning();
    return post;
  }

  async updateUserStatus(id: number, status: { 
    isGoMode?: boolean, 
    latitude?: number, 
    longitude?: number,
    bio?: string,
    instagram?: string,
    twitter?: string,
    website?: string
  }): Promise<void> {
    await db.update(users)
      .set({
        ...(status.isGoMode !== undefined && { isGoMode: status.isGoMode }),
        ...(status.latitude !== undefined && { latitude: sql`${status.latitude}::double precision` }),
        ...(status.longitude !== undefined && { longitude: sql`${status.longitude}::double precision` }),
        ...(status.bio !== undefined && { bio: status.bio }),
        ...(status.instagram !== undefined && { instagram: status.instagram }),
        ...(status.twitter !== undefined && { twitter: status.twitter }),
        ...(status.website !== undefined && { website: status.website }),
        lastSeen: new Date(),
      })
      .where(eq(users.id, id));
  }

  async getNearbyUsers(): Promise<(typeof users.$inferSelect)[]> {
    // In a real app, we'd use a distance calculation. For MVP, just return active "Go Mode" users.
    const results = await db.select()
    .from(users)
    .where(and(
      eq(users.isGoMode, true),
      isNotNull(users.latitude),
      isNotNull(users.longitude)
    ));
    
    return results.map(r => ({
      ...r,
      latitude: r.latitude!,
      longitude: r.longitude!
    }));
  }

  async activateBoost(userId: number, durationHours: number): Promise<Date> {
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    await db.update(users)
      .set({
        isBoosted: true,
        boostExpiresAt: expiresAt,
      })
      .where(eq(users.id, userId));
    return expiresAt;
  }
}

export const storage = new DatabaseStorage();
