
import { db } from "./db";
import {
  profiles,
  posts,
  blockedUsers,
  reports,
  type Post,
  type Profile,
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
  getProfile(userId: string): Promise<Profile | undefined>;
  getProfileByUsername(username: string): Promise<Profile | undefined>;
  createProfile(userId: string, username: string, avatar?: string | null): Promise<Profile>;
  getPosts(): Promise<Post[]>;
  createPost(post: any, authorUserId: string): Promise<Post>;
  updateProfile(userId: string, data: {
    isGoMode?: boolean;
    latitude?: number;
    longitude?: number;
    bio?: string;
    username?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    snapchat?: string;
    linkedin?: string;
    facebook?: string;
    website?: string;
  }): Promise<void>;
  getNearbyUsers(requestingUserId: string): Promise<Profile[]>;
  activateBoost(userId: string, durationHours: number): Promise<Date>;
  blockUser(blockerUserId: string, blockedUserId: string, reason?: string): Promise<void>;
  unblockUser(blockerUserId: string, blockedUserId: string): Promise<void>;
  getBlockedUserIds(userId: string): Promise<string[]>;
  reportUser(reporterUserId: string, reportedUserId: string, reason: string, details?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    if (profile) {
      if (profile.isGoMode && profile.goModeExpiresAt && new Date() > profile.goModeExpiresAt) {
        await db.update(profiles).set({ isGoMode: false, goModeExpiresAt: null }).where(eq(profiles.userId, userId));
        return { ...profile, isGoMode: false, goModeExpiresAt: null };
      }
      if (profile.isBoosted && profile.boostExpiresAt && new Date() > profile.boostExpiresAt) {
        await db.update(profiles).set({ isBoosted: false, boostExpiresAt: null }).where(eq(profiles.userId, userId));
        return { ...profile, isBoosted: false, boostExpiresAt: null };
      }
    }
    return profile;
  }

  async getProfileByUsername(username: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.username, username));
    return profile;
  }

  async createProfile(userId: string, username: string, avatar?: string | null): Promise<Profile> {
    const [profile] = await db.insert(profiles).values({
      userId,
      username,
      avatar: avatar || null,
    }).returning();
    return profile;
  }

  async getPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async createPost(insertPost: any, authorUserId: string): Promise<Post> {
    let { latitude, longitude } = insertPost;
    
    if (insertPost.hideExactLocation) {
      latitude = latitude + (Math.random() - 0.5) * 0.01;
      longitude = longitude + (Math.random() - 0.5) * 0.01;
    }

    const [post] = await db.insert(posts).values({
      ...insertPost,
      latitude,
      longitude,
      authorUserId,
    }).returning();
    return post;
  }

  async updateProfile(userId: string, status: {
    isGoMode?: boolean;
    latitude?: number;
    longitude?: number;
    bio?: string;
    username?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    snapchat?: string;
    linkedin?: string;
    facebook?: string;
    website?: string;
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
    if (status.username !== undefined) updateData.username = status.username;
    if (status.instagram !== undefined) updateData.instagram = status.instagram;
    if (status.twitter !== undefined) updateData.twitter = status.twitter;
    if (status.tiktok !== undefined) updateData.tiktok = status.tiktok;
    if (status.snapchat !== undefined) updateData.snapchat = status.snapchat;
    if (status.linkedin !== undefined) updateData.linkedin = status.linkedin;
    if (status.facebook !== undefined) updateData.facebook = status.facebook;
    if (status.website !== undefined) updateData.website = status.website;

    await db.update(profiles).set(updateData).where(eq(profiles.userId, userId));
  }

  async getNearbyUsers(requestingUserId: string): Promise<Profile[]> {
    const blockedIds = await this.getBlockedUserIds(requestingUserId);
    
    const results = await db.select()
      .from(profiles)
      .where(and(
        eq(profiles.isGoMode, true),
        isNotNull(profiles.latitude),
        isNotNull(profiles.longitude),
        ne(profiles.userId, requestingUserId)
      ));
    
    const now = new Date();
    return results
      .filter(r => {
        if (blockedIds.includes(r.userId)) return false;
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

  async activateBoost(userId: string, durationHours: number): Promise<Date> {
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    await db.update(profiles)
      .set({
        isBoosted: true,
        boostExpiresAt: expiresAt,
      })
      .where(eq(profiles.userId, userId));
    return expiresAt;
  }

  async blockUser(blockerUserId: string, blockedUserId: string, reason?: string): Promise<void> {
    const existing = await db.select().from(blockedUsers)
      .where(and(eq(blockedUsers.blockerUserId, blockerUserId), eq(blockedUsers.blockedUserId, blockedUserId)));
    if (existing.length === 0) {
      await db.insert(blockedUsers).values({ blockerUserId, blockedUserId, reason });
    }
  }

  async unblockUser(blockerUserId: string, blockedUserId: string): Promise<void> {
    await db.delete(blockedUsers)
      .where(and(eq(blockedUsers.blockerUserId, blockerUserId), eq(blockedUsers.blockedUserId, blockedUserId)));
  }

  async getBlockedUserIds(userId: string): Promise<string[]> {
    const blocked = await db.select({ blockedUserId: blockedUsers.blockedUserId })
      .from(blockedUsers)
      .where(eq(blockedUsers.blockerUserId, userId));
    return blocked.map(b => b.blockedUserId);
  }

  async reportUser(reporterUserId: string, reportedUserId: string, reason: string, details?: string): Promise<void> {
    await db.insert(reports).values({ reporterUserId, reportedUserId, reason, details });
  }
}

export const storage = new DatabaseStorage();
