import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'drishti_jwt_fallback_secret_accessibility',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  supabase: {
    url: process.env.SUPABASE_URL || 'https://wicascsluggzcvynzvom.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'drishti-scans',
  },
  ai: {
    provider: (process.env.AI_PROVIDER || 'gemini').toLowerCase(),
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-3.8-flash',
    apiUrl: process.env.AI_API_URL || '',
  }
};
