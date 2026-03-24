import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getOptionalBootstrapConfig } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { UserContext } from '@/lib/types/app';

async function bootstrapAdmin(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const config = getOptionalBootstrapConfig();
  const email = (authUser.email || '').toLowerCase();
  const canBootstrap = config.bootstrapAdminEmail.length > 0 && email === config.bootstrapAdminEmail.toLowerCase();

  console.log('[auth] bootstrapAdmin check', {
    authUserId: authUser.id,
    email,
    canBootstrap,
  });

  if (canBootstrap === false) {
    return null;
  }

  return db.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      where: { id: authUser.id },
      include: { business: true },
    });

    if (existing) {
      console.log('[auth] bootstrapAdmin existing user found', { userId: existing.id });
      return existing;
    }

    const business = await tx.businessSettings.create({
      data: {
        businessName: config.bootstrapBusinessName,
        ownerName: config.bootstrapOwnerName,
      },
    });

    console.log('[auth] bootstrapAdmin business created', { businessId: business.id });

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
  console.log('[auth] getCurrentUserContext start');

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    console.log('[auth] supabase.auth.getUser result', {
      hasError: Boolean(error),
      errorMessage: error?.message ?? null,
      userId: data.user?.id ?? null,
      email: data.user?.email ?? null,
    });

    if (error || data.user?.id === undefined) {
      return null;
    }

    let profile = await db.user.findUnique({
      where: { id: data.user.id },
      include: { business: true },
    });

    console.log('[auth] prisma user lookup result', {
      userId: data.user.id,
      found: profile !== null,
    });

    if (profile === null) {
      profile = await bootstrapAdmin(data.user);
      console.log('[auth] bootstrap result', {
        created: profile !== null,
        userId: profile?.id ?? null,
      });
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
  } catch (error) {
    console.error('[auth] getCurrentUserContext crash', error);
    throw error;
  }
}

export async function requireUserContext() {
  const context = await getCurrentUserContext();

  console.log('[auth] requireUserContext result', {
    hasContext: context !== null,
    userId: context?.userId ?? null,
  });

  if (context === null) {
    console.log('[auth] requireUserContext redirect /login');
    redirect('/login');
  }

  return context;
}

export async function requireAdminContext() {
  const context = await requireUserContext();

  if (context.role === UserRole.OPERATOR) {
    console.log('[auth] requireAdminContext redirect / because role is OPERATOR', {
      userId: context.userId,
    });
    redirect('/');
  }

  return context;
}
