import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getOptionalBootstrapConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserContext } from "@/lib/types/app";

async function bootstrapAdmin(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const config = getOptionalBootstrapConfig();
  const email = (authUser.email || "").toLowerCase();
  const canBootstrap = config.bootstrapAdminEmail.length > 0 && email === config.bootstrapAdminEmail.toLowerCase();

  if (canBootstrap === false) {
    return null;
  }

  return db.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      where: { id: authUser.id },
      include: { business: true },
    });

    if (existing) {
      return existing;
    }

    const business = await tx.businessSettings.create({
      data: {
        businessName: config.bootstrapBusinessName,
        ownerName: config.bootstrapOwnerName,
      },
    });

    return tx.user.create({
      data: {
        id: authUser.id,
        businessId: business.id,
        email,
        fullName: String(authUser.user_metadata?.full_name || config.bootstrapOwnerName),
        role: UserRole.ADMIN,
      },
      include: { business: true },
    });
  });
}

export async function getCurrentUserContext(): Promise<UserContext | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || data.user?.id === undefined) {
    return null;
  }

  let profile = await db.user.findUnique({
    where: { id: data.user.id },
    include: { business: true },
  });

  if (profile === null) {
    profile = await bootstrapAdmin(data.user);
  }

  if (profile === null) {
    return null;
  }

  return {
    userId: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
    businessId: profile.businessId,
    businessName: profile.business.businessName,
    ownerName: profile.business.ownerName,
  };
}

export async function requireUserContext() {
  const context = await getCurrentUserContext();

  if (context === null) {
    redirect("/login");
  }

  return context;
}

export async function requireAdminContext() {
  const context = await requireUserContext();

  if (context.role === UserRole.OPERATOR) {
    redirect("/");
  }

  return context;
}
