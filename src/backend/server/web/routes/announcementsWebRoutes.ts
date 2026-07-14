import type { FastifyInstance } from "fastify";
import { and, desc, eq, isNull, lte, or, gt } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { systemAnnouncements } from "../../../db/announcementsSchema.js";

export async function registerAnnouncementsWebRoutes(server: FastifyInstance): Promise<void> {
  server.get("/api/announcements", async () => {
    const now = new Date();

    const activeAnnouncements = await db
      .select({
        announcementId: systemAnnouncements.announcementId,
        kind: systemAnnouncements.kind,
        content: systemAnnouncements.content,
        isDismissible: systemAnnouncements.isDismissible,
        priority: systemAnnouncements.priority,
        startsAt: systemAnnouncements.startsAt,
        expiresAt: systemAnnouncements.expiresAt,
      })
      .from(systemAnnouncements)
      .where(
        and(
          eq(systemAnnouncements.isEnabled, true),
          isNull(systemAnnouncements.archivedAt),
          or(
            isNull(systemAnnouncements.startsAt),
            lte(systemAnnouncements.startsAt, now)
          ),
          or(
            isNull(systemAnnouncements.expiresAt),
            gt(systemAnnouncements.expiresAt, now)
          )
        )
      )
      .orderBy(
        desc(systemAnnouncements.priority),
        desc(systemAnnouncements.startsAt),
        desc(systemAnnouncements.createdAt)
      );

    return { announcements: activeAnnouncements };
  });
}
