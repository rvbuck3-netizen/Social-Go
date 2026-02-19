
import { db } from "./db";
import {
  profiles,
  posts,
  blockedUsers,
  reports,
  badges,
  userBadges,
  challenges,
  challengeProgress,
  referrals,
  xpEvents,
  type Post,
  type Profile,
  type Badge,
  type UserBadge,
  type Challenge,
  type ChallengeProgress,
  type Referral,
  type XpEvent,
} from "@shared/schema";
import { eq, desc, and, isNotNull, ne, sql, gte, lte } from "drizzle-orm";

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
  awardXp(userId: string, type: string, amount: number, description?: string): Promise<Profile>;
  getBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: string, badgeCode: string): Promise<void>;
  getActiveChallenges(): Promise<Challenge[]>;
  joinChallenge(userId: string, challengeId: number): Promise<ChallengeProgress>;
  getUserChallengeProgress(userId: string): Promise<(ChallengeProgress & { challenge: Challenge })[]>;
  incrementChallengeProgress(userId: string, targetType: string): Promise<void>;
  getXpEvents(userId: string, limit?: number): Promise<XpEvent[]>;
  getReferralByCode(code: string): Promise<Referral | undefined>;
  createReferral(referrerUserId: string, code: string): Promise<Referral>;
  redeemReferral(code: string, refereeUserId: string): Promise<void>;
  checkAndAwardLoginStreak(userId: string): Promise<{ streakCount: number; xpAwarded: number }>;
  getLeaderboard(limit?: number): Promise<Pick<Profile, 'username' | 'xp' | 'level' | 'avatar' | 'isFoundingMember'>[]>;
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
    let latitude = insertPost.latitude ?? null;
    let longitude = insertPost.longitude ?? null;
    
    if (latitude != null && longitude != null && insertPost.hideExactLocation) {
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

  private calculateLevel(xp: number): number {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    if (xp < 1500) return 5;
    if (xp < 2500) return 6;
    if (xp < 4000) return 7;
    if (xp < 6000) return 8;
    if (xp < 9000) return 9;
    return 10;
  }

  async awardXp(userId: string, type: string, amount: number, description?: string): Promise<Profile> {
    await db.insert(xpEvents).values({ userId, type, amount, description });
    const [profile] = await db.update(profiles)
      .set({ xp: sql`${profiles.xp} + ${amount}` })
      .where(eq(profiles.userId, userId))
      .returning();
    const newLevel = this.calculateLevel(profile.xp);
    if (newLevel !== profile.level) {
      await db.update(profiles).set({ level: newLevel }).where(eq(profiles.userId, userId));
      profile.level = newLevel;
    }
    return profile;
  }

  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    const results = await db.select()
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));
    return results.map(r => ({ ...r.user_badges, badge: r.badges }));
  }

  async awardBadge(userId: string, badgeCode: string): Promise<void> {
    const [badge] = await db.select().from(badges).where(eq(badges.code, badgeCode));
    if (!badge) return;
    const existing = await db.select().from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badge.id)));
    if (existing.length > 0) return;
    await db.insert(userBadges).values({ userId, badgeId: badge.id });
    if (badge.xpReward > 0) {
      await this.awardXp(userId, 'badge', badge.xpReward, `Earned badge: ${badge.name}`);
    }
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    const now = new Date();
    return await db.select().from(challenges)
      .where(and(
        eq(challenges.isActive, true),
        lte(challenges.startAt, now),
        gte(challenges.endAt, now)
      ));
  }

  async joinChallenge(userId: string, challengeId: number): Promise<ChallengeProgress> {
    const existing = await db.select().from(challengeProgress)
      .where(and(eq(challengeProgress.userId, userId), eq(challengeProgress.challengeId, challengeId)));
    if (existing.length > 0) return existing[0];
    const [progress] = await db.insert(challengeProgress)
      .values({ userId, challengeId })
      .returning();
    return progress;
  }

  async getUserChallengeProgress(userId: string): Promise<(ChallengeProgress & { challenge: Challenge })[]> {
    const results = await db.select()
      .from(challengeProgress)
      .innerJoin(challenges, eq(challengeProgress.challengeId, challenges.id))
      .where(eq(challengeProgress.userId, userId));
    return results.map(r => ({ ...r.challenge_progress, challenge: r.challenges }));
  }

  async incrementChallengeProgress(userId: string, targetType: string): Promise<void> {
    const now = new Date();
    const activeResults = await db.select()
      .from(challengeProgress)
      .innerJoin(challenges, eq(challengeProgress.challengeId, challenges.id))
      .where(and(
        eq(challengeProgress.userId, userId),
        eq(challenges.targetType, targetType),
        eq(challengeProgress.completed, false),
        eq(challenges.isActive, true),
        lte(challenges.startAt, now),
        gte(challenges.endAt, now)
      ));

    for (const r of activeResults) {
      const newProgress = r.challenge_progress.progress + 1;
      const isComplete = newProgress >= r.challenges.targetCount;
      await db.update(challengeProgress)
        .set({
          progress: newProgress,
          completed: isComplete,
          completedAt: isComplete ? now : null,
        })
        .where(eq(challengeProgress.id, r.challenge_progress.id));

      if (isComplete) {
        await this.awardXp(userId, 'challenge', r.challenges.rewardXp, `Completed challenge: ${r.challenges.title}`);
        if (r.challenges.rewardBadgeCode) {
          await this.awardBadge(userId, r.challenges.rewardBadgeCode);
        }
      }
    }
  }

  async getXpEvents(userId: string, limit = 20): Promise<XpEvent[]> {
    return await db.select().from(xpEvents)
      .where(eq(xpEvents.userId, userId))
      .orderBy(desc(xpEvents.createdAt))
      .limit(limit);
  }

  async getReferralByCode(code: string): Promise<Referral | undefined> {
    const [ref] = await db.select().from(referrals).where(eq(referrals.code, code));
    return ref;
  }

  async createReferral(referrerUserId: string, code: string): Promise<Referral> {
    const [ref] = await db.insert(referrals).values({ referrerUserId, code }).returning();
    return ref;
  }

  async redeemReferral(code: string, refereeUserId: string): Promise<void> {
    const [ref] = await db.select().from(referrals).where(eq(referrals.code, code));
    if (!ref || ref.redeemed) return;
    await db.update(referrals)
      .set({ redeemed: true, refereeUserId, redeemedAt: new Date() })
      .where(eq(referrals.id, ref.id));
    await this.awardXp(ref.referrerUserId, 'referral', 100, 'Friend joined via your referral');
    await this.awardXp(refereeUserId, 'referral', 50, 'Joined via referral link');
  }

  async checkAndAwardLoginStreak(userId: string): Promise<{ streakCount: number; xpAwarded: number }> {
    const profile = await this.getProfile(userId);
    if (!profile) return { streakCount: 0, xpAwarded: 0 };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastLogin = profile.lastDailyLoginAt;

    if (lastLogin) {
      const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      const diffDays = Math.floor((today.getTime() - lastLoginDay.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return { streakCount: profile.streakCount, xpAwarded: 0 };
      }

      if (diffDays === 1) {
        const newStreak = profile.streakCount + 1;
        const xpAmount = Math.min(10 + newStreak * 5, 50);
        await db.update(profiles)
          .set({ streakCount: newStreak, lastDailyLoginAt: now })
          .where(eq(profiles.userId, userId));
        await this.awardXp(userId, 'daily_login', xpAmount, `Day ${newStreak} login streak`);

        if (newStreak === 7) await this.awardBadge(userId, 'streak_7');
        if (newStreak === 30) await this.awardBadge(userId, 'streak_30');

        return { streakCount: newStreak, xpAwarded: xpAmount };
      }
    }

    await db.update(profiles)
      .set({ streakCount: 1, lastDailyLoginAt: now })
      .where(eq(profiles.userId, userId));
    await this.awardXp(userId, 'daily_login', 10, 'Daily login');
    return { streakCount: 1, xpAwarded: 10 };
  }

  async getLeaderboard(limit = 10): Promise<Pick<Profile, 'username' | 'xp' | 'level' | 'avatar' | 'isFoundingMember'>[]> {
    return await db.select({
      username: profiles.username,
      xp: profiles.xp,
      level: profiles.level,
      avatar: profiles.avatar,
      isFoundingMember: profiles.isFoundingMember,
    })
      .from(profiles)
      .where(ne(profiles.userId, ''))
      .orderBy(desc(profiles.xp))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
