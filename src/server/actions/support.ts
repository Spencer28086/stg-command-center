"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const allowedPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

function revalidateSupportPaths(id: string) {
  revalidatePath("/");
  revalidatePath("/support");
  revalidatePath(`/support/${id}`);
}

export async function resolveSupportTicket(id: string) {
  await prisma.supportTicket.update({
    where: {
      id,
    },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
    },
  });

  revalidateSupportPaths(id);
  redirect(`/support/${id}`);
}

export async function reopenSupportTicket(id: string) {
  await prisma.supportTicket.update({
    where: {
      id,
    },
    data: {
      status: "OPEN",
      resolvedAt: null,
    },
  });

  revalidateSupportPaths(id);
  redirect(`/support/${id}`);
}

export async function updateSupportTicketPriority(
  id: string,
  priority: string,
) {
  if (!allowedPriorities.includes(priority as (typeof allowedPriorities)[number])) {
    throw new Error("Invalid support ticket priority.");
  }

  await prisma.supportTicket.update({
    where: {
      id,
    },
    data: {
      priority,
    },
  });

  revalidateSupportPaths(id);
  redirect(`/support/${id}`);
}
