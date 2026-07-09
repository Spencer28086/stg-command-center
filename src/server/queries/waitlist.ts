import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const waitlistSelect = {
    id: true,
    email: true,
    createdAt: true,
} satisfies Prisma.WaitlistSelect;

export type WaitlistEntry = Prisma.WaitlistGetPayload<{
    select: typeof waitlistSelect;
}>;

export async function getWaitlist() {
    const now = Date.now();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [entries, totalCount, last7Days, last30Days] =
        await prisma.$transaction([
            prisma.waitlist.findMany({
                select: waitlistSelect,
                orderBy: {
                    createdAt: "desc",
                },
                take: 200,
            }),
            prisma.waitlist.count(),
            prisma.waitlist.count({
                where: {
                    createdAt: { gte: sevenDaysAgo },
                },
            }),
            prisma.waitlist.count({
                where: {
                    createdAt: { gte: thirtyDaysAgo },
                },
            }),
        ]);

    return {
        entries,
        counts: {
            total: totalCount,
            last7Days,
            last30Days,
        },
    };
}
