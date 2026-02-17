
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
  updateUserStatus(id: number, status: { isGoMode?: boolean, latitude?: number, longitude?: number }): Promise<void>;
  getNearbyUsers(): Promise<{ id: number, username: string, latitude: number, longitude: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(insertPost).returning();
    return post;
  }

  async updateUserStatus(id: number, status: { isGoMode?: boolean, latitude?: number, longitude?: number }): Promise<void> {
    await db.update(users)
      .set({
        ...(status.isGoMode !== undefined && { isGoMode: status.isGoMode }),
        ...(status.latitude !== undefined && { latitude: sql`${status.latitude}::double precision` }),
        ...(status.longitude !== undefined && { longitude: sql`${status.longitude}::double precision` }),
        lastSeen: new Date(),
      })
      .where(eq(users.id, id));
  }

  async getNearbyUsers(): Promise<{ id: number, username: string, latitude: number, longitude: number }[] > {
    // In a real app, we'd use a distance calculation. For MVP, just return active "Go Mode" users.
    const results = await db.select({
      id: users.id,
      username: users.username,
      latitude: users.latitude,
      longitude: users.longitude,
    })
    .from(users)
    .where(and(
      eq(users.isGoMode, true),
      isNotNull(users.latitude),
      isNotNull(users.longitude)
    ));
    
    return results as { id: number, username: string, latitude: number, longitude: number }[];
  }
}

export const storage = new DatabaseStorage();
