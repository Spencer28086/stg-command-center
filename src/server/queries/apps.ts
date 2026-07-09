import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const appDownloadSelect = {
    id: true,
    slug: true,
    name: true,
    description: true,
    version: true,
    fileUrl: true,
    imageUrl: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.AppDownloadSelect;

export type AppDownloadItem = Prisma.AppDownloadGetPayload<{
    select: typeof appDownloadSelect;
}>;

export async function getAppDownloads() {
    const [apps, totalCount, activeCount] = await prisma.$transaction([
        prisma.appDownload.findMany({
            select: appDownloadSelect,
            orderBy: {
                createdAt: "desc",
            },
        }),
        prisma.appDownload.count(),
        prisma.appDownload.count({
            where: {
                isActive: true,
            },
        }),
    ]);

    return {
        apps,
        counts: {
            total: totalCount,
            active: activeCount,
            inactive: totalCount - activeCount,
        },
    };
}
