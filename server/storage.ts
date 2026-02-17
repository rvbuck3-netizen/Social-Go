
import { db } from "./db";
import {
  posts,
  users,
  blockedUsers,
  reports,
  type InsertPost,
  type Post,
} from "@shared/schema";
import { eq, desc, and, isNotNull, ne, sql } from "drizzle-orm";

const GO_MODE_DURATION_HOURS = 2;
const LOCATION_FUZZ_AMOUNT = 0.003;

function fuzzLocation(lat: number, lng: number): { latitude: number; longitude: number } {
  const latOffset = (Math.random() - 0.5) * LOCATION_FUZZ_AMOUNT;
  const lngOffset = (Math.random() - 0.5) * LOCATION_FUZZ_AMOUNT;
  return { latitude: lat + latOffset, longitude: lng + lngOffset };
}

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
    tiktok?: string,
    snapchat?: string,
    linkedin?: string,
    website?: string
  }): Promise<void>;
  getNearbyUsers(requestingUserId: number): Promise<(typeof users.$inferSelect)[]>;
  activateBoost(userId: number, durationHours: number): Promise<Date>;
  blockUser(blockerId: number, blockedId: number, reason?: string): Promise<void>;
  unblockUser(blockerId: number, blockedId: number): Promise<void>;
  getBlockedUserIds(userId: number): Promise<number[]>;
  reportUser(reporterId: number, reportedUserId: number, reason: string, details?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<typeof users.$inferSelect | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user) {
      if (user.isGoMode && user.goModeExpiresAt && new Date() > user.goModeExpiresAt) {
        await db.update(users).set({ isGoMode: false, goModeExpiresAt: null }).where(eq(users.id, id));
        return { ...user, isGoMode: false, goModeExpiresAt: null };
      }
      if (user.isBoosted && user.boostExpiresAt && new Date() > user.boostExpiresAt) {
        await db.update(users).set({ isBoosted: false, boostExpiresAt: null }).where(eq(users.id, id));
        return { ...user, isBoosted: false, boostExpiresAt: null };
      }
    }
    return user;
  }

  async getPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    let { latitude, longitude } = insertPost;
    
    if (insertPost.hideExactLocation) {
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
    tiktok?: string,
    snapchat?: string,
    linkedin?: string,
    website?: string
  }): Promise<void> {
    const updateData: any = { lastSeen: new Date() };

    if (status.isGoMode !== undefined) {
      updateData.isGoMode = status.isGoMode;
      if (status.isGoMode) {
        updateData.goModeExpiresAt = new Date(Date.now() + GO_MODE_DURATION_HOURS * 60 * 60 * 1000);
      } else {
        updateData.goModeExpiresAt = null;
      }
    }
    if (status.latitude !== undefined) updateData.latitude = sql`${status.latitude}::double precision`;
    if (status.longitude !== undefined) updateData.longitude = sql`${status.longitude}::double precision`;
    if (status.bio !== undefined) updateData.bio = status.bio;
    if (status.instagram !== undefined) updateData.instagram = status.instagram;
    if (status.twitter !== undefined) updateData.twitter = status.twitter;
    if (status.tiktok !== undefined) updateData.tiktok = status.tiktok;
    if (status.snapchat !== undefined) updateData.snapchat = status.snapchat;
    if (status.linkedin !== undefined) updateData.linkedin = status.linkedin;
    if (status.website !== undefined) updateData.website = status.website;

    await db.update(users).set(updateData).where(eq(users.id, id));
  }

  async getNearbyUsers(requestingUserId: number): Promise<(typeof users.$inferSelect)[]> {
    const blockedIds = await this.getBlockedUserIds(requestingUserId);
    
    const results = await db.select()
      .from(users)
      .where(and(
        eq(users.isGoMode, true),
        isNotNull(users.latitude),
        isNotNull(users.longitude),
        ne(users.id, requestingUserId)
      ));
    
    const now = new Date();
    return results
      .filter(r => {
        if (blockedIds.includes(r.id)) return false;
        if (r.goModeExpiresAt && now > r.goModeExpiresAt) return false;
        return true;
      })
      .map(r => {
        const fuzzed = fuzzLocation(r.latitude!, r.longitude!);
        return {
          ...r,
          latitude: fuzzed.latitude,
          longitude: fuzzed.longitude,
        };
      });
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

  async blockUser(blockerId: number, blockedId: number, reason?: string): Promise<void> {
    const existing = await db.select().from(blockedUsers)
      .where(and(eq(blockedUsers.blockerId, blockerId), eq(blockedUsers.blockedId, blockedId)));
    if (existing.length === 0) {
      await db.insert(blockedUsers).values({ blockerId, blockedId, reason });
    }
  }

  async unblockUser(blockerId: number, blockedId: number): Promise<void> {
    await db.delete(blockedUsers)
      .where(and(eq(blockedUsers.blockerId, blockerId), eq(blockedUsers.blockedId, blockedId)));
  }

  async getBlockedUserIds(userId: number): Promise<number[]> {
    const blocked = await db.select({ blockedId: blockedUsers.blockedId })
      .from(blockedUsers)
      .where(eq(blockedUsers.blockerId, userId));
    return blocked.map(b => b.blockedId);
  }

  async reportUser(reporterId: number, reportedUserId: number, reason: string, details?: string): Promise<void> {
    await db.insert(reports).values({ reporterId, reportedUserId, reason, details });
  }
}

export const storage = new DatabaseStorage();
