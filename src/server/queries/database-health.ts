import { prisma } from "@/lib/prisma";

export type DatabaseHealthResult = {
    connected: boolean;
    databaseName?: string;
    serverTime?: Date;
    error?: string;
};

type HealthRow = {
    database_name: string;
    server_time: Date;
};

export async function getDatabaseHealth(): Promise<DatabaseHealthResult> {
    try {
        const result = await prisma.$queryRaw<HealthRow[]>`
      SELECT current_database() AS database_name, NOW() AS server_time;
    `;

        const row = result[0];

        return {
            connected: true,
            databaseName: row?.database_name,
            serverTime: row?.server_time,
        };
    } catch (error) {
        return {
            connected: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown database connection error",
        };
    }
}