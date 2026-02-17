
import { db } from "./db";
import {
  posts,
  users,
  type InsertPost,
  type Post,
} from "@shared/schema";
import { eq, desc, and, isNotNull, gt, sql } from "drizzle-orm";

export interface IStorage {
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
}

export class DatabaseStorage implements IStorage {
  async getPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(insertPost).returning();
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
}

export const storage = new DatabaseStorage();
