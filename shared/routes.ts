
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
          goModeExpiresAt: z.string().nullable(),
          bio: z.string().nullable(),
          avatar: z.string().nullable(),
          instagram: z.string().nullable(),
          twitter: z.string().nullable(),
          tiktok: z.string().nullable(),
          snapchat: z.string().nullable(),
          linkedin: z.string().nullable(),
          facebook: z.string().nullable(),
          website: z.string().nullable(),
          isBoosted: z.boolean(),
          boostExpiresAt: z.string().nullable(),
          coins: z.number(),
        }),
      },
    },
    byUsername: {
      method: 'GET' as const,
      path: '/api/users/:username' as const,
      responses: {
        200: z.object({
          id: z.number(),
          username: z.string(),
          bio: z.string().nullable(),
          avatar: z.string().nullable(),
          instagram: z.string().nullable(),
          twitter: z.string().nullable(),
          tiktok: z.string().nullable(),
          snapchat: z.string().nullable(),
          linkedin: z.string().nullable(),
          facebook: z.string().nullable(),
          website: z.string().nullable(),
          isGoMode: z.boolean(),
          isBoosted: z.boolean(),
        }),
        404: z.object({ message: z.string() }),
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
        tiktok: z.string().optional(),
        snapchat: z.string().optional(),
        linkedin: z.string().optional(),
        facebook: z.string().optional(),
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
    block: {
      method: 'POST' as const,
      path: '/api/users/block' as const,
      input: z.object({
        blockedId: z.number(),
        reason: z.string().optional(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    unblock: {
      method: 'POST' as const,
      path: '/api/users/unblock' as const,
      input: z.object({
        blockedId: z.number(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    report: {
      method: 'POST' as const,
      path: '/api/users/report' as const,
      input: z.object({
        reportedUserId: z.number(),
        reason: z.enum(["harassment", "inappropriate", "spam", "stalking", "other"]),
        details: z.string().optional(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
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
