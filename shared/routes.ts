
import { z } from 'zod';
import { insertPostSchema, posts, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    me: {
      method: 'GET' as const,
      path: '/api/me' as const,
      responses: {
        200: z.object({
          id: z.number(),
          username: z.string(),
          isGoMode: z.boolean(),
          bio: z.string().nullable(),
          avatar: z.string().nullable(),
          instagram: z.string().nullable(),
          twitter: z.string().nullable(),
          website: z.string().nullable(),
          isBoosted: z.boolean(),
          boostExpiresAt: z.string().nullable(),
          coins: z.number(),
        }),
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/users/status' as const,
      input: z.object({
        isGoMode: z.boolean().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        bio: z.string().optional(),
        instagram: z.string().optional(),
        twitter: z.string().optional(),
        website: z.string().optional(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    nearby: {
      method: 'GET' as const,
      path: '/api/users/nearby' as const,
      responses: {
        200: z.array(z.object({
          id: z.number(),
          username: z.string(),
          latitude: z.number(),
          longitude: z.number(),
        })),
      },
    },
  },
  shop: {
    purchaseBoost: {
      method: 'POST' as const,
      path: '/api/shop/boost' as const,
      input: z.object({
        boostType: z.enum(["boost-1hr", "boost-6hr", "boost-24hr"]),
      }),
      responses: {
        200: z.object({ success: z.boolean(), boostExpiresAt: z.string() }),
        400: errorSchemas.validation,
      },
    },
  },
  posts: {
    list: {
      method: 'GET' as const,
      path: '/api/posts' as const,
      responses: {
        200: z.array(z.custom<typeof posts.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/posts' as const,
      input: insertPostSchema,
      responses: {
        201: z.custom<typeof posts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
