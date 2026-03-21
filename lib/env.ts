const optional = {
  bootstrapBusinessName: process.env.APP_BOOTSTRAP_BUSINESS_NAME || 'Mi estudio previsional',
  bootstrapOwnerName: process.env.APP_BOOTSTRAP_OWNER_NAME || 'Administrador',
  bootstrapAdminEmail: process.env.APP_BOOTSTRAP_ADMIN_EMAIL || '',
};

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getDatabaseUrl() {
  return requireEnv('DATABASE_URL');
}

export function getSupabaseUrl() {
  return requireEnv('NEXT_PUBLIC_SUPABASE_URL');
}

export function getSupabaseAnonKey() {
  return requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export function getOptionalBootstrapConfig() {
  return optional;
}
