"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function updateAgreementInternalNotes(
  id: string,
  formData: FormData,
) {
  const rawNotes = formData.get("internalNotes");
  const internalNotes = typeof rawNotes === "string" ? rawNotes.trim() : "";

  await prisma.maintenanceAgreement.update({
    where: {
      id,
    },
    data: {
      internalNotes: internalNotes || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/agreements");
  revalidatePath(`/agreements/${id}`);
  revalidatePath("/clients");
  redirect(`/agreements/${id}`);
}
