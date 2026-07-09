"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function revalidateRequestPaths(id: string) {
  revalidatePath("/");
  revalidatePath("/requests");
  revalidatePath(`/requests/${id}`);
}

export async function markRequestContacted(id: string) {
  await prisma.systemRequest.update({
    where: {
      id,
    },
    data: {
      contacted: true,
    },
  });

  revalidateRequestPaths(id);
  redirect(`/requests/${id}`);
}

export async function markRequestUncontacted(id: string) {
  await prisma.systemRequest.update({
    where: {
      id,
    },
    data: {
      contacted: false,
    },
  });

  revalidateRequestPaths(id);
  redirect(`/requests/${id}`);
}
