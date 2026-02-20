
import { pgTable, text, serial, timestamp, boolean, doublePrecision, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  username: text("username").notNull().unique(),
  isGoMode: boolean("is_go_mode").default(false).notNull(),
  goModeExpiresAt: timestamp("go_mode_expires_at"),
  goModeVibe: text("go_mode_vibe"), // 'Gym', 'Chill', 'Work', 'Social'
  goModeIntent: text("go_mode_intent"), // 'Meet', 'Talk', 'Just around'
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  lastSeen: timestamp("last_seen").defaultNow(),
  bio: text("bio"),
  avatar: text("avatar"),
  instagram: text("instagram"),
  twitter: text("twitter"),
  tiktok: text("tiktok"),
  snapchat: text("snapchat"),
  linkedin: text("linkedin"),
  facebook: text("facebook"),
  website: text("website"),
  isBoosted: boolean("is_boosted").default(false).notNull(),
  boostExpiresAt: timestamp("boost_expires_at"),
  coins: integer("coins").default(0).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionTier: text("subscription_tier"),
  isFoundingMember: boolean("is_founding_member").default(false).notNull(),
  isBuilder: boolean("is_builder").default(false).notNull(),
  builderCategory: text("builder_category"), // 'Founder', 'Creator', 'Developer', 'Investor'
  ageVerified: boolean("age_verified").default(false).notNull(),
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  streakCount: integer("streak_count").default(0).notNull(),
  lastDailyLoginAt: timestamp("last_daily_login_at"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  interests: text("interests").array(),
  locationRadius: integer("location_radius").default(25),
  referralCode: text("referral_code"),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  authorName: text("author_name").notNull(),
  authorUserId: varchar("author_user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  hideExactLocation: boolean("hide_exact_location").default(false).notNull(),
});

export const blockedUsers = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  blockerUserId: varchar("blocker_user_id").notNull(),
  blockedUserId: varchar("blocked_user_id").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterUserId: varchar("reporter_user_id").notNull(),
  reportedUserId: varchar("reported_user_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  xpReward: integer("xp_reward").default(0).notNull(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  awardedAt: timestamp("awarded_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  targetType: text("target_type").notNull(),
  targetCount: integer("target_count").notNull(),
  rewardXp: integer("reward_xp").default(0).notNull(),
  rewardBadgeCode: text("reward_badge_code"),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  interestTag: text("interest_tag"),
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  businessName: text("business_name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  imageUrl: text("image_url"),
  website: text("website"),
  category: text("category"),
  durationDays: integer("duration_days").default(7).notNull(),
  status: text("status").default("active").notNull(),
  startAt: timestamp("start_at").defaultNow().notNull(),
  endAt: timestamp("end_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerUserId: varchar("referrer_user_id").notNull(),
  refereeUserId: varchar("referee_user_id"),
  code: text("code").notNull().unique(),
  redeemed: boolean("redeemed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  redeemedAt: timestamp("redeemed_at"),
});

export const xpEvents = pgTable("xp_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  authorUserId: varchar("author_user_id").notNull(),
  authorName: text("author_name").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'Fitness', 'Dining', 'Sports', 'Study', 'Social', 'Other'
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  scheduledFor: timestamp("scheduled_for"),
  status: text("status").default("active").notNull(), // 'active', 'filled', 'completed', 'cancelled'
  participantLimit: integer("participant_limit"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const questResponses = pgTable("quest_responses", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull(),
  userId: varchar("user_id").notNull(),
  responseType: text("response_type").notNull(), // 'joined', 'interested', 'chat'
  createdAt: timestamp("created_at").defaultNow(),
});

export const accountabilityGoals = pgTable("accountability_goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  category: text("category").notNull(), // 'Fitness', 'Business', 'Learning', 'Mental health', 'Creative'
  goalDescription: text("goal_description"),
  circleId: integer("circle_id"),
  currentStreak: integer("current_streak").default(0).notNull(),
  bestStreak: integer("best_streak").default(0).notNull(),
  lastCheckInAt: timestamp("last_check_in_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accountabilityCircles = pgTable("accountability_circles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'Fitness', 'Business', 'Learning', 'Mental health', 'Creative'
  creatorUserId: varchar("creator_user_id").notNull(),
  maxMembers: integer("max_members").default(5).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const circleMembers = pgTable("circle_members", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").notNull(),
  userId: varchar("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const circleCheckIns = pgTable("circle_check_ins", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").notNull(),
  userId: varchar("user_id").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moodChecks = pgTable("mood_checks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  mood: text("mood").notNull(), // 'motivated', 'chill', 'stressed', 'want_to_talk'
  visibleToGoMode: boolean("visible_to_go_mode").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({ 
  id: true, 
  createdAt: true,
  authorUserId: true,
}).extend({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  hideExactLocation: z.boolean().optional().default(false),
  isAnonymous: z.boolean().optional().default(false),
});

export const insertBlockSchema = createInsertSchema(blockedUsers).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  createdAt: true,
  status: true,
  startAt: true,
});

export const insertQuestSchema = createInsertSchema(quests).omit({
  id: true,
  createdAt: true,
  status: true,
  authorUserId: true,
});

export const insertQuestResponseSchema = createInsertSchema(questResponses).omit({
  id: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(accountabilityGoals).omit({
  id: true,
  createdAt: true,
});

export const insertCircleSchema = createInsertSchema(accountabilityCircles).omit({
  id: true,
  createdAt: true,
});

export const insertMoodCheckSchema = createInsertSchema(moodChecks).omit({
  id: true,
  createdAt: true,
});

export type Profile = typeof profiles.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type BlockedUser = typeof blockedUsers.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type ChallengeProgress = typeof challengeProgress.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type XpEvent = typeof xpEvents.$inferSelect;
export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Quest = typeof quests.$inferSelect;
export type QuestResponse = typeof questResponses.$inferSelect;
export type AccountabilityGoal = typeof accountabilityGoals.$inferSelect;
export type AccountabilityCircle = typeof accountabilityCircles.$inferSelect;
export type CircleMember = typeof circleMembers.$inferSelect;
export type CircleCheckIn = typeof circleCheckIns.$inferSelect;
export type MoodCheck = typeof moodChecks.$inferSelect;
export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type InsertQuestResponse = z.infer<typeof insertQuestResponseSchema>;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type InsertCircle = z.infer<typeof insertCircleSchema>;
export type InsertMoodCheck = z.infer<typeof insertMoodCheckSchema>;
