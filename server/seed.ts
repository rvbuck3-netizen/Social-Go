
import { storage } from "./storage";

export async function seedDatabase() {
  const existingPosts = await storage.getPosts();
  if (existingPosts.length === 0) {
    console.log("Seeding sample posts...");
    
    await storage.createPost({
      content: "Hello from San Francisco! Anyone around?",
      latitude: 37.7749,
      longitude: -122.4194,
      authorName: "Alice"
    }, "seed-alice");
    
    await storage.createPost({
      content: "Just landed in NYC! Best pizza recommendation?",
      latitude: 40.7128,
      longitude: -74.0060,
      authorName: "Bob"
    }, "seed-bob");
    
    await storage.createPost({
      content: "Beautiful day in London",
      latitude: 51.5074,
      longitude: -0.1278,
      authorName: "Charlie"
    }, "seed-charlie");

    await storage.createPost({
      content: "Coding late night in Tokyo",
      latitude: 35.6762,
      longitude: 139.6503,
      authorName: "Dave"
    }, "seed-dave");

    console.log("Database seeded!");
  }
}
