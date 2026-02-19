
import { storage } from "./storage";
import { db } from "./db";
import { profiles, posts, badges, challenges } from "@shared/schema";
import { eq } from "drizzle-orm";

const OC_CENTER = { lat: 33.6846, lng: -117.8265 };

function randomOffset(center: { lat: number; lng: number }, radiusKm: number) {
  const latOffset = (Math.random() - 0.5) * (radiusKm / 111);
  const lngOffset = (Math.random() - 0.5) * (radiusKm / (111 * Math.cos(center.lat * Math.PI / 180)));
  return { lat: center.lat + latOffset, lng: center.lng + lngOffset };
}

const seedProfiles = [
  { userId: "seed-01", username: "MikeTravels", bio: "Always exploring new spots around OC. Coffee addict.", instagram: "miketravels", isGoMode: true },
  { userId: "seed-02", username: "JessicaFit", bio: "Gym mornings, beach afternoons. Let's connect!", instagram: "jessicafit_oc", isGoMode: true },
  { userId: "seed-03", username: "CarlosVibes", bio: "DJ and music lover. Know all the best nightlife in Orange County.", tiktok: "carlosvibes", isGoMode: true },
  { userId: "seed-04", username: "EmilyReads", bio: "Book nerd. Love finding quiet coffee shops to read at.", isGoMode: false },
  { userId: "seed-05", username: "RyanSurf", bio: "Surfer by day, coder by night. Huntington Beach local.", instagram: "ryansurf_hb", isGoMode: true },
  { userId: "seed-06", username: "SophiaArt", bio: "Artist and gallery hopper. Laguna Beach is my happy place.", website: "sophiaart.co", isGoMode: true },
  { userId: "seed-07", username: "JakeGrills", bio: "BBQ enthusiast. Always down to share a meal with new people.", isGoMode: true },
  { userId: "seed-08", username: "AishaStudy", bio: "UCI student. Looking for study buddies and friends.", isGoMode: true },
  { userId: "seed-09", username: "TommyCars", bio: "Car meets every weekend. JDM fan. Hit me up if you're into cars.", instagram: "tommycars_oc", isGoMode: true },
  { userId: "seed-10", username: "NinaYoga", bio: "Yoga instructor. Morning sessions at the park. Join me!", isGoMode: true },
  { userId: "seed-11", username: "DerekHikes", bio: "Trail runner and hiker. Know every trail in the Santa Ana Mountains.", isGoMode: false },
  { userId: "seed-12", username: "PriyaCooks", bio: "Foodie and home chef. Love sharing recipes and finding hidden gems.", tiktok: "priyacooks", isGoMode: true },
  { userId: "seed-13", username: "BrandonSkate", bio: "Skater. The Vans park is basically my second home.", instagram: "brandonskate", isGoMode: true },
  { userId: "seed-14", username: "LilyPhoto", bio: "Photographer chasing golden hour. DM me for collabs.", website: "lilyphotography.com", isGoMode: true },
  { userId: "seed-15", username: "OmarTech", bio: "Software engineer. Building cool stuff. Always networking.", linkedin: "omartech", isGoMode: false },
  { userId: "seed-16", username: "ChloeBeach", bio: "Beach volleyball and sunset walks. Newport life.", instagram: "chloebeach_", isGoMode: true },
  { userId: "seed-17", username: "KevDance", bio: "Dancer and choreographer. Looking for people to vibe with.", tiktok: "kevdance", isGoMode: true },
  { userId: "seed-18", username: "MayaGarden", bio: "Plant mom. Farmers market every Sunday morning.", isGoMode: true },
  { userId: "seed-19", username: "SamuelFit", bio: "Personal trainer. Free workout tips. Let's get active!", instagram: "samuelfitoc", isGoMode: true },
  { userId: "seed-20", username: "AngelaCraft", bio: "Crafter and maker. Love weekend markets and fairs.", isGoMode: false },
  { userId: "seed-21", username: "DanteMusic", bio: "Guitarist. Open mic nights are my thing.", isGoMode: true },
  { userId: "seed-22", username: "KianaRun", bio: "Marathon training. Early morning runs along PCH.", isGoMode: true },
  { userId: "seed-23", username: "LeoFoodie", bio: "Restaurant reviewer. Ask me for recommendations!", instagram: "leofoodie", isGoMode: true },
  { userId: "seed-24", username: "RachelDive", bio: "Scuba diver. The kelp forests off Laguna are incredible.", isGoMode: false },
  { userId: "seed-25", username: "JordanGame", bio: "Gamer and board game night organizer. Always looking for players.", isGoMode: true },
  { userId: "seed-26", username: "TinaWrite", bio: "Freelance writer. Working from different cafes every day.", isGoMode: true },
  { userId: "seed-27", username: "MarcusBall", bio: "Basketball at the park every evening. Come play!", isGoMode: true },
  { userId: "seed-28", username: "EvaCoffee", bio: "Barista and coffee snob. Trying every roaster in SoCal.", instagram: "evacoffee", isGoMode: true },
  { userId: "seed-29", username: "NoahFilm", bio: "Indie filmmaker. Always scouting locations.", website: "noahfilms.co", isGoMode: false },
  { userId: "seed-30", username: "ZoeAdventure", bio: "Weekend road trips and spontaneous adventures. Who's in?", instagram: "zoeadventure_", isGoMode: true },
];

const seedPosts = [
  { content: "Anyone know a good taco spot near Irvine? Just moved here!", lat: 33.6846, lng: -117.8265, name: "AishaStudy", userId: "seed-08" },
  { content: "Sunset at Laguna Beach right now is unreal", lat: 33.5427, lng: -117.7854, name: "SophiaArt", userId: "seed-06" },
  { content: "Car meet tonight at the Spectrum! JDM only.", lat: 33.6494, lng: -117.7404, name: "TommyCars", userId: "seed-09" },
  { content: "Free yoga session at the park tomorrow 7am. All levels welcome!", lat: 33.6621, lng: -117.8310, name: "NinaYoga", userId: "seed-10" },
  { content: "Just found the best hidden coffee shop in Costa Mesa", lat: 33.6633, lng: -117.9034, name: "EvaCoffee", userId: "seed-28" },
  { content: "Waves are perfect at HB pier today. Get out here!", lat: 33.6553, lng: -117.9988, name: "RyanSurf", userId: "seed-05" },
  { content: "Looking for a pickup basketball game tonight. Anyone down?", lat: 33.6366, lng: -117.8418, name: "MarcusBall", userId: "seed-27" },
  { content: "Golden hour at Crystal Cove. Bring your camera!", lat: 33.5732, lng: -117.8401, name: "LilyPhoto", userId: "seed-14" },
  { content: "New farmers market in downtown Santa Ana. So many good vendors!", lat: 33.7455, lng: -117.8677, name: "MayaGarden", userId: "seed-18" },
  { content: "Open mic night at the Wayfarer tonight. Come support local artists!", lat: 33.6620, lng: -117.9050, name: "DanteMusic", userId: "seed-21" },
  { content: "Training for the OC Marathon. Anyone want a running buddy?", lat: 33.7175, lng: -117.8311, name: "KianaRun", userId: "seed-22" },
  { content: "Board game night at my place this Friday. DM me for the address!", lat: 33.6846, lng: -117.8265, name: "JordanGame", userId: "seed-25" },
  { content: "This new ramen place in Tustin is absolutely incredible", lat: 33.7458, lng: -117.8263, name: "LeoFoodie", userId: "seed-23" },
  { content: "Morning trail run at El Moro Canyon was magical today", lat: 33.5750, lng: -117.8365, name: "DerekHikes", userId: "seed-11" },
  { content: "Anyone going to the art walk in Laguna this weekend?", lat: 33.5427, lng: -117.7854, name: "SophiaArt", userId: "seed-06" },
];

export async function seedDatabase() {
  const existingPosts = await storage.getPosts();
  if (existingPosts.length <= 4) {
    console.log("Seeding realistic profiles and posts for Orange County...");

    for (const p of seedProfiles) {
      const existing = await storage.getProfile(p.userId);
      if (!existing) {
        const loc = randomOffset(OC_CENTER, 25);
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`;
        await db.insert(profiles).values({
          userId: p.userId,
          username: p.username,
          bio: p.bio,
          avatar,
          isGoMode: p.isGoMode,
          latitude: loc.lat,
          longitude: loc.lng,
          lastSeen: new Date(),
          instagram: p.instagram || null,
          tiktok: p.tiktok || null,
          linkedin: p.linkedin || null,
          website: p.website || null,
          isFoundingMember: true,
          ageVerified: true,
        }).onConflictDoNothing();
      }
    }

    for (const post of seedPosts) {
      await storage.createPost({
        content: post.content,
        latitude: post.lat,
        longitude: post.lng,
        authorName: post.name,
      }, post.userId);
    }

    console.log(`Seeded ${seedProfiles.length} profiles and ${seedPosts.length} posts!`);
  }

  const existingBadges = await db.select().from(badges);
  if (existingBadges.length === 0) {
    console.log("Seeding badges...");
    const badgeData = [
      { code: "founding_member", name: "Founding Member", description: "Joined during the pre-launch period", icon: "star", category: "membership", xpReward: 50 },
      { code: "first_post", name: "First Post", description: "Created your first geo-tagged post", icon: "message-circle", category: "engagement", xpReward: 25 },
      { code: "streak_7", name: "Week Warrior", description: "7-day login streak", icon: "flame", category: "streak", xpReward: 100 },
      { code: "streak_30", name: "Monthly Legend", description: "30-day login streak", icon: "flame", category: "streak", xpReward: 500 },
      { code: "explorer", name: "Explorer", description: "Visited 5 different areas on the map", icon: "compass", category: "exploration", xpReward: 75 },
      { code: "social_butterfly", name: "Social Butterfly", description: "Connected with 10 nearby users", icon: "users", category: "social", xpReward: 100 },
      { code: "local_legend", name: "Local Legend", description: "Most active user in your area", icon: "crown", category: "achievement", xpReward: 200 },
      { code: "early_bird", name: "Early Bird", description: "Posted before 7 AM", icon: "sunrise", category: "engagement", xpReward: 30 },
      { code: "night_owl", name: "Night Owl", description: "Posted after midnight", icon: "moon", category: "engagement", xpReward: 30 },
      { code: "challenge_champ", name: "Challenge Champ", description: "Completed your first weekly challenge", icon: "trophy", category: "achievement", xpReward: 75 },
      { code: "referral_star", name: "Referral Star", description: "Invited 3 friends who joined", icon: "share-2", category: "social", xpReward: 150 },
      { code: "go_mode_pro", name: "Go Mode Pro", description: "Used Go Mode 10 times", icon: "zap", category: "engagement", xpReward: 50 },
    ];
    for (const b of badgeData) {
      await db.insert(badges).values(b).onConflictDoNothing();
    }
    console.log(`Seeded ${badgeData.length} badges!`);
  }

  const existingChallenges = await db.select().from(challenges);
  if (existingChallenges.length === 0) {
    console.log("Seeding weekly challenges...");
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59);

    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await db.insert(challenges).values([
      {
        title: "Post 3 times this week",
        description: "Drop 3 geo-tagged posts to earn bonus XP and the Challenge Champ badge",
        icon: "target",
        targetType: "post",
        targetCount: 3,
        rewardXp: 100,
        rewardBadgeCode: "challenge_champ",
        startAt: now,
        endAt: endOfWeek,
        isActive: true,
      },
      {
        title: "Best Local Coffee",
        description: "Share your favorite local coffee spot with a post. Best finds get featured!",
        icon: "coffee",
        targetType: "post",
        targetCount: 1,
        rewardXp: 50,
        rewardBadgeCode: null,
        startAt: now,
        endAt: nextMonth,
        isActive: true,
      },
    ]).onConflictDoNothing();
    console.log("Seeded 2 challenges!");
  }
}
