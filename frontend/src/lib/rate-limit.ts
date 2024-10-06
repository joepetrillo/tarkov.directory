import { db } from "@/lib/db";
import { rateLimitTable } from "@/schema";
import { eq } from "drizzle-orm";

export class RateLimit {
  private window: number;
  private max: number;

  constructor({ window, max }: { window: number; max: number }) {
    this.window = window;
    this.max = max;
  }

  async limit(
    identifier: string,
  ): Promise<{ success: boolean; timeRemaining?: string }> {
    const result = await db.transaction(
      async (tx) => {
        const now = new Date();
        const currentRecord = await db.query.rateLimitTable.findFirst({
          where: eq(rateLimitTable.identifier, identifier),
        });

        if (!currentRecord) {
          await tx.insert(rateLimitTable).values({
            identifier,
            count: 1,
            lastReset: now,
            window: this.window,
            max: this.max,
          });
          return { success: true };
        }

        const needsUpdate =
          currentRecord.window !== this.window ||
          currentRecord.max !== this.max;
        const windowExpired =
          now >
          new Date(currentRecord.lastReset.getTime() + this.window * 1000);

        if (windowExpired) {
          await tx
            .update(rateLimitTable)
            .set({
              count: 1,
              lastReset: now,
              window: this.window,
              max: this.max,
            })
            .where(eq(rateLimitTable.identifier, identifier));
          return { success: true };
        } else if (currentRecord.count < this.max) {
          await tx
            .update(rateLimitTable)
            .set({
              count: currentRecord.count + 1,
              window: this.window,
              max: this.max,
            })
            .where(eq(rateLimitTable.identifier, identifier));
          return { success: true };
        } else if (needsUpdate) {
          await tx
            .update(rateLimitTable)
            .set({
              window: this.window,
              max: this.max,
            })
            .where(eq(rateLimitTable.identifier, identifier));
        }

        const resetTime = new Date(
          currentRecord.lastReset.getTime() + this.window * 1000,
        );
        const timeRemaining = this.formatTimeRemaining(
          resetTime.getTime() - now.getTime(),
        );
        return { success: false, timeRemaining };
      },
      {
        isolationLevel: "serializable",
      },
    );

    return result;
  }

  private formatTimeRemaining(milliseconds: number): string {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? "s" : ""}`;
    }
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
    const hours = Math.ceil(minutes / 60);
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
}
